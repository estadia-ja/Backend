const bcrypt = require('bcrypt');
const User = require('./model');
const { prisma } = require('../database');

const userService = {
    async createUser(userData) {
        const existingUser = prisma.user.findUnique({
            where: {email: userData.email }
        });
        if (existingUser){
            throw new Error('Email já cadastrado!');
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
    }
}

module.exports = userService;