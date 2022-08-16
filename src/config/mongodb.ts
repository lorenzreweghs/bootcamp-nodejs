// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://admin:${process.env.MONGODB_PWD}@bootcamp-nodejs.u9mqjtm.mongodb.net/?retryWrites=true&w=majority`;
export const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
