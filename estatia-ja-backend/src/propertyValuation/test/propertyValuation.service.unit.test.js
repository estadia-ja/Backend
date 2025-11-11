import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../database.js';
import propertyValuationService from '../service.js';
import PropertyValuation from '../model.js';

vi.mock('../../database.js', () => ({
  prisma: {
    reserve: {
      findUnique: vi.fn(),
    },
    propertyValuation: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('test propertyValuation service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPropertyValuation', () => {
    const reserveId = 'reserve-1';
    const userId = 'user-1';
    const valuationData = {
      noteProperty: 5,
      commentProperty: 'Ótima estadia!',
    };
    const mockReserve = {
      id: reserveId,
      userId: userId,
      propertyValuation: null,
    };
    const mockNewValuation = {
      id: 'valuation-1',
      reserveId: reserveId,
      noteProperty: 5,
      commentProperty: 'Ótima estadia!',
    };

    it('should create a new valuation succefully', async () => {
      prisma.reserve.findUnique.mockResolvedValue(mockReserve);
      prisma.propertyValuation.create.mockResolvedValue(mockNewValuation);

      const result = await propertyValuationService.createPropertyValuation(
        reserveId,
        userId,
        valuationData
      );

      expect(prisma.reserve.findUnique).toHaveBeenCalledWith({
        where: { id: reserveId },
        include: { propertyValuation: true },
      });
      expect(prisma.propertyValuation.create).toHaveBeenCalledWith({
        data: {
          reserveId: reserveId,
          noteProperty: valuationData.noteProperty,
          commentProperty: valuationData.commentProperty,
        },
      });
      expect(result).toBeInstanceOf(PropertyValuation);
      expect(result.id).toBe('valuation-1');
    });

    it('should return an error if reserve not found', async () => {
      prisma.reserve.findUnique.mockResolvedValue(null);

      await expect(
        propertyValuationService.createPropertyValuation(
          reserveId,
          userId,
          valuationData
        )
      ).rejects.toThrow('Reserva não encontrada.');

      expect(prisma.propertyValuation.create).not.toHaveBeenCalled();
    });

    it('should thorw error if user is not authorized', async () => {
      prisma.reserve.findUnique.mockResolvedValue({
        ...mockReserve,
        userId: 'wrong-user-id',
      });

      await expect(
        propertyValuationService.createPropertyValuation(
          reserveId,
          userId,
          valuationData
        )
      ).rejects.toThrow(
        'Ação não autorizada. Você não pode avaliar uma reserva que não é sua.'
      );

      expect(prisma.propertyValuation.create).not.toHaveBeenCalled();
    });

    it('should throw error if reserve is already valuated', async () => {
      prisma.reserve.findUnique.mockResolvedValue({
        ...mockReserve,
        propertyValuation: { id: 'existing-valuation' },
      });

      await expect(
        propertyValuationService.createPropertyValuation(
          reserveId,
          userId,
          valuationData
        )
      ).rejects.toThrow('Esta reserva já foi avalia.');

      expect(prisma.propertyValuation.create).not.toHaveBeenCalled();
    });
  });

  describe('getValuationByProperty', () => {
    const propertyId = 'prop-1';
    const mockValuations = [
      {
        id: 'val-1',
        noteProperty: 5,
        reserve: { user: { id: 'u1', name: 'Alice' } },
      },
      {
        id: 'val-2',
        noteProperty: 4,
        reserve: { user: { id: 'u2', name: 'Bob' } },
      },
    ];

    it('should return formatted valuations for a property', async () => {
      prisma.propertyValuation.findMany.mockResolvedValue(mockValuations);

      const result =
        await propertyValuationService.getValuationsByProperty(propertyId);

      expect(prisma.propertyValuation.findMany).toHaveBeenCalledWith({
        where: { reserve: { propertyId: propertyId } },
        include: {
          reserve: {
            select: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { noteProperty: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PropertyValuation);
      expect(result[0].noteProperty).toBe(5);
    });

    it('should thorw error if no baluations are found', async () => {
      prisma.propertyValuation.findMany.mockResolvedValue([]);

      await expect(
        propertyValuationService.getValuationsByProperty(propertyId)
      ).rejects.toThrow('Nenhuma avaliação encontrada para este imóvel');
    });
  });

  describe('deletePropertyValuation', () => {
    const valuationId = 'val-to-delete';
    const userId = 'user-owner';
    const mockValuation = {
      id: valuationId,
      reserve: {
        userId: userId,
      },
    };

    it('should delete a valuation succefully', async () => {
      prisma.propertyValuation.findUnique.mockResolvedValue(mockValuation);
      prisma.propertyValuation.delete.mockResolvedValue({});

      await propertyValuationService.deletePropertyValuation(
        valuationId,
        userId
      );

      expect(prisma.propertyValuation.findUnique).toHaveBeenCalledWith({
        where: { id: valuationId },
        include: { reserve: true },
      });
      expect(prisma.propertyValuation.delete).toHaveBeenCalledWith({
        where: { id: valuationId },
      });
    });

    it('should throw error if valuation does not exist', async () => {
      prisma.propertyValuation.findUnique.mockResolvedValue(null);

      await expect(
        propertyValuationService.deletePropertyValuation(valuationId, userId)
      ).rejects.toThrow('AValiação não existe.');

      expect(prisma.propertyValuation.delete).not.toHaveBeenCalled();
    });

    it('should throw error if user is not authorized to delete', async () => {
      prisma.propertyValuation.findUnique.mockResolvedValue({
        ...mockValuation,
        reserve: { userId: 'wrong-user-id' },
      });

      await expect(
        propertyValuationService.deletePropertyValuation(valuationId, userId)
      ).rejects.toThrow(
        'Ação não autorizada. Vacê não pode deletar uma avaliação que não é sua.'
      );

      expect(prisma.propertyValuation.delete).not.toHaveBeenCalled();
    });
  });
});
