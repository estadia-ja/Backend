import bcrypt from 'bcrypt';
import User from './model.js';
import { prisma } from '../database.js';

const userService = {
    async createUser(userData) {
        const { phones, ...userOnlyData } = userData;
    
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: userOnlyData.email },
                    { cpf: userOnlyData.cpf }
                ]
            }
        });
    
        if (existingUser) {
            throw new Error('Email ou CPF já cadastrado!');
        }
    
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userOnlyData.password, saltRounds);
    
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    ...userOnlyData,
                    password: hashedPassword
                }
            });
    
            if (phones && phones.length > 0) {
                await tx.phone.createMany({
                    data: phones.map(p => ({
                        phone: p,
                        userId: user.id
                    }))
                });
            }
            return user;
        });
    
        const userWithPhones = await prisma.user.findUnique({
            where: {
                id: newUser.id
            },
            include: {
                phones: {
                    select: {
                        id: true,
                        phone: true
                    }
                }
            }
        });
        
        return new User(userWithPhones);
    },

    async getAllUsers(){
        const users = await prisma.user.findMany({
            include: {
                phones: {
                    select: {
                        id: true,
                        phone: true
                    }
                }
            }
        });
        
        return users.map(user => new User(user));
    },

    async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id: id },
            include: {
                phones: {
                    select: {
                        id: true,
                        phone: true
                    }
                }
            }
        });

        if(!user){
            throw new Error('Usuário não encontrado');
        }

        return new User(user);
    },

    async updateUser(id, userData){
        const {phones, ...userOnlyData} = userData
        const existingUser = await prisma.user.findUnique({ where: {id: id}});
        if(!existingUser){
            throw new Error('Usuário não encontrado');
        }

        if(userData.email && userData.email !== existingUser) {
            const emailExists = await prisma.user.findUnique({
                where: { email: userData.email }
            });
            if(emailExists) {
                throw new Error('Email já esta em uso');
            }
        }

        const updatedUser = await prisma.$transaction(async (tx) =>{
            const user = await tx.user.update({
                where:{ id: id },
                data: {...userOnlyData}
            });

            if(phones) {
                await tx.phone.deleteMany({
                    where:{ userId: id }
                });

                await tx.phone.createMany({
                    data: phones.map(p => ({
                        phone: p,
                        userId: id
                    }))
                });
            }
            return user;
        });

        const userWithPhones = await this.getUserById(updatedUser.id);
        return new User(userWithPhones);
    },

    async deleteUser(id) {
        const existingUser = await prisma.user.findUnique({ where: { id: id }});
        if(!existingUser) {
            throw new Error('Usuário não encontrado');
        }

        await prisma.user.delete({ where: { id: id }});
    },

    async updateImage(id, imageBuffer) {
        const user = await prisma.user.update({
            where: { id },
            data: { image: imageBuffer }
        });
    
        return new User(user);
    },
    

    async getImage(id) {
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {image: true }
        });

        if(!user){
            throw new Error("Usuário não encontrada");
        }

        if(!user.image){
            throw new Error("Imagem não encontrada");
        }

        return user.image;
    },
}

export default userService;