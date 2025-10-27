import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../database.js';
import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';

const propertyData1 = {
    type: 'Casa',
    description: 'Casa de teste para reservas',
    numberOfBedroom: 3,
    numberOfSuite: 1,
    numberOfGarage: 2,
    numberOfRoom: 2,
    numberOfBathroom: 3,
    outdoorArea: true,
    pool: true,
    barbecue: true,
    street: 'Rua Teste Reserva',
    number: 123,
    neighborhood: 'Bairro Teste Reserva',
    state: 'SP',
    city: 'São Paulo',
    CEP: '01001-001',
    dailyRate: 350.0,
};

const propertyData2 = {
    type: 'Sitio',
    description: 'Sítio para a família',
    numberOfBedroom: 3,
    numberOfSuite: 1,
    numberOfGarage: 2,
    numberOfRoom: 2,
    numberOfBathroom: 3,
    outdoorArea: true,
    pool: true,
    barbecue: true,
    street: 'Rua 2',
    number: 123,
    neighborhood: 'Bairro rio verde',
    state: 'BH',
    city: 'Belo Horizonte',
    CEP: '01001-001',
    dailyRate: 350.0,
};

const propertyData3 = {
    type: 'Apartamento',
    description: 'Apartamento muito bom',
    numberOfBedroom: 3,
    numberOfSuite: 1,
    numberOfGarage: 2,
    numberOfRoom: 2,
    numberOfBathroom: 3,
    outdoorArea: true,
    pool: true,
    barbecue: true,
    street: 'Rua 3',
    number: 123,
    neighborhood: 'Bairro flor',
    state: 'RJ',
    city: 'Rio de Janeiro',
    CEP: '01002-001',
    dailyRate: 500.0,
};

