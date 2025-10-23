import { describe, it, expect } from 'vitest';
import ClientValuation from '../model.js'

describe('teste model clientValuation', () => {
    const mockData = {
        id: 'client-valuation-123',
        noteClient: 5,
        commentClient: 'Deixou a casa limpa',
        dateClientValuation: new Date('2025-10-23T10:00:00Z'),
        reserveId: 'reserve-id-123'
    };

    it('should correctly instantiate and assign properties from data', () => {
        const valuation = new ClientValuation(mockData);

        expect(valuation).toBeInstanceOf(ClientValuation);
        expect(valuation.id).toBe('client-valuation-123');
        expect(valuation.noteClient).toBe(5);
        expect(valuation.commentClient).toBe('Deixou a casa limpa');
        expect(valuation.dateClientValuation).toEqual(new Date('2025-10-23T10:00:00Z'));
        expect(valuation.reserveId).toBe('reserve-id-123');
    });

    it('should return the correct object from toJSON()', () => {
        const valuation = new ClientValuation(mockData);
        const jsonOutput = valuation.toJSON();

        expect(jsonOutput).toEqual(mockData);
        expect(jsonOutput).toBe(valuation);
    });

    it('should handle partial or different data', () => {
        const parcialData = {
            id: 'client-valuation-456',
            noteClient: 3,
        }

        const valuation = new ClientValuation(parcialData);
        expect(valuation.id).toBe('client-valuation-456');
        expect(valuation.noteClient).toBe(3);
        expect(valuation.commentClient).toBeUndefined();
        expect(valuation.dateClientValuation).toBeUndefined();
        expect(valuation.reserveId).toBeUndefined();
    });
});