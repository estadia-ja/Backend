import { describe, it, expect } from 'vitest';
import Payment from '../model.js';

describe('teste model Payment', () => {
    const mockData = {
        id: 'payment-id',
        paymentValue: 150.75,
        datePayment: new Date('2025-10-20T14:30:00Z'),
        reserveId: 'reserve-id',
    }

    it('should correctly instantiate and addign properties from data', async () => {
        const payment = new Payment(mockData);

        expect(payment).toBeInstanceOf(Payment);
        expect(payment.id).toBe('payment-id');
        expect(payment.paymentValue).toBe(150.75);
        expect(payment.datePayment).toEqual(new Date('2025-10-20T14:30:00Z'));
        expect(payment.reserveId).toBe('reserve-id');
    });

    it('should return the correct object from toJSON()', () => {
        const payment = new Payment(mockData);
        const jsonOutput = payment.toJSON();

        expect(jsonOutput).toEqual(mockData);
        expect(jsonOutput).toBe(payment);
    });

    it('should handle partial or different data', () => {
        const partialData = {
            id: 'payment-parcial-id',
            reserveId: 'reserve-id-2',
        }

        const payment = new Payment(partialData);

        expect(payment.id).toBe('payment-parcial-id');
        expect(payment.reserveId).toBe('reserve-id-2');
        expect(payment.paymentValue).toBeUndefined();
        expect(payment.datePayment).toBeUndefined();
    });
});