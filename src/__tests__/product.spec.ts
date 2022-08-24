import { collections, connectToDatabase } from '../services/database.service';

describe('products', () => {
  beforeAll(async () => {
    await connectToDatabase().connect();

    try {
      await collections.products?.deleteMany({});

      await collections.products?.insertMany([
        {
          name: 'Appel',
          description: 'Heerlijk sappig',
          price: 1.0,
          discount: 0.1,
          category: 'Fruit',
          stock: 14,
        },
        {
          name: 'Peer',
          description: 'Fijne textuur',
          price: 1.5,
          discount: 0.3,
          category: 'Fruit',
          stock: 8,
        },
        {
          name: 'Banaan',
          description: 'Perfecte kromming',
          price: 0.9,
          discount: 0.2,
          category: 'Fruit',
          stock: 3,
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  });

  afterAll(async () => {
    await connectToDatabase().disconnect();
  });

  describe('GET product', () => {});
  describe('GET products', () => {});
  describe('POST product', () => {});
  describe('PUT product', () => {});
  describe('DELETE product', () => {});
});
