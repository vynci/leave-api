import * as mongoDB from "mongodb";

const DB_CONN_STRING =
  "mongodb+srv://noayaleave:noaya123@noayaleave.1bhkm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const DB_NAME = "noaya-leave";
const LEAVE_COLLECTION = "leaves";
const USER_COLLECTION = "users";
const REFRESH_TOKEN_COLLECTION = "refresh-tokens";
export const collections: {
  users?: mongoDB.Collection;
  leaves?: mongoDB.Collection;
  refreshTokens?: mongoDB.Collection;
} = {};

export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(DB_CONN_STRING);

  await client.connect();

  const db: mongoDB.Db = client.db(DB_NAME);

  const leaveCollection: mongoDB.Collection = db.collection(LEAVE_COLLECTION);
  const userCollection: mongoDB.Collection = db.collection(USER_COLLECTION);
  const refreshTokenCollection: mongoDB.Collection = db.collection(
    REFRESH_TOKEN_COLLECTION
  );

  collections.leaves = leaveCollection;
  collections.users = userCollection;
  collections.refreshTokens = refreshTokenCollection;

  console.log(
    `Successfully connected to database: ${db.databaseName} and collection: ${leaveCollection.collectionName} ,${userCollection.collectionName} ,${refreshTokenCollection.collectionName}`
  );
}
