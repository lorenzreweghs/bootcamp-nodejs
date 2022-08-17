// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
import * as mongoDB from 'mongodb';

export const collections: { users?: mongoDB.Collection } = {};

export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGODB_URI!);

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DATABASE);

  const userCollection: mongoDB.Collection = db.collection(
    process.env.NODE_ENV === 'test' ? process.env.USER_TEST_COLLECTION! : process.env.USER_COLLECTION!,
  );

  collections.users = userCollection;

  console.log(
    `Successfully connected to database: ${db.databaseName} and collection: ${userCollection.collectionName}`,
  );
}
