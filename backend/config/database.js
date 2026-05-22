const mongoose = require("mongoose");

const DEFAULT_DB_NAME = "sturum";

/**
 * Prefer MONGO_URI, then Compass/local, then Atlas.
 * Many Atlas URIs omit the db path — Mongoose then uses "test".
 */
const getMongoUri = () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGO_URI_COMPASS ||
    process.env.MONGO_URI_ATLAS;

  if (!uri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGO_URI (or MONGO_URI_COMPASS / MONGO_URI_ATLAS) in .env"
    );
  }

  return uri;
};

const getMongoOptions = () => ({
  dbName: process.env.MONGO_DB_NAME || DEFAULT_DB_NAME,
});

const connectDatabase = async () => {
  const uri = getMongoUri();
  const options = getMongoOptions();

  await mongoose.connect(uri, options);

  const dbName = mongoose.connection.db?.databaseName;
  console.log(`MongoDB connected (database: ${dbName})`);
  console.log("[fileStorage] Uploads persist in MongoDB GridFS (survives Render redeploys)");

  return mongoose.connection;
};

module.exports = {
  DEFAULT_DB_NAME,
  getMongoUri,
  getMongoOptions,
  connectDatabase,
};
