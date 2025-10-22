import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../database';
import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { updatePropertySchema } from '../../validations/propertyValidation';

describe('Property Routes - Integration Tests', () => {
    let token;
    let otherToken;
    let testUser;
    let otherUser;

    beforeEach(async () => {
        const hashedPassword = await hash('Password123', 10);
        testUser = await prisma.user.create({
            data: {
                name: 'Usuário Teste Dono',
                email: 'dono@test.com',
                password: hashedPassword,
                cpf: '111.111.111-11',
            }
        });

        otherUser = await prisma.user.create({
            data: {
                name: 'Outro Usuário',
                email: 'outro@test.com',
                password: hashedPassword,
                cpf: '222.222.222-22',
            },
        });

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET não está definido!');
        }

        const payload = { 
            userId: testUser.id, 
            email: testUser.email 
        };
        token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        
        const otherPayload = { 
            userId: otherUser.id, 
            email: otherUser.email 
        };
        otherToken = jwt.sign(otherPayload, jwtSecret, { expiresIn: '1h' });
    });

    afterEach(async () => {
        await prisma.propertyValuation.deleteMany({});
        await prisma.clientValuation.deleteMany({});
        await prisma.payment.deleteMany({});
        await prisma.propertyImage.deleteMany({});
        await prisma.reserve.deleteMany({});
        await prisma.property.deleteMany({});
        await prisma.phone.deleteMany({});
        await prisma.user.deleteMany({});
    });      

    const propertyData = {
        type: 'Casa',
        description: 'Casa de teste com piscina',
        numberOfBedroom: 3,
        numberOfSuite: 1,
        numberOfGarage: 2,
        numberOfRoom: 2,
        numberOfBathroom: 3,
        outdoorArea: true,
        pool: true,
        barbecue: true,
        street: 'Rua Teste',
        number: 123,
        neighborhood: 'Bairro Teste',
        state: 'SP',
        city: 'São Paulo',
        CEP: '01001-000',
        dailyRate: 350.0,
    };

    describe('POST /property', () => {
        it('should create a new property with images', async () => {
            const response = await request(app)
                .post('/property')
                .set('Authorization', `Bearer ${token}`)
                .field('type', propertyData.type)
                .field('description', propertyData.description)
                .field('numberOfBedroom', propertyData.numberOfBedroom)
                .field('numberOfSuite', propertyData.numberOfSuite)
                .field('numberOfGarage', propertyData.numberOfGarage)
                .field('numberOfRoom', propertyData.numberOfRoom)
                .field('numberOfBathroom', propertyData.numberOfBathroom)
                .field('outdoorArea', propertyData.outdoorArea)
                .field('pool', propertyData.pool)
                .field('barbecue', propertyData.barbecue)
                .field('street', propertyData.street)
                .field('number', propertyData.number)
                .field('neighborhood', propertyData.neighborhood)
                .field('state', propertyData.state)
                .field('city', propertyData.city)
                .field('CEP', propertyData.CEP)
                .field('dailyRate', propertyData.dailyRate)
                .attach(
                    'images',
                    Buffer.from('fake-image-data-1'),
                    'test-image1.jpg'
                );
                
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.description).toBe(propertyData.description);
            expect(response.body.user.id).toBe(testUser.id);
            expect(response.body.images).toBeInstanceOf(Array);
            expect(response.body.images).toHaveLength(1);
            expect(response.body.images[0]).toHaveProperty('id');
        });

        it('should return 400 if validation fails', async () => {
            const response = await request(app)
                .post('/property')
                .field('type', propertyData.type)
                .field('description', propertyData.description);
            
            expect(response.status).toBe(401);
        });

        it('should return 400 if validation fails (e.g., bad CEP)', async () => {
            const response = await request(app)
                .post('/property')
                .set('Authorization', `Bearer ${token}`)
                .field('type', propertyData.type)
                .field('description', propertyData.description)
                .field('numberOfBedroom', propertyData.numberOfBedroom)
                .field('numberOfSuite', propertyData.numberOfSuite)
                .field('numberOfGarage', propertyData.numberOfGarage)
                .field('numberOfRoom', propertyData.numberOfRoom)
                .field('numberOfBathroom', propertyData.numberOfBathroom)
                .field('outdoorArea', propertyData.outdoorArea)
                .field('pool', propertyData.pool)
                .field('barbecue', propertyData.barbecue)
                .field('street', propertyData.street)
                .field('number', propertyData.number)
                .field('neighborhood', propertyData.neighborhood)
                .field('state', propertyData.state)
                .field('city', propertyData.city)
                .field('CEP', 'CEP-INVALIDO')
                .field('dailyRate', propertyData.dailyRate);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error).toContain('CEP'); 
        });
    });

    describe('GET /property/:id', () => {
        it('should return a specific property by id', async () => {
            const property = await prisma.property.create({
                data:{
                    ...propertyData,
                    userId: testUser.id
                }
            });
            const response = await request(app).get(`/property/${property.id}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(property.id);
        });

        it( 'sholud return 404 if property does not exist', async () => {
            const nonExistentId = 'clxjhg82z00001234abcd1234';
            const response = await request(app).get(`/property/${nonExistentId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /property/:id', () => {
        it('should update property data if user is the owner', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            const updateData = { 
                ...propertyData,
                description: 'Descrição Atualizada', 
                dailyRate: 500 
            };
            const response = await request(app)
                .put(`/property/${property.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.description).toBe('Descrição Atualizada');
        });

        it('should return 403 if user is not the owner', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            const updateData = { 
                ...propertyData,
                description: 'Tentativa de Hack' 
            };
            const response = await request(app)
                .put(`/property/${property.id}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send(updateData);
            expect(response.status).toBe(403);
        });

        it('should return 404 if property does not exist', async () => {
            const nonExistentId = 'clxjhg82z00001234abcd1234';
            const updateData = {
                ...propertyData,
                description: 'Descrição Atualizada', 
            }
            const response = await request(app)
                .put(`/property/${nonExistentId}/images`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
            
            expect(response.status).toBe(404);
            expect(response.body.error).toContain('Imóvel não existe');
        });

        it('should return 401 if no token is provided', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            const updateData = { ...propertyData, description: 'Update sem token' };
            const response = await request(app)
                .put(`/property/${property.id}`)
                .send(updateData);
            
            expect(response.status).toBe(401);
        });

        it('should return 400 if validation fails', async () => {
            const property = await prisma.property.create({
                data: {
                    ...propertyData,
                    userId: testUser.id
                }
            });
            const updateData = {};

            const response = await request(app)
                .put(`/property/${property.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('"type" is required');
        });
    });

    describe('PUT /property/:id/images', () => {
        it('should update (replace) images if user is the owner', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            await prisma.propertyImage.create({ data: { image: Buffer.from('old-image'), propertyId: property.id }});
            const response = await request(app)
                .put(`/property/${property.id}/images`)
                .set('Authorization', `Bearer ${token}`)
                .attach('images', Buffer.from('new-image-1'), 'new1.jpg')
                .attach('images', Buffer.from('new-image-2'), 'new2.jpg');
            expect(response.status).toBe(200);
            expect(response.body.images).toHaveLength(2);
        });

        it('should return 403 if user is not the owner', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            const response = await request(app)
                .put(`/property/${property.id}/images`)
                .set('Authorization', `Bearer ${otherToken}`)
                .attach('images', Buffer.from('hack-image'), 'hack.jpg');
            expect(response.status).toBe(403);
        });

        it('should remove all images if an empty array is sent', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            await prisma.propertyImage.create({ data: { image: Buffer.from('old-image'), propertyId: property.id }});

            const response = await request(app)
                .put(`/property/${property.id}/images`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(200);
            expect(response.body.images).toHaveLength(0);
            const imagesInDb = await prisma.propertyImage.findMany({ where: { propertyId: property.id }});
            expect(imagesInDb).toHaveLength(0);
        });

        it('should return 401 if no token is provided', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            const response = await request(app)
                .put(`/property/${property.id}/images`)
                .attach('images', Buffer.from('image'), 'img.jpg');
            
            expect(response.status).toBe(401);
        });

        it('should return 404 if property does not exist', async () => {
            const nonExistentId = 'clxjhg82z00001234abcd1234';
            const response = await request(app)
                .put(`/property/${nonExistentId}/images`)
                .set('Authorization', `Bearer ${token}`)
                .attach('images', Buffer.from('image'), 'img.jpg');
            
            expect(response.status).toBe(404);
            expect(response.body.error).toContain('Imóvel não existe');
        });
    });

    describe('DELETE /property/:id', () => {
        it('should delete a property if user is the owner', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            const response = await request(app)
                .delete(`/property/${property.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(204);
        });

        it('should return 403 if user is not the owner', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            const response = await request(app)
                .delete(`/property/${property.id}`)
                .set('Authorization', `Bearer ${otherToken}`);
            expect(response.status).toBe(403);
        });

        it('should return 404 if property does not exist', async () => {
            const nonExistentId = 'clxjhg82z00001234abcd1234';
            const response = await request(app)
                .delete(`/property/${nonExistentId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(404);
        });

        it('should return 401 if no token is provided', async () => {
            const property = await prisma.property.create({ data: { ...propertyData, userId: testUser.id } });
            const response = await request(app)
                .delete(`/property/${property.id}`);
            
            expect(response.status).toBe(401);
        });
    });

    describe('GET /property/available', () => {
        it('should find avalable properties between dates', async () => {
            const prop1 = await prisma.property.create({
                data:{
                    ...propertyData,
                    userId: testUser.id,
                    type: "Apto", 
                    CEP: '12345-001'
                }
            });
            const prop2 = await prisma.property.create({
                data:{
                    ...propertyData,
                    userId: testUser.id,
                    type: "Casa", 
                    CEP: '12345-002'
                }
            });

            await prisma.reserve.create({
                data: {
                    dateStart: new Date('2025-11-10T14:00:00Z'),
                    dateEnd: new Date('2025-11-15T11:00:00Z'),
                    status: 'CONFIRMADA',
                    propertyId: prop2.id,
                    userId: testUser.id,
                }
            });

            const dateStart = '2025-11-12T00:00:00Z';
            const dateEnd = '2025-11-14T00:00:00Z';
            const response = await request(app)
                .get(`/property/available?dateStart=${dateStart}&dateEnd=${dateEnd}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].id).toBe(prop1.id);
        });

        it('should return 400 if dates are missing', async () => {
            const response = await request(app)
                .get('/property/available?dateStart=2025-11-12T00:00:00Z');
            
            expect(response.status).toBe(400);
        });
    });

    describe('GET /property/rank-by-valuation', () => {
        it('should return properties ranked by average valuation', async () => {
            const prop1 = await prisma.property.create({ 
                data: { 
                    ...propertyData, 
                    userId: testUser.id, 
                    type: "Rank 1", 
                    CEP: '12345-001' 
                } 
            });
            const prop2 = await prisma.property.create({ 
                data: { ...propertyData, 
                    userId: otherUser.id, 
                    type: "Rank 2", 
                    CEP: "12345-002" 
                } 
            });
            const res1_prop1 = await prisma.reserve.create({ 
                data: { 
                    dateStart: new Date(), 
                    dateEnd: new Date(), 
                    status: 'FINALIZADA', 
                    propertyId: prop1.id, 
                    userId: otherUser.id 
                }
            });
            const res2_prop1 = await prisma.reserve.create({ 
                data: { 
                    dateStart: new Date(), 
                    dateEnd: new Date(), 
                    status: 'FINALIZADA', 
                    propertyId: prop1.id, 
                    userId: otherUser.id 
                }
            });
            const res1_prop2 = await prisma.reserve.create({ 
                data: { 
                    dateStart: new Date(), 
                    dateEnd: new Date(), 
                    status: 'FINALIZADA', 
                    propertyId: prop2.id, 
                    userId: testUser.id 
                }
            });
            await prisma.propertyValuation.create({ 
                data: { 
                    noteProperty: 3.0, 
                    reserveId: res1_prop1.id 
                }
            });
            await prisma.propertyValuation.create({ 
                data: { 
                    noteProperty: 5.0, 
                    reserveId: res2_prop1.id 
                }
            });
            await prisma.propertyValuation.create({ 
                data: { 
                    noteProperty: 5.0, 
                    reserveId: res1_prop2.id 
                }
            });
            const response = await request(app)
                .get('/property/ranked-by-valuation');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].type).toBe("Rank 2");
            expect(response.body[1].type).toBe("Rank 1");
        });

        it('should exclude properties with no valuations from rank', async () => {
            const prop1 = await prisma.property.create({ 
                data: { 
                    ...propertyData, 
                    userId: testUser.id, 
                    type: "Com Avaliação", 
                    CEP: '12345-001' 
                } 
            });
            const res1_prop1 = await prisma.reserve.create({ 
                data: { 
                    dateStart: new Date(), 
                    dateEnd: new Date(), 
                    status: 'FINALIZADA', 
                    propertyId: prop1.id, 
                    userId: otherUser.id 
                }
            });
            await prisma.propertyValuation.create({ 
                data: { 
                    noteProperty: 4.0, 
                    reserveId: res1_prop1.id 
                }
            });
            const prop2 = await prisma.property.create({ 
                data: 
                { 
                    ...propertyData, 
                    userId: otherUser.id, 
                    type: "Sem Avaliação", 
                    CEP: "12345-002" 
                } 
            });
            await prisma.reserve.create({ 
                data: { 
                    dateStart: new Date(), 
                    dateEnd: new Date(), 
                    status: 'FINALIZADA', 
                    propertyId: prop2.id, 
                    userId: testUser.id 
                }
            });

            const response = await request(app)
                .get('/property/ranked-by-valuation');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1); 
            expect(response.body[0].type).toBe("Com Avaliação");
        });

        it('should return an empty array if no properties have valuations', async () => {
            await prisma.property.create({ 
                data: { 
                    ...propertyData, 
                    userId: testUser.id, 
                    type: "Sem Avaliação", 
                    CEP: '12345-001' 
                } 
            });

            const response = await request(app)
                .get('/property/ranked-by-valuation');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0); 
        });
    });

    describe('GET /property/:propertyId/images', () => {
        it('should return all images for a specific property', async () => {
            const property = await prisma.property.create({ 
                data: { 
                    ...propertyData, 
                    userId: testUser.id 
                } 
            });
            await prisma.propertyImage.create({ 
                data: { 
                    image: Buffer.from('img1'), 
                    propertyId: property.id 
                }
            });
            await prisma.propertyImage.create({ 
                data: { 
                    image: Buffer.from('img2'), 
                    propertyId: property.id 
                }
            });
            const response = await request(app)
                .get(`/property/${property.id}/images`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        it('should return 404 if property has no images', async () => {
            const property = await prisma.property.create({ 
                data: { 
                    ...propertyData, 
                    userId: testUser.id 
                } 
            });
            const response = await request(app)
                .get(`/property/${property.id}/images`);
            expect(response.status).toBe(404);
        });

         it('should return 404 if property does not exist', async () => {
            const nonExistentId = 'clxjhg82z00001234abcd1234';
            const response = await request(app)
                .get(`/property/${nonExistentId}/images`);
            expect(response.status).toBe(404);
        });
    });
});