import supertest from 'supertest';
import app from '../src/app';
import { prisma } from '../src/database';
import itemFactory from './factories/itemFactory';

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "items"`;
});


describe('Testa POST /items ', () => {
  it('Deve retornar 201, se cadastrado um item no formato correto', async () => {
    const item = await itemFactory();

    const result = await supertest(app).post('/items').send(item);

    expect(result.status).toBe(201);
  });

  it('Deve retornar 409, ao tentar cadastrar um item que exista', async () => {
    const item = await itemFactory();

    await supertest(app).post('/items').send(item);
    const result = await supertest(app).post('/items').send(item);

    expect(result.status).toBe(409);
  });
});


describe('Testa GET /items ', () => {
  it('Deve retornar status 200 e o body no formato de Array', async () => {
    const result = await supertest(app).get('/items').send();

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Array);
  });
});


describe('Testa GET /items/:id ', () => {
  it('Deve retornar status 200 e um objeto igual ao item cadastrado', async () => {
    const item = await itemFactory();
    const itemBD = await supertest(app).post('/items').send(item);

    const id = Number(itemBD.body.id);
    const result = await supertest(app).get(`/items/${id}`).send();

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ ...item, id });
  });

  it('Deve retornar status 404 caso não exista um item com esse id', async () => {
    const { body } = await supertest(app).get('/items').send();

    const id = Number(body.length + 10);
    const result = await supertest(app).get(`/items/${id}`).send();

    expect(result.status).toBe(404);
  });
});


afterAll(async () => {
  await prisma.$disconnect();
});