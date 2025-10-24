import { describe, it, vi, expect, afterEach, beforeEach, afterAll, beforeAll } from 'vitest';
import paymentService from '../service.js';
import { prisma } from '../../database.js';
import Payment from '../model.js'

vi.mock('../../database.js', () => {
    const mockPrismaClient = {
        payment: {
            create: vi.fn(),
        },
        reserve: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    };

    mockPrismaClient.$transaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockPrismaClient);
    });

    return { prisma: mockPrismaClient };
});

vi.mock('../model.js', () => {
    return {
        default: vi.fn().mockImplementation((data) => ({
            ...data,
            toJSON: () => data,
        })),
    }
});

const MOCK_DATE = new Date('2025-10-30T15:00:00Z');

beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
});

afterAll(() => {
    vi.useRealTimers();
});

describe('paymentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createPayment', () => {
        const reserveId = 'reserve-id';
        const userId = 'user-id';
        const paymentData = { paymentMethod: 'credit-card' };
        const mockProperty = { id: 'property-id', dailyRate: 150 };
        const mockReserveBase = {
            id: reserveId,
            userId: userId,
            payment: null,
            property: mockProperty,
        };

        it('should create a payment and update reserve status successfully', async () => {
            const mockReserve = {
                ...mockReserveBase,
                dateStart:'2025-11-10T14:00:00Z',
                dateEnd: '2025-11-12T11:00:00Z',
            };

            const expectedTotalValue = 300;

            const mockCreatedPayment = {
                id: 'payment-id',
                reserveId: reserveId,
                datePayment: MOCK_DATE,
            }

            prisma.reserve.findUnique.mockResolvedValue(mockReserve);
            prisma.payment.create.mockResolvedValue(mockCreatedPayment);
            prisma.reserve.update.mockResolvedValue({});

            const result = await paymentService.createPayment(reserveId, userId, paymentData);

            expect(prisma.reserve.findUnique).toHaveBeenCalledWith({
                where: { id: reserveId },
                include: { property: true, payment: true }
            });
            expect(prisma.$transaction).toHaveBeenCalled();
            expect(prisma.payment.create).toHaveBeenCalledWith({
                data: {
                    reserveId: reserveId,
                    paymentValue: expectedTotalValue,
                    datePayment: MOCK_DATE
                }
            });
            expect(Payment).toHaveBeenCalledWith(mockCreatedPayment);
            expect(result).toEqual(expect.objectContaining(mockCreatedPayment));
        });

        it('should calculate daily rates correctly', async () => {
            const mockReserve = {
                ...mockReserveBase,
                dateStart: '2025-11-10T10:00:00Z',
                dateEnd: '2025-11-11T12:00:00Z', 
                property: { dailyRate: 100 }
            };
            const expectedTotalValue = 200;

            prisma.reserve.findUnique.mockResolvedValue(mockReserve);
            prisma.payment.create.mockResolvedValue({ id: 'pay-x', paymentValue: expectedTotalValue });
            prisma.reserve.update.mockResolvedValue({});

            await paymentService.createPayment(reserveId, userId, paymentData);

            expect(prisma.payment.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        paymentValue: expectedTotalValue
                    })
                })
            );
        });

        it('should thorw en error if reserve does not exist', async () => {
            prisma.reserve.findUnique.mockResolvedValue(null);

            await expect(paymentService.createPayment(reserveId, userId, paymentData))
                .rejects
                .toThrow('Reserva não existe.')
        });

        it('should thorow an error if user does not authorized', async () => {
            const mockReserve = {
                ...mockReserveBase,
                userId: 'user-wrong-id'
            };

            prisma.reserve.findUnique.mockResolvedValue(mockReserve);

            await expect(paymentService.createPayment(reserveId, userId, paymentData))
                .rejects
                .toThrow('Ação não autorizada. Esta reserva não pertence a você.')
        });

        it('should throw an error if reserve is already paid', async () => {
            const mockReserve = {
                ...mockReserveBase,
                payment: { id: 'payment-paid-id' }
            };

            prisma.reserve.findUnique.mockResolvedValue(mockReserve);

            await expect(paymentService.createPayment(reserveId, userId, paymentData))
                .rejects
                .toThrow("Esta reserva já foi paga.")
        });
    });
});