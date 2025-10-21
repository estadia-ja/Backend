import { describe, it, expect, vi, beforeEach } from 'vitest';
import propertyValuationController from '../controller.js'; 
import propertyValuationService from '../service.js';
import PropertyValuation from '../model.js'; 

vi.mock('../service.js', () => ({
    default: {
        createPropertyValuation: vi.fn(),
        getValuationsByProperty: vi.fn(),
        deletePropertyValuation: vi.fn(),
    }
}));

describe('test propertyValuation controller', () => {
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
        const valuationData = { noteProperty: 5, commentProperty: 'Ótimo' };
        const reserveId = 'res-1';
        const userId = 'user-1';

        it('should create a valuation and return it with status 201', async () => {
            const mockCreatedValuation = new PropertyValuation({ 
                id: 'new-val-id', 
                reserveId: reserveId, 
                ...valuationData 
            });
            
            propertyValuationService.createPropertyValuation.mockResolvedValue(mockCreatedValuation);
            
            mockReq.validatedData = valuationData;
            mockReq.params = { reserveId: reserveId };
            mockReq.user = { id: userId };

            await propertyValuationController.create(mockReq, mockRes);

            expect(propertyValuationService.createPropertyValuation).toHaveBeenCalledWith(reserveId,userId,valuationData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockCreatedValuation.toJson());
        });

        it('should return 409 if reserve is already valuated', async () => {
            const error = new Error('Esta reserva já foi avalia.');
            propertyValuationService.createPropertyValuation.mockRejectedValue(error);
            mockReq.params = { reserveId };
            mockReq.user = { id: userId };
            mockReq.validatedData = valuationData;

            await propertyValuationController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
        });

        it('should return 403 if user is not authorized', async () => {
            const error = new Error('Ação não autorizada. Você não pode avaliar uma reserva que não é sua.');
            propertyValuationService.createPropertyValuation.mockRejectedValue(error);
            mockReq.params = { reserveId };
            mockReq.user = { id: 'wrong-user' };
            mockReq.validatedData = valuationData;

            await propertyValuationController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
        });

        it('should return 404 if reserve not found', async () => {
            const error = new Error('Reserva não encontrada.');
            propertyValuationService.createPropertyValuation.mockRejectedValue(error);
            mockReq.params = { reserveId: 'not-found-id' };
            mockReq.user = { id: userId };
            mockReq.validatedData = valuationData;

            await propertyValuationController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
        });

        it('should return 400 for other errors', async () => {
            const error = new Error('Erro genérico.');
            propertyValuationService.createPropertyValuation.mockRejectedValue(error);
            mockReq.params = { reserveId };
            mockReq.user = { id: userId };
            mockReq.validatedData = valuationData;

            await propertyValuationController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
        });
    });

    describe('getByProperty', () => {
        it('should return a list of valuations with status 200', async () => {
            const mockValuations = [
                new PropertyValuation({ id: 'val-1', noteProperty: 5 }),
                new PropertyValuation({ id: 'val-2', noteProperty: 4 }),
            ];
    
            propertyValuationService.getValuationsByProperty.mockResolvedValue(mockValuations);
            mockReq.params = { propertyId: 'prop-1' };

            await propertyValuationController.getByProperty(mockReq, mockRes);

            expect(propertyValuationService.getValuationsByProperty).toHaveBeenCalledWith('prop-1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockValuations.map(p => p.toJson()));
        });

        it('should return status 404 if no valuations found', async () => {
            const error = new Error('Nenhuma avaliação encontrada para este imóvel');
            propertyValuationService.getValuationsByProperty.mockRejectedValue(error);
            mockReq.params = { propertyId: 'not-found-id' };

            await propertyValuationController.getByProperty(mockReq, mockRes);
    
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: error.message });
        });

        it('should return status 500 on generic service error', async () => {
            const error = new Error('Database error');
            propertyValuationService.getValuationsByProperty.mockRejectedValue(error);
            mockReq.params = { propertyId: 'prop-1' };
    
            await propertyValuationController.getByProperty(mockReq, mockRes);
    
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro ao buscar avaliações.' });
        });
    });

    describe('delete', () => {
        it('should delete a valuation and return status 204', async () => {
            propertyValuationService.deletePropertyValuation.mockResolvedValue(); 
            mockReq.params = { valuationId: 'val-to-delete' };
            mockReq.user = { id: 'fake-user-id' };

            await propertyValuationController.delete(mockReq, mockRes);
            
            expect(propertyValuationService.deletePropertyValuation).toHaveBeenCalledWith('val-to-delete', 'fake-user-id');
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.send).toHaveBeenCalledOnce();
        });

        it('should return status 403 if the service throws an authorization error', async () => {
            const error = new Error('Ação não autorizada. Vacê não pode deletar uma avaliação que não é sua.');
            propertyValuationService.deletePropertyValuation.mockRejectedValue(error);
            mockReq.params = { valuationId: 'unauthorized-id' };
            mockReq.user = { id: 'wrong-user-id' };

            await propertyValuationController.delete(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({error: error.message})
        });

        it('should return status 404 if the service throws a "not found" error', async () => {
            const error = new Error('Reserva não encontrada.'); 
            propertyValuationService.deletePropertyValuation.mockRejectedValue(error);
            mockReq.params = { valuationId: 'not-found-id' };
            mockReq.user = { id: 'fake-user-id' };

            await propertyValuationController.delete(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({error: error.message})
        });

        it('should return status 400 for other errors (e.g., valuation not exists)', async () => {
            const error = new Error('AValiação não existe.'); 
            propertyValuationService.deletePropertyValuation.mockRejectedValue(error);
            mockReq.params = { valuationId: 'any-id' };
            mockReq.user = { id: 'fake-user-id' };

            await propertyValuationController.delete(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({error: error.message})
        });
    });
});