describe('ClientValuation Routes - Integration test', () => {
    let ownerToken, renterToken, randomToken;
    let owner, renter, randomUser;
    let property1, property2, property3, reserve1, reserve2, reserve3;

    beforeEach(async () => {
        const hashedPassword = await hash('Password123', 10);

        owner = await prisma.user.create({
            data:{
                name: 'Usuário Dono',
                email: 'owner-reserve@test.com',
                password: hashedPassword,
                cpf: '111.111.111-11'
            }
        });

        renter = await prisma.user.create({
            data: {
                name:'Usuário Hóspede',
                email: 'hospede-reserve@test.com',
                password: hashedPassword,
                cpf: '222.222.222-22'
            }
        });

        randomUser = await prisma.user.create({
            data: {
                name: 'Usuário Aleatório',
                email: 'random-reserve@test.com',
                password: hashedPassword,
                cpf: '333.333.333-33',
            },
        });

        const jwtSecret = process.env.JWT_SECRET;
        if(!jwtSecret){
            throw new Error("JWT_SECRET não está definido!");
        }

        ownerToken = jwt.sign(
            {userId: owner.id, email: owner.email},
            jwtSecret,
            {expiresIn: '1h'}
        );

        renterToken = jwt.sign(
            {userId: renter.id, email: renter.email},
            jwtSecret,
            {expiresIn: '1h'}
        );

        randomToken = jwt.sign(
            {userId: randomUser.id, email: randomUser.email},
            jwtSecret,
            {expiresIn: '1h'}
        );

        property1 = await prisma.property.create({
            data: {
                ...propertyData1,
                userId: owner.id
            }
        });

        property2 = await prisma.property.create({
            data: {
                ...propertyData2,
                userId: owner.id
            }
        });

        property3 = await prisma.property.create({
            data: {
                ...propertyData3,
                userId: owner.id
            }
        });

        reserve1 = await prisma.reserve.create({
            data:{
                propertyId: property2.id,
                userId: renter.id,
                dateStart: new Date('2026-01-10T14:00:00Z').toISOString(),
                dateEnd: new Date('2026-01-15T11:00:00Z').toISOString(),
                status: 'CONFIRMADA'
            }
        });

        reserve2 = await prisma.reserve.create({
            data:{
                propertyId: property1.id,
                userId: renter.id,
                dateStart: new Date('2026-01-20T14:00:00Z').toISOString(),
                dateEnd: new Date('2026-01-29T11:00:00Z').toISOString(),
                status: 'CONFIRMADA'
            }
        });

        reserve3 = await prisma.reserve.create({
            data:{
                propertyId: property2.id,
                userId: randomUser.id,
                dateStart: new Date('2026-01-16T14:00:00Z').toISOString(),
                dateEnd: new Date('2026-01-20T11:00:00Z').toISOString(),
                status: 'CONFIRMADA'
            }
        });
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

    describe('POST /reserve/reserveId/client-valuation', () => {
        it('should create a client valuation', async () => {
            const valuationData = {
                noteClient: 5,
                commentClient: 'otimo cliente',
            };
    
            const response = await request(app)
                .post(`/reserve/${reserve1.id}/client-valuation`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(valuationData);

            expect(response.status).toBe(200);
            expect(response.body.reserveId).toBe(reserve1.id);

            const clientValuationInDb = await prisma.clientValuation.findUnique({
                where: { id: response.body.id }
            });

            expect(clientValuationInDb).not.toBeNull();
            expect(clientValuationInDb.reserveId).toBe(reserve1.id);
        });

        it('should resturn 409 if client already valuated', async () => {
            await prisma.clientValuation.create({
               data: {
                    reserveId: reserve1.id,
                    noteClient: 5,
                    commentClient: 'otimo cliente',
               }
            });

            const valuationData = {
                noteClient: 5,
                commentClient: 'cliente muito bom',
            };

            const response = await request(app)
                .post(`/reserve/${reserve1.id}/client-valuation`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(valuationData);

            expect(response.status).toBe(409);
            expect(response.body.error).toContain('Este cliente já foi avaliado para esta reserva.');
        });

        it('should return 403 if if a different user tries to valuate the client', async () => {
            const valuationData = {
                noteClient: 5,
                commentClient: 'excelente cliente',
            };
    
            const response = await request(app)
                .post(`/reserve/${reserve1.id}/client-valuation`)
                .set('Authorization', `Bearer ${randomToken}`)
                .send(valuationData);

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('Ação não autorizada. Você não é o proprietário do imóvel desta reserva.');
        });

        it('should return 401 if oner is not authenticated',async () => {
            const valuationData = {
                noteClient: 5,
                commentClient: 'otimo cliente',
            };
    
            const response = await request(app)
                .post(`/reserve/${reserve1.id}/client-valuation`)
                .send(valuationData);

            expect(response.status).toBe(401);
        });

        it('should return 400 if validations fails', async () => {
            const valuationData = {
                noteClient: 10,
                commentClient: 'otimo cliente',
            };
    
            const response = await request(app)
                .post(`/reserve/${reserve1.id}/client-valuation`)
                .set('Authorization', `Bearer ${renterToken}`)
                .send(valuationData);

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /property-valuation/valuationId', () => {
        it('Should delete a valuation', async () => {
            const valuation = await prisma.clientValuation.create({
                data: {
                    reserveId: reserve1.id,
                    noteClient: 5,
                    commentClient: 'otimo cliente',
                }
            });
    
            const response = await request(app)
                .delete(`/reserve/${reserve1.id}/client-valuation/${valuation.id}`)
                .set('Authorization', `Bearer ${ownerToken}`)
    
            expect(response.status).toBe(204);
        });
    
        it('should return 403 if a different user tries to delete a valuate', async () => {
            const valuation = await prisma.clientValuation.create({
                data: {
                    reserveId: reserve1.id, 
                    noteClient: 5,
                    commentClient: 'otimo cliente',
                }
            });
    
            const response = await request(app)
                .delete(`/reserve/${reserve1.id}/client-valuation/${valuation.id}`)
                .set('Authorization', `Bearer ${randomToken}`)
    
            expect(response.status).toBe(403); 
            expect(response.body.error).toContain('Ação não autorizada');
        });
    });
});