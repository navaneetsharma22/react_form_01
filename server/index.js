import 'dotenv/config';
import { createApp } from './createApp.js';
import { connectToDatabase, MONGODB_URI } from './db.js';

const app = createApp();
const PORT = process.env.PORT || 4000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log(`MongoDB connected at ${MONGODB_URI}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
