import { describe, vi, beforeEach, it, expect } from 'vitest';
import { prisma } from '../../database';
import userService from '../service';
import bcrypt from 'bcrypt';
import User from '../model';

vi.mock('../../database', () => ({
    prisma:{
        user:{
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        },
    },
}));

vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn(),
    }
}));

describe('test user service', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword123');

            const userTest = {
                id: 1,
                name: 'Pedro',
                email: 'pedro@test.com',
                password: 'hashedPassword123',
            }

            prisma.user.create.mockResolvedValue(userTest);
            const result = await userService.createUser({
                name: 'Pedro',
                email: 'pedro@test.com',
                password: '123456',
            });

            expect(prisma.user.findUnique).toHaveBeenLastCalledWith({
                where: { email: 'pedro@test.com' }
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Pedro',
                    email: 'pedro@test.com',
                    password: 'hashedPassword123',
                },
            });
            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Pedro',
                email: 'pedro@test.com',
            }));
        });

        it('should throw error if email already exists', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'pedro@test.com' });

            await expect(userService.createUser({
                name: 'Pedro',
                email: 'pedro@test.com',
                password: '123456'
            }))
                .rejects
                .toThrowError('Email já cadastrado!')
            
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'pedro@test.com' }
            });
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    })

    describe('getAllUsers', () => {
        it('should return a list of user', async () =>{
            const usersTest = [
                { id: 1, name: 'Pedro', email: 'pedro@test.com', phone: '(11) 11111-1111', cpf: '12345678901', password: 'hashedPassword123', createdAt: new Date(), updatedAt: new Date() },
                { id: 2, name: 'Maria', email: 'maria@test.com', phone: '(22) 22222-2222', cpf: '98765432100', password: 'hashedPassword123', createdAt: new Date(), updatedAt: new Date() }
            ]

            prisma.user.findMany.mockResolvedValue(usersTest);
            const result = await userService.getAllUsers();

            expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Pedro');
            expect(result[1].email).toBe('maria@test.com');
        });
    });

    describe('getUserById', () => {
        it('should return user', async () => {
            const userTest = { 
                id: 1, name: 'Pedro', email: 'pedro@test.com', phone: '(11) 11111-1111', cpf: '12345678901', password: 'hashedPassword123', createdAt: new Date(), updatedAt: new Date()
            }

            prisma.user.findUnique.mockResolvedValue(userTest);
            const result = await userService.getUserById(1);

            expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
            expect(result.name).toBe('Pedro');
            expect(result.email).toBe('pedro@test.com');
        });

        it('should throw error if user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null)
          
            await expect(userService.getUserById(2))
              .rejects
              .toThrow('Usuário não encontrado')
          
            expect(prisma.user.findUnique).toBeCalledTimes(1)
        });  
    });

    describe('updateUser', () => {
        it('should throw error if user does not exist', async () =>{
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(userService.updateUser(1, {name: 'Lucas'}))
                .rejects
                .toThrow('Usuário não encontrado')
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: {id: 1 } })
        });

        it('should throw error if email already exist', async () => {
            prisma.user.findUnique
                .mockResolvedValue({ id: 1, email: 'pedro@test.com' })
                .mockResolvedValue({ id: 2, email: 'outropedro@test.com' })

            await expect(userService.updateUser(1, {email: 'outropedro@test.com'}))
                .rejects
                .toThrowError('Email já esta em uso')

            expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
        });
              
        it('should update user', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'velho@test.com' })
            prisma.user.update.mockResolvedValue({ id: 1, name: 'Novo Nome', email: 'velho@test.com' })

            const result = await userService.updateUser(1, { name: 'Novo Nome'});

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { name: 'Novo Nome' }
            });
            expect(result).toBeInstanceOf(User);
            expect(result.name).toBe('Novo Nome');
        });
    });

    describe('deleteUser', () => {
        it('should throw error if user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(userService.updateUser(2))
                .rejects
                .toThrowError('Usuário não encontrado')
            
            expect(prisma.user.findUnique).toBeCalledTimes(1);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
        });

        it('should delete a user', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 2, email: 'teste@test.com' });

            prisma.user.delete.mockResolvedValue({ id: 1 });
            const result = await userService.deleteUser(2);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(result).toBeUndefined()
        });
    });
})