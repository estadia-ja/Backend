import { describe, it, expect, vi, beforeEach } from 'vitest';
import propertyController from '../controller.js';
import propertyService from '../service.js';
import Property from '../model.js';

vi.mock('../service.js', () => ({
    default: {
        createProperty: vi.fn(),
        getAllProperties: vi.fn(),
        getPropertyById: vi.fn(),
        deleleProperty: vi.fn(),
        updatePropertyData: vi.fn(),
        updatePropertyImages: vi.fn(),
        findAvailableProperties: vi.fn(),
        findPropertiesRankedByValuation: vi.fn(),
        getAllImagesForProperty: vi.fn(),
    }
}));

describe('test property controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        vi.clearAllMocks(); 
        
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn(), 
        };
        
        mockReq = {};
    });

    describe('create', () => {
        it('should create a property and return it with status 201', async () => {
           const propertyData = { type: 'Apartamento', description: 'Novo ap' };
            const mockFiles = [{ buffer: Buffer.from('fake-image-data') }];
            const mockCreatedProperty = new Property({ id: 'new-prop-id', ...propertyData });
            
            propertyService.createProperty.mockResolvedValue(mockCreatedProperty);
            
            mockReq.validatedData = propertyData;
            mockReq.files = mockFiles;
            mockReq.user = { id: 'fake-user-id' };

            await propertyController.create(mockReq, mockRes);

            expect(propertyService.createProperty).toHaveBeenCalledWith(
                propertyData,
                [mockFiles[0].buffer], 
                'fake-user-id'
            );
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockCreatedProperty.toJSON());
        });
    });

    describe('getById', () => {
        it('should return a property', async () => {
            const mockProperty = new Property({ id: 'test-id', type: 'Casa', avgRating: 4.5});
            propertyService.getPropertyById.mockResolvedValue(mockProperty);
            mockReq.params = { id: 'test-id' };
    
            await propertyController.getById(mockReq, mockRes);
    
            expect(propertyService.getPropertyById).toHaveBeenCalledWith('test-id');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockProperty.toJSON());
        });

        it('should return a error 404 if property does not exist', async () => {
            propertyService.getPropertyById.mockRejectedValue(new Error('Imóvel não existe'));
            mockReq.params = { id: 'not-found-id' };

            await propertyController.getById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Imóvel não existe' });
        });
    });

    describe('getAll', () => {
        it('should return a list of all properties with status 200', async () => {
            const mockProperties = [
                new Property({ id: 'prop-1', type: 'Casa' }),
                new Property({ id: 'prop-2', type: 'Apartamento' }),
            ];
    
            propertyService.getAllProperties.mockResolvedValue(mockProperties);

            await propertyController.getAll(mockReq, mockRes);

            expect(propertyService.getAllProperties).toHaveBeenCalledOnce();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockProperties.map(p => p.toJSON()));
        });

        it('should return status 500 on service error', async () => {
            propertyService.getAllProperties.mockRejectedValue(new Error('Database error'));
    
            await propertyController.getAll(mockReq, mockRes);
    
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('getAllImages', () => {
        it('should return a list of images for a property with status 200', async () => {
            const mockImages = [{ id: 'img-1', image: '...' }];
            propertyService.getAllImagesForProperty.mockResolvedValue(mockImages);
            mockReq.params = { propertyId: 'test-prop-id'};

            await propertyController.getAllImages(mockReq, mockRes);

            expect(propertyService.getAllImagesForProperty).toHaveBeenCalledWith('test-prop-id');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockImages);
        });

        it('should return status 404 if service throws an error', async () => {
            propertyService.getAllImagesForProperty.mockRejectedValue(new Error('Imóvel não existe'));
            mockReq.params = {propertyId: 'not-exist-id'};

            await propertyController.getAllImages(mockReq,mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Imóvel não existe' });
        });
    });

    describe('findAvailable', () => {
        it('should return available property with status 200', async () => {
            const mockProperties = [new Property({ id: 'prop-1' })];
            const dateStart = '2025-12-01';
            const dateEnd = '2025-12-10';
            propertyService.findAvailableProperties.mockResolvedValue(mockProperties);
            mockReq.query = { dateStart, dateEnd };

            await propertyController.findAvailable(mockReq, mockRes);

            expect(propertyService.findAvailableProperties).toHaveBeenCalledWith(dateStart, dateEnd);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockProperties);
        })
    });

    describe('findRanked', () => {
        it('should return ranked properties with status 200', async () => {
            const mockProperties = [new Property({ id: 'prop-1', avgRating: 5 })];
            propertyService.findPropertiesRankedByValuation.mockResolvedValue(mockProperties);

            await propertyController.findRanked(mockReq, mockRes);

            expect(propertyService.findPropertiesRankedByValuation).toHaveBeenCalledOnce();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockProperties);
        });
    });

    describe('updateData', () => {
        it('should update property data and return it with status 200', async () => {
            const updateData = { description: 'Nova descrição' };
            const mockUpdatedProperty = new Property({ id: 'prop-id', description: 'Nova descrição' });
            propertyService.updatePropertyData.mockResolvedValue(mockUpdatedProperty);
            mockReq.params = { id: 'prop-id' };
            mockReq.user = { id: 'user-id' };
            mockReq.body = updateData;

            await propertyController.updateData(mockReq,mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedProperty);
            expect(propertyService.updatePropertyData).toHaveBeenCalledWith('prop-id', updateData, 'user-id');
        });

        it('should return status 403 for authorization errors', async () => {
            propertyService.updatePropertyData.mockRejectedValue(new Error('Ação não autorizada'));
            mockReq.params = { id: 'prop-id' };
            mockReq.user = { id: 'wrong-user-id' };
            mockReq.body = {};
    
            await propertyController.updateData(mockReq, mockRes);
    
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Ação não autorizada' });
        });

        it('should return status 404 if property to update does not exist', async () => {
            propertyService.updatePropertyData.mockRejectedValue(new Error('Imóvel não existe'));
            mockReq.params = { id: 'prop-id' };
            mockReq.user = { id: 'wrong-user-id' };
            mockReq.body = {};
    
            await propertyController.updateData(mockReq, mockRes);
    
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Imóvel não existe' });
        });
    });

    describe('updateImages', () => {
        it('should update property images and return the property with status 200', async () => {
            const mockFiles = [{ buffer: Buffer.from('new-image') }];
            const mockUpdatedProperty = new Property({ id: 'prop-id', images: [{ id: 'new-img-id' }] });
            propertyService.updatePropertyImages.mockResolvedValue(mockUpdatedProperty);
            mockReq.params = { id: 'prop-id' };
            mockReq.user = { id: 'user-id' };
            mockReq.files = mockFiles;

            await propertyController.updateImages(mockReq, mockRes);

            expect(propertyService.updatePropertyImages).toHaveBeenCalledWith('prop-id', [mockFiles[0].buffer], 'user-id');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedProperty);
        });
        
        it('should return status 403 for authorization errors', async () => {
            propertyService.updatePropertyImages.mockRejectedValue(new Error('Ação não autorizada'));
            mockReq.params = { id: 'prop-id' };
            mockReq.user = { id: 'wrong-user-id' };
            mockReq.body = {};
    
            await propertyController.updateImages(mockReq, mockRes);
    
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Ação não autorizada' });
        });

        it('should return status 404 if property to update does not exist', async () => {
            propertyService.updatePropertyImages.mockRejectedValue(new Error('Imóvel não existe'));
            mockReq.params = { id: 'prop-id' };
            mockReq.user = { id: 'wrong-user-id' };
            mockReq.body = {};
    
            await propertyController.updateImages(mockReq, mockRes);
    
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Imóvel não existe' });
        });
    });

    describe('delete', () => {
        it('should delete a property', async () => {
            propertyService.deleleProperty.mockResolvedValue();
            mockReq.params = { id: 'property-to-delete' };
            mockReq.user = { id: 'fake-user-id' };

            await propertyController.delete(mockReq, mockRes);
            
            expect(propertyService.deleleProperty).toHaveBeenCalledWith('property-to-delete', 'fake-user-id');
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.send).toHaveBeenCalledOnce();
        });

        it('should return status 403 if the service throws an authorization error', async () => {
            propertyService.deleleProperty.mockRejectedValue(new Error('Ação não autorizada'));
            mockReq.params = { id: 'unauthorized-id' };
            mockReq.user = { id: 'wrong-user-id' };

            await propertyController.delete(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({error: 'Ação não autorizada'})
        });
    });
});