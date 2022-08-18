// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
import * as mongoDB from 'mongodb';

interface ICollections {
  users?: mongoDB.Collection;
  products?: mongoDB.Collection;
  baskets?: mongoDB.Collection;
}

export const collections: ICollections = {};

export function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGODB_URI!);

  const connect = async () => {
    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DATABASE);

    const userCollection: mongoDB.Collection = db.collection(
      process.env.NODE_ENV === 'test' ? process.env.USER_TEST_COLLECTION! : process.env.USER_COLLECTION!,
    );
    collections.users = userCollection;

    const productCollection: mongoDB.Collection = db.collection(
      process.env.NODE_ENV === 'test' ? process.env.PRODUCT_TEST_COLLECTION! : process.env.PRODUCT_COLLECTION!,
    );
    collections.products = productCollection;

    const basketCollection: mongoDB.Collection = db.collection(
      process.env.NODE_ENV === 'test' ? process.env.BASKET_TEST_COLLECTION! : process.env.BASKET_COLLECTION!,
    );
    collections.baskets = basketCollection;

    console.log(`Successfully connected to database '${db.databaseName}'`);
  };

  const disconnect = async () => {
    await client.close();
  };

  return {
    connect,
    disconnect,
  };
}
