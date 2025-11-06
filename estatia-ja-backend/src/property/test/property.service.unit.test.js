import { describe, vi, expect, it, beforeEach } from "vitest";
import { prisma } from '../../database';
import propertyService from '../service';
import Property from "../model";

vi.mock('../../database.js', () => ({
    prisma: {
        property: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
        },
        propertyImage: {
            createMany: vi.fn(),
            findMany: vi.fn(),
            deleteMany: vi.fn(),
        },
        propertyValuation: { 
            aggregate: vi.fn(),
        },
        $transaction: vi.fn(),
        $queryRaw: vi.fn(),
    },
}));

describe('test property service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createProperty', () => {
        it('should return a new property', async () => {
            const propertyTest = {
                type: 'Casa',
                description: 'Casa grande para toda família'
            };
            const imageBuffers = [
                Buffer.from('img1'),
                Buffer.from('img2')
            ];
            const userId = 'user-123';
            const newPropertyId = 'new-property-id-abc';

            const mockTx = {
                property: { create: vi.fn() },
                propertyImage: { createMany: vi.fn() },
            };

            mockTx.property.create.mockResolvedValue({ id: newPropertyId, ...propertyTest, userId });
            prisma.$transaction.mockImplementation(async (callback) => await callback(mockTx));

            const propertyWithImages = new Property({
                id: newPropertyId,
                ...propertyTest,
                images:[{ id: 'img-id-1' }, { id: 'img-id-2' }]
            });

            vi.spyOn(propertyService, 'getPropertyById').mockResolvedValueOnce(propertyWithImages);
            const result = await propertyService.createProperty(propertyTest, imageBuffers, userId );

            expect(prisma.$transaction).toHaveBeenCalledOnce();
            expect(mockTx.property.create).toHaveBeenLastCalledWith({ data: { ...propertyTest, userId }});
            expect(mockTx.propertyImage.createMany).toHaveBeenCalledWith({
                data: [
                    { image: imageBuffers[0], propertyId: newPropertyId },
                    { image: imageBuffers[1], propertyId: newPropertyId },
                ],
            });
            expect(propertyService.getPropertyById).toHaveBeenCalledWith(newPropertyId);
            expect(result).toEqual(propertyWithImages);
        });
    });

    describe('getPropertyById', () => {
        it('should return a property', async () => {
            const propertyId = 'prop-123';
            const propertyTest = {
                id: propertyId,
                type: 'Sítio',
                description: 'Lindo sítio no interior',
                images: [{ id: 'img-1' }],
                user: { id: 'user-1', name: 'Ana Silva', email: 'ana@silva.com' }
            };

            const mockAvgRating = {_avg: {noteProperty: 4.5 } };
        
            prisma.property.findUnique.mockResolvedValue(propertyTest);
            prisma.propertyValuation.aggregate.mockResolvedValue(mockAvgRating);

            const result = await propertyService.getPropertyById(propertyId);

            expect(prisma.property.findUnique).toHaveBeenCalledWith({
                where: { id: propertyId },
                include: {
                    images: true,
                    user: { select: { id: true, name: true, email: true } }
                }
            });
            expect(prisma.propertyValuation.aggregate).toHaveBeenCalledWith({
                _avg: { noteProperty: true },
                where: { reserve: { propertyId: propertyId } }
            });
            expect(result).toBeInstanceOf(Property);
            expect(result.id).toBe(propertyId);
            expect(result.avgRating).toBe(4.5);
        });

        it('should return as null if no rating exist', async () => {
            const propertyId = 'prop-456';
            const propertyTest = { id: propertyId, type: 'Casa', user: {} };

            const mockAvgRating = { _avg: { noteProperty: null } };

            prisma.property.findUnique.mockResolvedValue(propertyTest);
            prisma.propertyValuation.aggregate.mockResolvedValue(mockAvgRating);
            
            const result = await propertyService.getPropertyById(propertyId);

            expect(result).toBeInstanceOf(Property);
            expect(result.id).toBe(propertyId);
            expect(result.avgRating).toBeNull();
        });

        it('should return an error if property does not exists', async () => {
            const propertyId = 'non-exist-id';

            prisma.property.findUnique.mockResolvedValue(null);
            await expect(propertyService.getPropertyById(propertyId))
                .rejects
                .toThrow('Imóvel não existe');
                expect(prisma.propertyValuation.aggregate).not.toHaveBeenCalled();
        });
    });

    describe('getAllPropertyies', () => {
        it('should return a list of properties', async () => {
            const propertiesTest = [
                { id: 'prop-1', type: 'Casa', images: [] },
                { id: 'prop-2', type: 'Apartamento', images: [{ id: 'img-10' }] },
            ];
    
            prisma.property.findMany.mockResolvedValue(propertiesTest);
            const result = await propertyService.getAllProperties();

            expect(result).toHaveLength(2);
            expect(prisma.property.findMany).toHaveBeenCalledWith({
                include: { images: true } 
            });
            expect(result[0]).toBeInstanceOf(Property);
            expect(result[1]).toBeInstanceOf(Property);
            expect(result[1].id).toBe('prop-2');
        });

        it('should return an empty array if no properties are found', async () => {
            prisma.property.findMany.mockResolvedValue([]);
            const result = await propertyService.getAllProperties();
            expect(result).toEqual([]);
        });
    });

    describe('getAllImagesForProperty', () => {
        it('shoul return images if property and images exists', async () => {
            const propertyId = 'prop-with-images';
            const mockImages = [{ id: 'img-1', image: Buffer.from('img1') }];

            prisma.property.findUnique.mockResolvedValue({ id: propertyId });
            prisma.propertyImage.findMany.mockResolvedValue(mockImages);

            const result = await propertyService.getAllImagesForProperty(propertyId);

            expect(prisma.property.findUnique).toHaveBeenCalledWith({ where: { id: propertyId }, select: { id: true } });
            expect(prisma.propertyImage.findMany).toHaveBeenCalledWith({ where: { propertyId: propertyId } });
            expect(result).toEqual(mockImages);
        });

        it('should throw "Imóvel sem imagem" if no images are found', async () => {
            const propertyId = 'prop-no-images';
            prisma.property.findUnique.mockResolvedValue({ id: propertyId });
            prisma.propertyImage.findMany.mockResolvedValue([]);

            await expect(propertyService.getAllImagesForProperty(propertyId))
                .rejects
                .toThrow('Imóvel sem imagem');
        });
    });

    describe('findAvailableProperties', () =>{
        it('should return property that have no conflicting reservations', async () => {
            const dateStart = '2025-11-10T10:00:00Z';
            const dateEnd = '2025-11-15T10:00:00Z';
            const mockAvailableProperties = [
                { id: 'prop-1', type: 'Casa', images: [] },
                { id: 'prop-2', type: 'Apartamento', images: [] },
                { id: 'prop-3', type: 'Sítio', images: [] },
            ];

            prisma.property.findMany.mockResolvedValue(mockAvailableProperties);

            const result = await propertyService.findAvailableProperties(dateStart, dateEnd);

            expect(prisma.property.findMany).toHaveBeenCalledWith({
                where: {
                    reserves: {
                        none: {
                            status: { not: 'CANCELADA' },
                            AND: [
                                { dateStart: { lt: new Date(dateEnd) } },
                                { dateEnd: { gt: new Date(dateStart) } }
                            ]
                        }
                    }
                },
                include: { images: true }
            });
            expect(result).toHaveLength(3);
            expect(result[0]).toBeInstanceOf(Property);
            expect(result[0].id).toBe('prop-1');
        });

        it('should throw an error if dates are missing', async () => {
            await expect(propertyService.findAvailableProperties(null, '2025-11-15T10:00:00Z'))
            .rejects
            .toThrow('as datas de início e fim são obrigatórias.');
            await expect(propertyService.findAvailableProperties('2025-11-10T10:00:00Z', undefined))
                .rejects
                .toThrow('as datas de início e fim são obrigatórias.');
        });
    });

    describe('getPropertiesByCity', () => {

        it('should return a list of properties with avgRating for a city', async () => {
            const testCity = "São Paulo";
            const propertiesFromDb = [
                { id: 'prop-1', type: 'Casa', city: testCity, userId: 'user-1' },
                { id: 'prop-2', type: 'Apartamento', city: testCity, userId: 'user-2' },
            ];
    
            prisma.property.findMany.mockResolvedValue(propertiesFromDb);
            
            prisma.propertyValuation.aggregate.mockResolvedValue({
                _avg: { noteProperty: 4.5 } 
            });
    
            const result = await propertyService.getPropertyByCity(testCity);
    
            expect(prisma.property.findMany).toHaveBeenCalledTimes(1);
            expect(prisma.property.findMany).toHaveBeenCalledWith({
                where: { city: testCity }, 
                include: {
                    images: {
                        select: { id: true } 
                    },
                    user: { 
                        select: { id: true, name: true, email: true }
                    }
                }
            });
    
            expect(prisma.propertyValuation.aggregate).toHaveBeenCalledTimes(2);
    
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('prop-1');
            expect(result[0]).toHaveProperty('avgRating', 4.5);
        });
    
        it('should throw an error if no properties are found', async () => {
            const testCity = 'CidadeInexistente';
            
            prisma.property.findMany.mockResolvedValue([]);
            
            await expect(
                propertyService.getPropertyByCity(testCity)
            ).rejects.toThrow('Nenhum imóvel encontrado nesta cidade');
    
            expect(prisma.property.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    where: { city: testCity }
                })
            );
        });
    });

    describe('findPropertiesRankedByValuation', () => {
        it('should return properties ranked by average ratin', async () => {
            const mockRankedData = [
                { id: 'prop-high', type: 'Pousada', avgRating: 4.8 },
                { id: 'prop-mid', type: 'Chalé', avgRating: 4.2 },
                { id: 'prop-low', type: 'Loft', avgRating: 3.5 },
            ];  

            prisma.$queryRaw.mockResolvedValue(mockRankedData);

            const result = await propertyService.findPropertiesRankedByValuation();

            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(3);
            expect(result[0]).toBeInstanceOf(Property);
            expect(result[0].id).toBe('prop-high');
            expect(result[0].avgRating).toBe(4.8); 
            expect(result[1].id).toBe('prop-mid');
            expect(result[2].id).toBe('prop-low');
        });

        it('should return an empty array if no property have rating', async () => {
            prisma.$queryRaw.mockResolvedValue([]);
            const result = await propertyService.findPropertiesRankedByValuation();
            expect(result).toEqual([]);
        });
    });

    describe('updatePropertyData', () => {
        it('should update property data successfully', async () => {
            const propertyId = 'prop-update-1';
            const ownerId = 'owner-1';
            const updateData = { description: 'Updated Description', dailyRate: 250 };
            const mockExistingProperty = { id: propertyId, userId: ownerId, description: 'Old', dailyRate: 200 };
            const mockUpdatedPropertyRaw = { ...mockExistingProperty, ...updateData };
            const finalPropertyInstance = new Property({ ...mockUpdatedPropertyRaw, avgRating: 4.5 });
            
            prisma.property.findUnique.mockResolvedValue(mockExistingProperty);
            prisma.property.update.mockResolvedValue(mockUpdatedPropertyRaw);
            vi.spyOn(propertyService, 'getPropertyById').mockResolvedValueOnce(finalPropertyInstance);

            const result = await propertyService.updatePropertyData(propertyId, updateData, ownerId);

            expect(prisma.property.findUnique).toHaveBeenCalledWith({ where: { id: propertyId } });
            expect(prisma.property.update).toHaveBeenCalledWith({ where: { id: propertyId }, data: updateData });
            expect(propertyService.getPropertyById).toHaveBeenCalledWith(propertyId);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Property);
            expect(result.id).toBe(propertyId);
            expect(result.description).toBe(updateData.description);
            expect(result.dailyRate).toBe(updateData.dailyRate);
        });

        it('should throw an error if property does not exist.', async () => {
            const propertyId = 'prop-update-not-found';
            const userId = 'any-user';
            const updateData = { description: 'Update attempt' };

            prisma.property.findUnique.mockResolvedValue(null);

            await expect(propertyService.updatePropertyData(propertyId, updateData, userId))
                .rejects
                .toThrow("Imóvel não existe");

            expect(prisma.property.update).not.toHaveBeenCalled();
            expect(propertyService.getPropertyById).not.toHaveBeenCalled();
        });

        it('should return an error if user is not the owner', async () => {
            const propertyId = 'prop-update-unauth';
            const ownerId = 'owner-1';
            const wrongUserId = 'wrong-user';
            const updateData = { description: 'Update attempt' };
            const mockExistingProperty = { id: propertyId, userId: ownerId };

            prisma.property.findUnique.mockResolvedValue(mockExistingProperty);

            await expect(propertyService.updatePropertyData(propertyId, updateData, wrongUserId))
                .rejects
                .toThrow('Ação não autorizada');

            expect(prisma.property.update).not.toHaveBeenCalled();
            expect(propertyService.getPropertyById).not.toHaveBeenCalled();
        });
    });

    describe('updatePropertyImages',() => {
        it('should delete a image and create a new', async () => {
            const propertyId = 'prop-img-update-1';
            const ownerId = 'owner-1';
            const newImageBuffers = [Buffer.from('new-img1')];
            const mockExistingProperty = { id: propertyId, userId: ownerId };
            const finalPropertyInstance = new Property({ ...mockExistingProperty, images: [{ id: 'new-mock-id' }] });

            prisma.property.findUnique.mockResolvedValue(mockExistingProperty);
            const mockTx = {
                propertyImage: {
                    deleteMany: vi.fn().mockResolvedValue({ count: 2 }), // Simulou que deletou 2 antigas
                    createMany: vi.fn().mockResolvedValue({ count: 1 })  // Simulou que criou 1 nova
                }
            };
            prisma.$transaction.mockImplementation(async (callback) => await callback(mockTx));
            vi.spyOn(propertyService, 'getPropertyById').mockResolvedValueOnce(finalPropertyInstance);

            const result = await propertyService.updatePropertyImages(propertyId, newImageBuffers, ownerId);

            expect(prisma.property.findUnique).toHaveBeenCalledWith({ where: { id: propertyId } });
            expect(prisma.$transaction).toHaveBeenCalledOnce();
            expect(mockTx.propertyImage.deleteMany).toHaveBeenCalledWith({ where: { propertyId: propertyId } });
            expect(mockTx.propertyImage.createMany).toHaveBeenCalledWith({
                data: [{ image: newImageBuffers[0], propertyId: propertyId }]
            });
            expect(propertyService.getPropertyById).toHaveBeenCalledWith(propertyId);
            expect(result).toEqual(finalPropertyInstance);
        });

        it('should only delete images if newImage is empty', async () => {
            const propertyId = 'prop-img-delete-only';
            const ownerId = 'owner-1';
            const emptyImageBuffers = [];
            const mockExistingProperty = { id: propertyId, userId: ownerId };
            const finalPropertyInstance = new Property({ ...mockExistingProperty, images: [] });

            prisma.property.findUnique.mockResolvedValue(mockExistingProperty);
            const mockTx = { propertyImage: { deleteMany: vi.fn(), createMany: vi.fn() } };
            mockTx.propertyImage.deleteMany.mockResolvedValue({ count: 3 });
            prisma.$transaction.mockImplementation(async (callback) => await callback(mockTx));
            vi.spyOn(propertyService, 'getPropertyById').mockResolvedValueOnce(finalPropertyInstance);
            
            await propertyService.updatePropertyImages(propertyId, emptyImageBuffers, ownerId);

            expect(prisma.$transaction).toHaveBeenCalledOnce();
            expect(mockTx.propertyImage.deleteMany).toHaveBeenCalledWith({ where: { propertyId: propertyId } });
            expect(mockTx.propertyImage.createMany).not.toHaveBeenCalled();
            expect(propertyService.getPropertyById).toHaveBeenCalledWith(propertyId);
        });

        it('should throw an error if property does not exist', async () => {
            const propertyId = 'prop-img-not-exist';
            const userId = 'any-user';
            const newImageBuffers = [Buffer.from('img')];

            prisma.property.findUnique.mockResolvedValue(null);
            
            await expect(propertyService.updatePropertyImages(propertyId, newImageBuffers, userId))
                .rejects
                .toThrow('Imóvel não existe');
            expect(prisma.$transaction).not.toHaveBeenCalled();
        });

        it('should return a error if user is not the owner', async () => {
            const propertyId = 'prop-img-unauth';
            const ownerId = 'owner-1';
            const wrongUserId = 'wrong-user';
            const newImageBuffers = [Buffer.from('img')];
            const mockExistingProperty = { id: propertyId, userId: ownerId };

            prisma.property.findUnique.mockResolvedValue(mockExistingProperty);

            await expect(propertyService.updatePropertyImages(propertyId, newImageBuffers, wrongUserId))
                .rejects
                .toThrow('Ação não autorizada');

            expect(prisma.$transaction).not.toHaveBeenCalled();
        });
    });

    describe('deleleProperty', () => {
        it('should delete a property', async () => {
            const propertyId = 'prop-delete-1';
            const ownerId = 'owner-1';
            const mockExistingProperty = { id: propertyId, userId: ownerId };

            prisma.property.findUnique.mockResolvedValue(mockExistingProperty);
            prisma.property.delete.mockResolvedValue({});

            await expect(propertyService.deleleProperty(propertyId, ownerId))
                .resolves
                .toBeUndefined();

            expect(prisma.property.findUnique).toHaveBeenCalledWith({ where: { id: propertyId } });
            expect(prisma.property.delete).toHaveBeenCalledWith({ where: { id: propertyId } });
        });

        it('should return an error if property does not exist', async () => {
            const propertyId = 'prop-delete-not-found';
            const userId = 'any-user';

            prisma.property.findUnique.mockResolvedValue(null);

            await expect(propertyService.deleleProperty(propertyId, userId))
                .rejects
                .toThrow('Imóvel não existe');

            expect(prisma.property.delete).not.toHaveBeenCalled();
        });

        it("should return an error if user is not the owner", async () => {
            const propertyId = 'prop-delete-unauth';
            const ownerId = 'owner-1';
            const wrongUserId = 'wrong-user';
            const mockExistingProperty = { id: propertyId, userId: ownerId };

            prisma.property.findUnique.mockResolvedValue(mockExistingProperty);

            await expect(propertyService.deleleProperty(propertyId, wrongUserId))
                .rejects
                .toThrow("Ação não autorizada");
            
                expect(prisma.property.delete).not.toHaveBeenCalled();
        });
    });
});