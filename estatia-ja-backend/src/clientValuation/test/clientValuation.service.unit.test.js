import { describe, it, expect, vi, beforeEach } from 'vitest';
import clientValuationService from '../service.js';
import ClientValuation from '../model.js';
import { prisma } from '../../database.js';

vi.mock('../../database.js', () => {
    const mockPrisma = {
        reserve: {
            findUnique: vi.fn(),
        },
        clientValuation: {
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
    };

    return { prisma: mockPrisma };
});

vi.mock('../model.js', () => {
    return {
        default: vi.fn().mockImplementation((data) => ({
            ...data,
            toJSON: () => data,
        })),
    };
});

describe('teste service clientValuation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createClientValuation', () => {
        const ownerId = 'owner-123';
        const reserveId = 'reserve-123';
        const valuationData = {
            noteClient: 5,
            commentClient: 'Excelente cliente!',
        };

        it('should create a client valuation successfully', async () => {
            const mockReserve = {
                id: reserveId,
                property: { userId: ownerId },
                clientValuationService: null,
            };
            const mockCreatedValuation = {
                id: 'valuation-123',
                reserveId: reserveId,
                noteClient: 5,
                commentClient: 'Excelente cliente!'
            };

            prisma.reserve.findUnique.mockResolvedValue(mockReserve);
            prisma.clientValuation.create.mockResolvedValue(mockCreatedValuation);

            const result = await clientValuationService.createClientValuation(reserveId, ownerId, valuationData);

            expect(prisma.reserve.findUnique).toHaveBeenCalledWith({
                where: { id: reserveId },
                include: { property: true, clientValuation: true }
            });
            expect(prisma.clientValuation.create).toHaveBeenCalledWith({
                data: {
                    reserveId: reserveId,
                    noteClient: valuationData.noteClient,
                    commentClient: valuationData.commentClient
                }
            });

            expect(ClientValuation).toHaveBeenCalledWith(mockCreatedValuation);
            //expect(result).toEqual(mockCreatedValuation);
        });

        it('should throw an error if reserve does not exist', async () => {
            prisma.reserve.findUnique.mockResolvedValue(null);

            await expect(clientValuationService.createClientValuation(reserveId, ownerId, valuationData))
                .rejects
                .toThrow("Reserva não existe.");
        });

        it('should throw an error if user is not the owner', async () => {
            const mockReserve = {
                id: reserveId,
                property: { userId: 'another-owner-id' }, 
                clientValuation: null,
            };
            prisma.reserve.findUnique.mockResolvedValue(mockReserve);

            await expect(clientValuationService.createClientValuation(reserveId, ownerId, valuationData))
                .rejects
                .toThrow("Ação não autorizada. Você não é o proprietário do imóvel desta reserva.");
        });

        it('should throw an error if client is already valuated', async () => {
            const mockReserve = {
                id: reserveId,
                property: { userId: ownerId },
                clientValuation: { id: 'existing-valuation-111'},
            };
            prisma.reserve.findUnique.mockResolvedValue(mockReserve);

            await expect(clientValuationService.createClientValuation(reserveId, ownerId, valuationData))
                .rejects
                .toThrow("Este cliente já foi avaliado para esta reserva.");
        });

        /* Teste para a lógica comentada (opcional)
        it('should throw an error if reservation has not ended', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 5); 

            const mockReserve = {
                id: reserveId,
                property: { userId: ownerId },
                clientValuation: null,
                dateEnd: futureDate.toISOString()
            };
            prisma.reserve.findUnique.mockResolvedValue(mockReserve);

            await expect(clientValuationService.createClientValuation(reserveId, ownerId, valuationData))
                .rejects
                .toThrow("Você só pode avaliar o cliente após o término da data da reserva.");
        });
        */
    });

    describe('deleteClientValuation', () => {
        const valuationId = 'valuation-123';
        const ownerId = 'owner-123';

        it('should delete a valuation successfully', async () => {
            const mockValuation = {
                id: valuationId,
                reserve: {
                    property: {
                        userId: ownerId
                    }
                }
            };
            prisma.clientValuation.findUnique.mockResolvedValue(mockValuation);
            prisma.clientValuation.delete.mockResolvedValue({});

            await expect(clientValuationService.deleteClientValuation(valuationId, ownerId))
                .resolves
                .toBeUndefined();

            expect(prisma.clientValuation.findUnique).toHaveBeenCalledWith({
                where: { id: valuationId },
                include: { reserve: { include: { property: true } } }
            });
            expect(prisma.clientValuation.delete).toHaveBeenCalledWith({
                where: { id: valuationId }
            });
        });

        it('should throw an error if valuation does not exist', async () => {
            prisma.clientValuation.findUnique.mockResolvedValue(null);

            await expect(clientValuationService.deleteClientValuation(valuationId, ownerId))
                .rejects
                .toThrow("Avaliação não existe.")
        });

        it('should throw an error if user is not the owner', async () => {
            const mockValuation = {
                id: valuationId,
                reserve: {
                    property: {
                        userId: 'another-owner-id'
                    }
                }
            };
            prisma.clientValuation.findUnique.mockResolvedValue(mockValuation);

            await expect(clientValuationService.deleteClientValuation(valuationId, ownerId))
                .rejects
                .toThrow("Ação não autorizada. Você não pode deletar esta avaliação.");
            
            expect(prisma.clientValuation.delete).not.toHaveBeenCalled(); 
        });
    });
});