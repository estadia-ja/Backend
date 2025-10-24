import { describe, it, expect, vi, beforeEach } from 'vitest';
import paymentController from '../controller.js';
import paymentService from '../service.js';

vi.mock('../service.js', () => ({
    default: {
        createPayment: vi.fn(),
    }
}));

describe('paymentCOntroller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        vi.clearAllMocks();

        mockReq = {
            params: {},
            user: {},
            validatedData: {}
        };

        mockRes = {
            status: vi.fn(() => mockRes),
            json: vi.fn(() => mockRes),
        }
    });

    describe('create', () => {
        it('should create a payment and return 200', async () => {
            const reserveId = 'reserve-id';
            const userId = 'user-id';
            const paymentData = { paymentMethod: 'pix' };

            const mockResult = {
                id: 'payment-id',
                paymentValue: 500,
                toJSON: () => ({ id: 'payment-id', paymentValue:500 })
            }

            mockReq.params = {reserveId};
            mockReq.user = { id: userId };
            mockReq.validatedData = paymentData;

            paymentService.createPayment.mockResolvedValue(mockResult);
            await paymentController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockResult.toJSON());
            expect(paymentService.createPayment).toHaveBeenCalledWith(reserveId, userId, paymentData);
        });

        it('should return 409 if payment already exist', async () => {
            const erroeMessage = "Esta reserva já foi paga."
            paymentService.createPayment.mockRejectedValue(new Error("Esta reserva já foi paga."));

            await paymentController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json).toHaveBeenCalledWith({ error: erroeMessage });
        });

        it('should return 403 if user does not authorized', async () => {
            const erroeMessage = "Ação não autorizada. Esta reserva não pertence a você."
            paymentService.createPayment.mockRejectedValue(new Error("Ação não autorizada. Esta reserva não pertence a você."));

            await paymentController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ error: erroeMessage });
        });

        it('should return 404 if reserve does nor exist', async () => {
            const erroeMessage = "Reserva não existe."
            paymentService.createPayment.mockRejectedValue(new Error("Reserva não existe."));

            await paymentController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: erroeMessage });
        })
    });
});