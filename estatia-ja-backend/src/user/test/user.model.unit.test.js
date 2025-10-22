import { describe, vi, expect, it } from 'vitest';
import User from '../model';

describe('test user model', () => {
    it('should create a User instance', () => {
        const data = {
            id: 1,
            name: 'Pedro',
            email: 'pedro@test.com',
            cpf: '12345678901',
            password: 'hashedPassword123',
            image: Buffer.from('imageTest'),
            phones: [{ id: 'phone-cuid', phone: '(11) 99999-8888' }],
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-02')
        };

        const user = new User(data);

        expect(user.id).toBe(1);
        expect(user.name).toBe('Pedro');
        expect(user.email).toBe('pedro@test.com');
        expect(user.phones).toEqual([{ id: 'phone-cuid', phone: '(11) 99999-8888' }]);
        expect(user.cpf).toBe('12345678901');
        expect(user.password).toBe('hashedPassword123');
        expect(user.image).toEqual(Buffer.from('imageTest'));
        expect(user.createdAt).toEqual(new Date('2025-01-01'));
        expect(user.updatedAt).toEqual(new Date('2025-01-02'));
    });

    it('should return JSON without password', () => {
        const data = {
            id: 1,
            name: 'Pedro',
            email: 'pedro@test.com',
            cpf: '12345678901',
            password: 'hashedPassword123',
            image: Buffer.from('imageTest'),
            phones: [{ id: 'phone-cuid', phone: '(11) 99999-8888' }],
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-02')
        };

        const user = new User(data);
        const json = user.toJSON();

        expect(json).toEqual({
            id: 1,
            name: 'Pedro',
            email: 'pedro@test.com',
            cpf: '12345678901',
            image: Buffer.from('imageTest'),
            avgRating: null,
            phones: [{ id: 'phone-cuid', phone: '(11) 99999-8888' }],
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-02')
        });

        expect(json.password).toBeUndefined();
    });

    it('should handle cases where phones array is empty or not provided', () => {
        const data = { id: 'some-cuid', name: 'Pedro' };
        const user = new User(data);
        const json = user.toJSON();

        expect(user.phones).toEqual([]);
        expect(json.phones).toEqual([]);
    });
});