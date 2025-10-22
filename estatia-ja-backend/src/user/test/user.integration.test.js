import { describe, it, expect, afterEach } from "vitest";
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../database';

describe('User Routes - Integration Tests (End-to-End', () => {
  afterEach(async () => {
    await prisma.propertyValuation.deleteMany({});
    await prisma.clientValuation.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.propertyImage.deleteMany({});
    await prisma.reserve.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.phone.deleteMany({});
  await prisma.user.deleteMany({});
  });

  describe('post /user', () =>{
    it('sholud create a new user', async () => {
      const userTest = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123', 
        cpf: '111.222.333-44',
        phones: ['(11) 99999-8888']
      };

      const response = await request(app)
        .post('/user')
        .send(userTest);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userTest.email);
      expect(response.body.phones).toBeInstanceOf(Array);
      expect(response.body.phones).toHaveLength(1);
      expect(response.body.phones[0].phone).toBe(userTest.phones[0]);


      const userInDb = await prisma.user.findUnique({
        where: { email: userTest.email },
      });
      const phoneInDb = await prisma.phone.findFirst({
        where: { userId: userInDb.id }
      });
      expect(userInDb).not.toBeNull();
      expect(phoneInDb).not.toBeNull();
      expect(phoneInDb.phone).toBe(userTest.phones[0]);
    });

    it('should return status 400 if validation fails', async () => {
      const userInvalid = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/user')
        .send(userInvalid);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return status 400 if the email is already exist', async () => {
      const userExists = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123',
        cpf: '111.222.333-44',
      };

      await request(app).post('/user').send(userExists);

      const newUser = {
        name: 'Pedro Cabeceira',
        email: 'pedro.test@example.com',
        password: 'Password12345',
        cpf: '111.555.333-44',
      };

      const response = await request(app)
        .post('/user')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email ou CPF já cadastrado');
    });

    it('should return status 400 if the cpf is already in use', async () => {
      const userExists = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123',
        cpf: '111.222.333-44',
      };
      await request(app).post('/user').send(userExists);

      const newUserWithSameCpf = {
        name: 'Maria',
        email: 'maria@example.com',
        password: 'Password12345',
        cpf: '111.222.333-44', 
      };
      const response = await request(app).post('/user').send(newUserWithSameCpf);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email ou CPF já cadastrado');
    });
  });

  describe('get /user', () => {
    it('should return a list of users', async () => {
      const user1 = await prisma.user.create({
        data: {
          name: 'Maria Teste',
          email: 'maria@test.com',
          password: 'Password456',
          cpf: '987.654.321-00'
        },
      });

      const user2 = await prisma.user.create({
        data: {
          name: 'Pedro Teste',
          email: 'pedro@test.com',
          password: 'Password456',
          cpf: '987.094.321-00'
        },
      });

      await prisma.phone.create({
        data: {
          phone: '(22) 22222-2222',
          userId: user1.id
        }
      });

      await prisma.phone.create({
        data: {
          phone: '(64) 22376-2222',
          userId: user2.id
        }
      });

      const response = await request(app).get('/user')

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].phones).toBeInstanceOf(Array);
    });
  });

  describe('get /user/:id', () => {
    it('should return a user', async () => {
      const createUser = await prisma.user.create({
        data: { 
          name: 'Pedro', 
          email: 'pedro@test.com', 
          password: '123', 
          cpf: '123.123.123-12' },
      });

      await prisma.phone.create({ 
        data: { phone: '(11) 12345-6789', userId: createUser.id } 
      });

      const response = await request(app).get(`/user/${createUser.id}`)

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createUser.id);
      expect(response.body.phones).toHaveLength(1);
      expect(response.body.name).toBe(createUser.name);
      expect(response.body.phones[0].phone).toBe('(11) 12345-6789');
    });

    it('should return 404 if user doent not exist', async () => {
      const noExistentId = 'clxjhg82z00001234abcd1234';
      const response = await request(app).get(`/user/${noExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Usuário não encontrado');
    });
  });

  describe('update /user/:id', () => {
    it('should update a user', async () => {
      const userTest = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123', 
        cpf: '123.234.234-34'
      };

      const createUser = await prisma.user.create({
        data: userTest,
      });

      const userUpdate = {
        email: 'pedro.test.update@example.com'
      };

      const response = await request(app)
        .put(`/user/${createUser.id}`)
        .send(userUpdate)

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(userUpdate.email);
      const userInDb = await prisma.user.findUnique({ 
        where: { id: createUser.id },
      });
      expect(userInDb.email).toBe(userUpdate.email);
    });

    it('should update a user and replace their phones', async () => {
      const userTest = await prisma.user.create({
        data: { 
          name: 'Pedro', 
          email: 'pedro@test.com', 
          password: '123', 
          cpf: '123.123.123-12' },
      });
      await prisma.phone.create({ data: { phone: '(11) 11111-1111', userId: userTest.id } });

      const updateUser = {
        name: 'Pedro Atualizado',
        phones: ['(99) 99999-9999']
      };

      const response = await request(app)
        .put(`/user/${userTest.id}`)
        .send(updateUser);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Pedro Atualizado');
      expect(response.body.phones[0].phone).toBe('(99) 99999-9999');

      const phonesInDb = await prisma.phone.findMany({ where: { userId: userTest.id } });
      expect(phonesInDb).toHaveLength(1);
      expect(phonesInDb[0].phone).toBe('(99) 99999-9999');
    });

    it('should reutrna erro if user does not exist', async () => {
      const noExistentId = 'clxjhg82z00001234abcd1234';
      const userUpdate = {
        email: 'pedro.test.update@example.com'
      };
      const response = await request(app)
        .put(`/user/${noExistentId}`)
        .send(userUpdate)

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Usuário não encontrado');
    });

    it('should reutrna erro if email exists in db', async () => {
      const userA = await prisma.user.create({
        data: {
          name: 'Pedro Teste',
          email: 'pedro@test.com',
          password: 'Password123',
          cpf: '123.234.234-34'
        },
      });
    
      const userB = await prisma.user.create({
        data: {
          name: 'Maria Teste',
          email: 'maria@test.com',
          password: 'Password456',
          cpf: '123.768.234-34'
        },
      });
    
      const userUpdate = {
        email: userB.email,
      };
    
      const response = await request(app)
        .put(`/user/${userA.id}`)
        .send(userUpdate);
    
      expect(response.status).toBe(400)
      expect(response.body.error).toContain('Email já esta em uso')
    });
  });

  describe('delete /user/:id', () => {
    it('should delete a user', async () => {
      const user = await prisma.user.create({
        data: { name: 'Pedro', email: 'pedro@test.com', password: '123', cpf: '123.123.123-12' },
      });
      await prisma.phone.create({ data: { phone: '(11) 11111-1111', userId: user.id } });

      const response = await request(app).delete(`/user/${user.id}`);

      expect(response.status).toBe(204);
      const userInDb = await prisma.user.findUnique({ where: { id: user.id } });
      // MUDANÇA: Verificar também se os telefones foram deletados (por causa do onDelete: Cascade).
      const phonesInDb = await prisma.phone.findMany({ where: { userId: user.id } });
      expect(userInDb).toBeNull();
      expect(phonesInDb).toHaveLength(0);
    });

    it('should return a error if userr does not exists', async () => {
      const noExistentId = 'clxjhg82z00001234abcd1234';
      const response = await request(app).delete(`/user/${noExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Usuário não encontrado');
    });
  });
});

