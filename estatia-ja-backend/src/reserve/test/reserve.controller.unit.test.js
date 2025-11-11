import { describe, it, expect, vi, beforeEach } from 'vitest';
import reserveController from '../controller.js';
import reserveService from '../service.js';
import Reserve from '../model.js';

vi.mock('../service.js', () => ({
  default: {
    createReserve: vi.fn(),
    getReservationsForOwner: vi.fn(),
    getReservationsForUser: vi.fn(),
    updateReserve: vi.fn(),
    cancelReserve: vi.fn(),
  },
}));

describe('test controller reserve', () => {
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
    it('should create a reserve and return it with status 201', async () => {
      const reserveData = { dateStart: new Date(), dateEnd: new Date() };
      const mockCreatedReserve = new Reserve({
        id: 'new-reserve-id',
        ...reserveData,
      });

      reserveService.createReserve.mockResolvedValue(mockCreatedReserve);

      mockReq.params = { propertyId: 'prop-1' };
      mockReq.user = { id: 'user-1' };
      mockReq.validatedData = reserveData;

      await reserveController.create(mockReq, mockRes);

      expect(reserveService.createReserve).toHaveBeenCalledWith(
        'prop-1',
        'user-1',
        reserveData
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedReserve);
    });

    it('should return status 409 if there is a date conflict', async () => {
      const errorMessage =
        'O imóvel já está reservado para estas datas. Conflito de disponibilidade.';
      reserveService.createReserve.mockRejectedValue(new Error(errorMessage));
      mockReq = { params: {}, user: {}, validatedData: {} };

      await reserveController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe('getOwnerReservetions', () => {
    it('should return a list of reservations with status 200', async () => {
      const mockReservations = [
        new Reserve({ id: 'res-1' }),
        new Reserve({ id: 'res-2' }),
      ];
      reserveService.getReservationsForOwner.mockResolvedValue(
        mockReservations
      );
      mockReq.user = { id: 'owner-id' };

      await reserveController.getOwnerReservations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockReservations);
      expect(reserveService.getReservationsForOwner).toHaveBeenCalledWith(
        'owner-id'
      );
    });

    it('should handle errors and return status 500', async () => {
      reserveService.getReservationsForOwner.mockRejectedValue(null);
      mockReq.user = { id: 'owner-id' };

      await reserveController.getOwnerReservations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro ao buscar as reservas.',
      });
    });
  });

  describe('getUserReservetions', () => {
    it('should return a list of reservations with status 200', async () => {
      const mockReservations = [
        new Reserve({ id: 'res-1' }),
        new Reserve({ id: 'res-2' }),
      ];
      reserveService.getReservationsForUser.mockResolvedValue(mockReservations);
      mockReq.user = { id: 'user-id' };

      await reserveController.getUserReservations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockReservations);
      expect(reserveService.getReservationsForUser).toHaveBeenCalledWith(
        'user-id'
      );
    });

    it('should handle errors and return status 500', async () => {
      reserveService.getReservationsForUser.mockRejectedValue(null);
      mockReq.user = { id: 'user-id' };

      await reserveController.getUserReservations(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro ao buscar suas reservas.',
      });
    });
  });

  describe('update', () => {
    it('should update a reserve and return it with status 200', async () => {
      const updateData = { dateStart: new Date('2025-11-20T14:00:00Z') };
      const mockUpdatedReserve = new Reserve({ id: 'res-1', ...updateData });
      reserveService.updateReserve.mockResolvedValue(mockUpdatedReserve);

      mockReq.params = { reserveId: 'res-1' };
      mockReq.user = { id: 'user-1' };
      mockReq.body = updateData;

      await reserveController.update(mockReq, mockRes);

      expect(reserveService.updateReserve).toHaveBeenCalledWith(
        'res-1',
        'user-1',
        updateData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedReserve);
    });

    it('should return status 404 if reserve is not found', async () => {
      reserveService.updateReserve.mockRejectedValue(
        new Error('Reserva não existe')
      );
      mockReq = { params: { reserveId: 'not-exist' }, user: {}, body: {} };

      await reserveController.update(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Reserva não existe',
      });
    });
  });

  describe('delete', async () => {
    it('should cancel a reserve and return status 204', async () => {
      reserveService.cancelReserve.mockResolvedValue();
      mockReq.params = { reserveId: 'res-to-cancel' };
      mockReq.user = { id: 'user-1' };

      await reserveController.cancel(mockReq, mockRes);

      expect(reserveService.cancelReserve).toHaveBeenCalledWith(
        'res-to-cancel',
        'user-1'
      );
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalledOnce();
    });

    it('should return status 403 for authorization errors', async () => {
      reserveService.cancelReserve.mockRejectedValue(
        new Error('Ação não autorizada')
      );
      mockReq = { params: { reserveId: 'some-id' }, user: {} };

      await reserveController.cancel(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Ação não autorizada',
      });
    });
  });
});
