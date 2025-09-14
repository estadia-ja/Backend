const bcrypt = require('bcrypt');
const userRepository = require('./repository')

const userService = {
    async createUser(userData){
        const existingUser = await userRepository.findByEmail(userData.email);
        if(existingUser){
            throw new Error('Email já cadastrado!');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        return await userRepository.create({
           ...userData,
           password:hashedPassword 
        });
    }
};

module.exports = userService;