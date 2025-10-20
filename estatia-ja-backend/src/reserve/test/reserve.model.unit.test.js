// src/reserve/test/reserve.model.unit.test.js
import { describe, it, expect } from 'vitest';
import Reserve from '../model.js';

describe('Reserve Model', () => {
    it('should create a full Reserve instance with property and user data', () => {
        const fullData = {
            id: 'reserve-cuid-1',
            dateStart: new Date('2025-12-20'),
            dateEnd: new Date('2025-12-25'),
            status: 'CONFIRMADA',
            propertyId: 'prop-cuid-1',
            userId: 'user-cuid-1',
            property: {
                id: 'prop-cuid-1',
                type: 'Casa',
                description: 'Uma casa grande', 
                dailyRate: 350.5,
            },
            user: {
                id: 'user-cuid-1',
                name: 'João da Silva',
                email: 'joao@email.com',
            },
        };

        const reserve = new Reserve(fullData);

        expect(reserve).toBeInstanceOf(Reserve);
        expect(reserve.id).toBe('reserve-cuid-1');
        expect(reserve.status).toBe('CONFIRMADA');
        expect(reserve.dateStart).toEqual(new Date('2025-12-20'));

        expect(reserve.property).toEqual({
            id: 'prop-cuid-1',
            type: 'Casa',
            dailyRate: 350.5,
        });
        
        expect(reserve.user).toEqual({
            id: 'user-cuid-1',
            name: 'João da Silva',
        });
    });

    it('should create a minimal Reserve instance without optional property and user data', () => {
        const minimalData = {
            id: 'reserve-cuid-2',
            dateStart: new Date('2025-11-10'),
            dateEnd: new Date('2025-11-12'),
            status: 'PENDENTE',
            propertyId: 'prop-cuid-2',
            userId: 'user-cuid-2',
        };
        
        const reserve = new Reserve(minimalData);

        expect(reserve).toBeInstanceOf(Reserve);
        expect(reserve.id).toBe('reserve-cuid-2');
        expect(reserve.property).toBeUndefined();
        expect(reserve.user).toBeUndefined();
    });

    it('should have a toJSON method that returns the instance itself', () => {
        const data = { id: 'reserve-cuid-3' };
        const reserve = new Reserve(data);
        
        const jsonResult = reserve.toJSON();
        
        expect(jsonResult).toBe(reserve);
        expect(jsonResult.id).toBe('reserve-cuid-3');
    });
});