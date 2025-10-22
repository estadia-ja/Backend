import { describe, vi, beforeEach, it, expect } from 'vitest';
import { prisma } from '../../database';
import userService from '../service';
import bcrypt from 'bcrypt';
import User from '../model';

vi.mock('../../database', () => ({
    prisma:{
        user:{
            findFirst: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        },
        phone: {
            createMany: vi.fn(),
            deleteMany: vi.fn(),
        },
        $transaction: vi.fn().mockImplementation(async (callback) => {
            const mockTx = {
                user: prisma.user,
                phone: prisma.phone,
            };
            return await callback(mockTx);
        }),
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
                phones: ['(11) 98765-4321']
            }

            const createUser = { id: 'user-cuid', ...userTest};
            const createUserWithPhones = { ...createUser, phones: [{ id: 'phone-cuid', phone: userTest.phones[0] }] };
            prisma.user.findFirst.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword123');
            prisma.user.create.mockResolvedValue(createUser);
            prisma.user.findUnique.mockResolvedValue(createUserWithPhones);

            const result = await userService.createUser(userTest);
            expect(prisma.user.findFirst).toHaveBeenCalledWith({
                where: { OR: [{ email: userTest.email }, { cpf: userTest.cpf }] }
            });
            expect(prisma.user.create).toHaveBeenCalled();
            expect(prisma.phone.createMany).toHaveBeenCalledWith({
                data: [{ phone: userTest.phones[0], userId: userTest.id }]
            });
            expect(result).toBeInstanceOf(User);
        });

        it('should throw error if email already exists', async () => {
            const userData = { email: 'pedro@test.com', cpf: '123.456.789-01' };
            prisma.user.findFirst.mockResolvedValue({ id: 1, ...userData });

            await expect(userService.createUser(userData))
                .rejects
                .toThrowError('Email ou CPF já cadastrado!');
        });
    })

    describe('getAllUsers', () => {
        it('should return a list of user', async () =>{
            const usersTest = [
                { id: 1, name: 'Pedro', email: 'pedro@test.com', phones: ['(11) 11111-1111'], cpf: '12345678901', password: 'hashedPassword123', createdAt: new Date(), updatedAt: new Date() },
                { id: 2, name: 'Maria', email: 'maria@test.com', phones: ['(22) 22222-2222'], cpf: '98765432100', password: 'hashedPassword123', createdAt: new Date(), updatedAt: new Date() }
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
            const data = {
                id: 1,
                name: 'Pedro',
                email: 'pedro@test.com',
                password: 'superSecretPassword'
            };
            const user = new User(data);
            const jsonUser = user.toJSON();
        
            expect(jsonUser).not.toHaveProperty('password');
        
            expect(jsonUser).toHaveProperty('id', 1);
            expect(jsonUser).toHaveProperty('name', 'Pedro');
            expect(jsonUser.password).toBeUndefined();
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
            const userId = 'user-cuid';
            const updateData = {
                name: 'Pedro Atualizado',
                phones: ['(22) 11111-2222']
            };
            const updatedUser = { id: userId, name: 'Pedro Atualizado' };

            const mockTx = {
                user: { update: vi.fn().mockResolvedValue(updatedUser) },
                phone: { deleteMany: vi.fn(), createMany: vi.fn() }
            };
            prisma.$transaction.mockImplementation(async (callback) => await callback(mockTx));

            const finalUserInstance = new User({ ...updatedUser, phones: [{ phone: updateData.phones[0] }] });
            vi.spyOn(userService, 'getUserById').mockResolvedValue(finalUserInstance);
            
            const result = await userService.updateUser(userId, updateData);

            expect(prisma.$transaction).toHaveBeenCalledOnce();
            
            expect(mockTx.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { name: 'Pedro Atualizado' }
            });
            
            expect(mockTx.phone.deleteMany).toHaveBeenCalledWith({ where: { userId } });
            expect(mockTx.phone.createMany).toHaveBeenCalledWith({
                data: [{ phone: updateData.phones[0], userId }]
            });
            expect(userService.getUserById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(finalUserInstance);
        });
    });

    describe('deleteUser', () => {
        it('should throw error if user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(userService.deleteUser(2))
                .rejects
                .toThrowError('Usuário não encontrado')
            
            expect(prisma.user.findUnique).toBeCalledTimes(1);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
        });

        it('should delete a user', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 2, email: 'teste@test.com' });

            prisma.user.delete.mockResolvedValue({ id: 2 });
            const result = await userService.deleteUser(2);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(result).toBeUndefined()
        });
    });

    describe('updateImage', () => {
        it('should update the user image', async () => {
            const imageBuffer = Buffer.from('imageTest');
            const userTest = { id: 1, name: 'Pedro', email: 'pedro@test.com', image: imageBuffer };

            prisma.user.update.mockResolvedValue(userTest);
            const result = await userService.updateImage(1, imageBuffer);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { image: imageBuffer}
            });
            expect(result).toBeInstanceOf(User);
            expect(result.image).toEqual(imageBuffer);
        });
    });

    describe('getImage', () => {
        it('should return user image', async () => {
            const imageBuffer = Buffer.from('imageTest');
            prisma.user.findUnique.mockResolvedValue({ image: imageBuffer });

            const result = await userService.getImage(1);
            
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: { image: true }
            });
            expect(result).toEqual(imageBuffer);
        });

        it('should throw error if user does not exists', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(userService.getImage(99))
                .rejects
                .toThrow('Usuário não encontrada');
        });

        it('should throw error if user has no image', async () => {
            prisma.user.findUnique.mockResolvedValue({ image: null });

            await expect(userService.getImage(19))
                .rejects
                .toThrow('Imagem não encontrada');
        });
    })
})