import mongoose from 'mongoose';

const DEFAULT_LOCAL_URI = 'mongodb://localhost:27017/vehical';
const MONGODB_URI =
  process.env.MONGODB_URI?.trim() ||
  (process.env.NODE_ENV === 'production' ? '' : DEFAULT_LOCAL_URI);

let connectionPromise;

function getDatabaseConfigError() {
  if (MONGODB_URI) {
    return null;
  }

  return new Error(
    'Missing MONGODB_URI. Add your MongoDB connection string in the deployment environment.',
  );
}

export async function connectToDatabase() {
  const configError = getDatabaseConfigError();

  if (configError) {
    throw configError;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    await connectionPromise;
    return mongoose.connection;
  } catch (error) {
    connectionPromise = undefined;
    throw error;
  }
}

export { MONGODB_URI };
