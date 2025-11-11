import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../database.js';
import reserveService from '../service.js';
import Reserve from '../model.js';

vi.mock('../../database.js', () => ({
  prisma: {
    property: {
      findUnique: vi.fn(),
    },
    reserve: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('test reserve service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReserve', () => {
    const propertyId = 'prop-1';
    const userId = 'user-guest';
    const ownerId = 'user-owner';
    const reserveData = {
      dateStart: new Date('2025-12-20T14:00:00Z'),
      dateEnd: new Date('2025-12-25T11:00:00Z'),
    };
    const mockProperty = { id: propertyId, userId: ownerId, dailyRate: 100 };
    const mockNewReserve = {
      id: 'reserve-1',
      propertyId,
      userId,
      ...reserveData,
      status: 'CONFIRMADA',
      property: mockProperty,
      user: { id: userId, name: 'Guest' },
    };

    it('should create a reserve if property is avalaible', async () => {
      prisma.property.findUnique.mockResolvedValue(mockProperty);
      prisma.reserve.findFirst.mockResolvedValue(null);
      prisma.reserve.create.mockResolvedValue(mockNewReserve);

      const result = await reserveService.createReserve(
        propertyId,
        userId,
        reserveData
      );

      expect(prisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: propertyId },
      });
      expect(prisma.reserve.findFirst).toHaveBeenCalledOnce();
      expect(prisma.reserve.create).toHaveBeenCalledWith({
        data: {
          propertyId,
          userId,
          dateStart: reserveData.dateStart,
          dateEnd: reserveData.dateEnd,
          status: 'CONFIRMADA',
        },
        include: expect.any(Object),
      });
      expect(result).toBeInstanceOf(Reserve);
      expect(result.id).toBe('reserve-1');
    });

    it('should throw an error if property does not exist', async () => {
      prisma.property.findUnique.mockResolvedValue(null);
      await expect(
        reserveService.createReserve(propertyId, userId, reserveData)
      ).rejects.toThrow('Imóvel não existe');
    });

    it('should throw an error if user tries to reserve their own property', async () => {
      prisma.property.findUnique.mockResolvedValue({
        ...mockProperty,
        userId: userId,
      });
      await expect(
        reserveService.createReserve(propertyId, userId, reserveData)
      ).rejects.toThrow('Você não pode reservar seu própio imóvel.');
    });

    it('should throw an error if there is a date conflict', async () => {
      prisma.property.findUnique.mockResolvedValue(mockProperty);
      prisma.reserve.findFirst.mockResolvedValue({ id: 'conflicting-reserve' });
      await expect(
        reserveService.createReserve(propertyId, userId, reserveData)
      ).rejects.toThrow('O imóvel já está reservado para estas datas');
    });
  });

  describe('getReservationsForOwner', () => {
    it('should return reservations for an owner', async () => {
      const mockReservations = [{ id: 'res-1' }, { id: 'res-2 ' }];
      prisma.reserve.findMany.mockResolvedValue(mockReservations);
      const ownerId = 'owner-id';

      const result = await reserveService.getReservationsForOwner(ownerId);

      expect(prisma.reserve.findMany).toHaveBeenCalledWith({
        where: {
          property: { userId: 'owner-id' },
          status: { not: 'CANCELADO' },
        },
        include: { property: true, user: true },
        orderBy: { dateStart: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Reserve);
    });
  });

  describe('getReservationsForUser', () => {
    it('should return reservations for an user', async () => {
      const mockReservations = [{ id: 'res-1' }, { id: 'res-2 ' }];
      prisma.reserve.findMany.mockResolvedValue(mockReservations);
      const userId = 'user-id';

      const result = await reserveService.getReservationsForUser(userId);

      expect(prisma.reserve.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id', status: { not: 'CANCELADO' } },
        include: { property: true },
        orderBy: { dateStart: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Reserve);
    });
  });

  describe('updateReserve', () => {
    const reserveId = 'res-to-update';
    const userId = 'guest-user';
    const mockReserve = {
      id: reserveId,
      userId: userId,
      propertyId: 'prop-1',
      dateStart: new Date('2025-12-20T14:00:00Z'),
      dateEnd: new Date('2025-12-25T11:00:00Z'),
    };
    const mockFutureReserve = {
      id: reserveId,
      userId: userId,
      propertyId: 'prop-1',
      dateStart: new Date('2025-12-20T14:00:00Z'),
      dateEnd: new Date('2025-12-25T11:00:00Z'),
    };
    const updateData = { dateStart: new Date('2025-12-21T14:00:00Z') };

    it('should update a reserve successfully', async () => {
      prisma.reserve.findUnique.mockResolvedValue(mockReserve);
      prisma.reserve.findFirst.mockResolvedValue(null);
      prisma.reserve.update.mockResolvedValue({
        ...mockReserve,
        ...updateData,
      });

      const result = await reserveService.updateReserve(
        reserveId,
        userId,
        updateData
      );

      expect(prisma.reserve.findUnique).toHaveBeenCalledWith({
        where: { id: reserveId },
      });
      expect(prisma.reserve.update).toHaveBeenCalledWith({
        where: { id: reserveId },
        data: { dateStart: updateData.dateStart, dateEnd: mockReserve.dateEnd },
        include: { property: true, user: true },
      });
      expect(result.dateStart).toEqual(updateData.dateStart);
    });

    it('should throw an error if user is not the owner of the reserve', async () => {
      prisma.reserve.findUnique.mockResolvedValue(mockReserve);
      await expect(
        reserveService.updateReserve(reserveId, 'wrong-user-id', updateData)
      ).rejects.toThrow('Ação não autorizada, a reserva não é sua');
    });

    it('should throw an error if the reserve is not exist', async () => {
      prisma.reserve.findUnique.mockResolvedValue(null);

      await expect(
        reserveService.updateReserve(reserveId, userId, updateData)
      ).rejects.toThrow('Reserva não existe');

      expect(prisma.reserve.findFirst).not.toHaveBeenCalled();
      expect(prisma.reserve.update).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not the owner of the reserve', async () => {
      prisma.reserve.findUnique.mockResolvedValue(mockFutureReserve);
      const wrongUserId = 'wrong-user-id';

      await expect(
        reserveService.updateReserve(reserveId, wrongUserId, updateData)
      ).rejects.toThrow('Ação não autorizada, a reserva não é sua');
    });

    it('should throw an error if the reservation has already started', async () => {
      const mockPastReserve = {
        ...mockFutureReserve,
        dateStart: new Date('2025-10-01T10:00:00Z'),
      };
      prisma.reserve.findUnique.mockResolvedValue(mockPastReserve);

      await expect(
        reserveService.updateReserve(reserveId, userId, updateData)
      ).rejects.toThrow(
        /data de início não pode ser no passado|Não é possível alterar uma reserva que já começou/
      );

      expect(prisma.reserve.findFirst).not.toHaveBeenCalled();
      expect(prisma.reserve.update).not.toHaveBeenCalled();
    });

    it('should throw an error if the new dates conflict with an existing reservation', async () => {
      prisma.reserve.findUnique.mockResolvedValue(mockFutureReserve);
      prisma.reserve.findFirst.mockResolvedValue({ id: 'conflicting-reserve' });

      await expect(
        reserveService.updateReserve(reserveId, userId, updateData)
      ).rejects.toThrow('O imóvel já está reservado para estas datas');

      expect(prisma.reserve.update).not.toHaveBeenCalled();
    });
  });

  describe('cancelReserve', () => {
    const reserveId = 'res-to-cancel';
    const guestId = 'guest-user';
    const ownerId = 'owner-user';
    const mockReserve = {
      id: reserveId,
      userId: guestId,
      property: { userId: ownerId },
      dateStart: new Date('2025-12-20T14:00:00Z'),
    };

    it('should allow the guest to cancel their own reserve', async () => {
      prisma.reserve.findUnique.mockResolvedValue(mockReserve);
      prisma.reserve.update.mockResolvedValue({});

      await expect(
        reserveService.cancelReserve(reserveId, guestId)
      ).resolves.toBeUndefined();

      expect(prisma.reserve.update).toHaveBeenCalledWith({
        where: { id: reserveId },
        data: { status: 'CANCELADO' },
      });
    });

    it('should allow the property owner to cancel a reserve', async () => {
      prisma.reserve.findUnique.mockResolvedValue(mockReserve);
      prisma.reserve.update.mockResolvedValue({});

      await expect(
        reserveService.cancelReserve(reserveId, ownerId)
      ).resolves.toBeUndefined();

      expect(prisma.reserve.update).toHaveBeenCalledWith({
        where: { id: reserveId },
        data: { status: 'CANCELADO' },
      });
    });

    it('should throw an error if a third party tries to cancel', async () => {
      prisma.reserve.findUnique.mockResolvedValue(mockReserve);
      await expect(
        reserveService.cancelReserve(reserveId, 'third-party-id')
      ).rejects.toThrow('Ação não autorizada.');
    });
  });
});
