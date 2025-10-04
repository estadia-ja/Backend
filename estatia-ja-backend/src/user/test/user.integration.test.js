import { describe, it, expect, afterEach } from "vitest";
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../database';

describe('User Routes - Integration Tests (End-to-End', () => {
  afterEach(async () => {
    await prisma.user.deleteMany({});
  });

  describe('post /user', () =>{
    it('sholud create a new user', async () => {
      const userTest = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123', 
      };

      const response = await request(app)
        .post('/user')
        .send(userTest);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userTest.email);

      const userInDb = await prisma.user.findUnique({
        where: { email: userTest.email },
      });
      expect(userInDb).not.toBeNull();
    });

    it('should return status 400 if validation fails', async () => {
      const userInvalid = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
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
      };

      await request(app).post('/user').send(userExists);

      const newUser = {
        name: 'Pedro Cabeceira',
        email: 'pedro.test@example.com',
        password: 'Password12345',
      };

      const response = await request(app)
        .post('/user')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email já cadastrado');
    });
  });

  describe('get /user', () => {
    it('should return a list of users', async () => {
      const usersTest = [
        {
          name: 'Pedro Teste',
          email: 'pedro@test.com',
          password: 'Password123',
          phone: '(11) 11111-1111',
          cpf: '12345678901'
        },
        {
          name: 'Maria Teste',
          email: 'maria@test.com',
          password: 'Password456',
          phone: '(22) 22222-2222',
          cpf: '98765432100'
        }
      ]

      await prisma.user.createMany({
        data: usersTest,
      });

      const response = await request(app).get('/user')

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('get /user/:id', () => {
    it('should return a user', async () => {
      const userTest = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123', 
      };

      const createUser = await prisma.user.create({
        data: userTest,
      });

      const response = await request(app).get(`/user/${createUser.id}`)

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createUser.id);
      expect(response.body.name).toBe(userTest.name);
    });

    it('should return 404 if user doent not exist', async () => {
      const noExistentId = 'clxjhg82z00001234abcd1234';
      const response = await request(app).get(`/user/${noExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Usuário não encontrado');
    });
  });

  describe('update /user/:d', () => {
    it('should update a user', async () => {
      const userTest = {
        name: 'Pedro',
        email: 'pedro.test@example.com',
        password: 'Password123', 
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
        },
      });
    
      const userB = await prisma.user.create({
        data: {
          name: 'Maria Teste',
          email: 'maria@test.com',
          password: 'Password456',
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
});

