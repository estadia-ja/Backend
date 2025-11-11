import { describe, it, expect, vi, beforeEach } from 'vitest';
import clientValuationController from '../controller.js';
import clientValuationService from '../service.js';

vi.mock('../service.js', () => ({
  default: {
    createClientValuation: vi.fn(),
    deleteClientValuation: vi.fn(),
  },
}));

describe('clientValuationController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      params: {},
      user: {},
      validatedData: {},
    };

    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn(() => mockRes),
      send: vi.fn(() => mockRes),
    };
  });

  describe('create', () => {
    it('should create a valuation and return 200', async () => {
      const reserveId = 'reserve-123';
      const ownerId = 'owner-123';
      const valuationData = { noteClient: 5, commentClient: 'Muito bom' };
      const mockResult = {
        id: 'val-789',
        ...valuationData,
        toJSON: () => ({ id: 'val-789', ...valuationData }),
      };

      mockReq.params = { reserveId };
      mockReq.user = { id: ownerId };
      mockReq.validatedData = valuationData;

      clientValuationService.createClientValuation.mockResolvedValue(
        mockResult
      );

      await clientValuationController.create(mockReq, mockRes);

      expect(clientValuationService.createClientValuation).toHaveBeenCalledWith(
        reserveId,
        ownerId,
        valuationData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult.toJSON());
    });

    it('should return 409 if valuation already exists', async () => {
      const errorMessage = 'Este cliente já foi avaliado para esta reserva.';
      clientValuationService.createClientValuation.mockRejectedValue(
        new Error(errorMessage)
      );

      await clientValuationController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('should return 403 if user is not authorized', async () => {
      const errorMsg =
        'Ação não autorizada. Você não é o proprietário do imóvel desta reserva.';
      clientValuationService.createClientValuation.mockRejectedValue(
        new Error(errorMsg)
      );

      await clientValuationController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMsg });
    });

    it('should return 404 if reserve does not exist', async () => {
      const errorMsg = 'Reserva não existe.';
      clientValuationService.createClientValuation.mockRejectedValue(
        new Error(errorMsg)
      );

      await clientValuationController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMsg });
    });
  });

  describe('delete', () => {
    it('should delete a valuation and return 204', async () => {
      const valuationId = 'val-789';
      const ownerId = 'owner-abc';

      mockReq.params = { valuationId };
      mockReq.user = { id: ownerId };

      clientValuationService.deleteClientValuation.mockResolvedValue();

      await clientValuationController.delete(mockReq, mockRes);

      expect(clientValuationService.deleteClientValuation).toHaveBeenCalledWith(
        valuationId,
        ownerId
      );

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not authorized', async () => {
      const errorMsg =
        'Ação não autorizada. Você não pode deletar esta avaliação.';
      clientValuationService.deleteClientValuation.mockRejectedValue(
        new Error(errorMsg)
      );

      await clientValuationController.delete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMsg });
    });

    it('should return 404 if valuation does not exist', async () => {
      const errorMsg = 'Avaliação não existe.';
      clientValuationService.deleteClientValuation.mockRejectedValue(
        new Error(errorMsg)
      );

      await clientValuationController.delete(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMsg });
    });
  });
});
