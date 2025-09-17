const bcrypt = require('bcrypt');
const User = require('./model');
const { prisma } = require('../database');

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
    }
}

module.exports = userService;