import { describe, it, expect, vi, beforeEach } from 'vitest';
import userController from '../controller';
import userService from '../service';
import { before } from 'node:test';

vi.mock('../service', () => ({
    default: {
        createUser: vi.fn(),
        getAllUsers: vi.fn(),
        getUserById: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
    }
}));

const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
}

describe('test user controller', () => {
    let res;

    beforeEach(() => {
        res = mockResponse();
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const req = { validateData: { name: 'Pedro', email: 'pedro@test.com', password: '123' } };
            const userTest = { toJSON: () => ({ id:1, name:'Pedro'}) };

            userService.createUser.mockResolvedValue(userTest);
            await userController.create(req, res);

            expect(userService.createUser).toHaveBeenCalledWith(req.validatedData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id:1, name:'Pedro'});
        });

        it('should return a 400 if createUser throws', async () =>{
            const req = { validateData: { name: 'Pedro'} }
            userService.createUser.mockRejectedValue(new Error('Email já cadastrado!'));

            await userController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenLastCalledWith({ error: 'Email já cadastrado!' })
        });
    });

    describe('getAll', () => {
        it('should return a list of users', async () =>{
            const req = {};
            const usersTest = [{ toJSON: () => ({ id: 1, name: 'Pedro' }) }]
            userService.getAllUsers.mockResolvedValue(usersTest);

            await userController.getAll(req, res);

            expect(userService.getAllUsers).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Pedro' }])

        });

        it('should return 500 if getAllUsers throws', async () => {
            const req = {};
            userService.getAllUsers.mockRejectedValue(new Error('Erro inesperado'));

            await userController.getAll(req, res);

            expect(res.status).toHaveBeenLastCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro inesperado' });
        });
    });

    describe('getById', () => {
        it('should return a 400 if user does not exist', async () => {
            const req = { params: { id: 99 } };
            userService.getUserById.mockRejectedValue(new Error('Usuário não encontrado'));

            await userController.getById(req, res);

            expect(res.status).toHaveBeenLastCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' })
        });

        it('should return 404 if user not found', async () => {
            const req = { params: { id: 99 } };
            userService.getUserById.mockRejectedValue(new Error('Usuário não encontrado'));

            await userController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const req = { params: { id: 1 }, validatedData: { name: 'Novo Nome' } };
            const userTest = { toJSON: () => ({ id: 1, name: 'Novo Nome' }) };
            userService.updateUser.mockResolvedValue(userTest);
            
            await userController.update(req, res);

            expect(userService.updateUser).toHaveBeenCalledWith(1, req.validatedData);
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Novo Nome' });
        });

        it('should return 400 if user does not exist', async () => {
            const req = { params: { id: 1 }, validatedData: { email: 'teste@test.com' } };
            userService.updateUser.mockRejectedValue(new Error('Usuário não encontrado'));

            await userController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
        });
    });

    describe('delete', () => {
        it('shouls delete a user', async () => {
            const  req = { params: { id:1 } };
            userService.deleteUser.mockResolvedValue();

            await userController.delete(req, res);
            
            expect(userService.deleteUser).toHaveBeenLastCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            const req = { params: { is: 99 } };
            userService.deleteUser.mockRejectedValue(new Error('Usuário não encontrado'));

            await userController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
        });
    });

});