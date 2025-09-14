const { prisma } = require('../database');

const userRepository = {
    async create(userData){
        return await prisma.user.create({
            data: userData,
            select: {
                id:true,
                name:true,
                email:true,
                phone:true,
                cpf:true,
                createdAt:true
            }
        });
    },

    async findByEmail(email){
        return await prisma.user.findUnique({
            where: {email}
        });
    },
}

module.exports = userRepository;