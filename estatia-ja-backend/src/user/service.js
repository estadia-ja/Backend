import bcrypt from 'bcrypt';
import User from './model.js';
import { prisma } from '../database.js';

const userService = {
    async createUser(userData) {
        const existingUser = await prisma.user.findUnique({
            where: {email: userData.email }
        });
        if (existingUser){
            throw new Error('Email já cadastrado!', existingUser);
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword
            }
        });

        return new User(user);
    },

    async getAllUsers(){
        const users = await prisma.user.findMany({
            select : {
                id: true,
                name: true,
                email: true,
                phone: true,
                cpf: true,
                createdAt: true,
                updatedAt: true
            }
        });
        
        return users.map(user => new User(user));
    },

    async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id: id },
            select : {
                id: true,
                name: true,
                email: true,
                phone: true,
                cpf: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if(!user){
            throw new Error('Usuário não encontrado');
        }

        return new User(user);
    },

    async updateUser(id, userData){
        const existingUser = await prisma.user.findUnique({ where: {id: id}});
        if(!existingUser){
            throw new Error("Usuário não encontrado");
        }

        if(userData.email && userData.email !== existingUser) {
            const emailExists = await prisma.user.findUnique({
                where: { email: userData.email }
            });
            if(emailExists) {
                throw new Error('Email já esta em uso');
            }
        }

        const updateUser = await prisma.user.update({
            where: { id: id },
            data: userData
        });

        return new User(updateUser);
    },

    async deleteUser(id) {
        const existingUser = await prisma.user.findUnique({ where: { id: id }});
        if(!existingUser) {
            throw new Error("Usuário não encontrado");
        }

        await prisma.user.delete({ where: { id: id }});
    },
}

module.exports = userService;