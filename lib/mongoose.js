// lib/mongoose.js
import mongoose from 'mongoose';

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'Strom',
  });
}

export default mongoose; // Exportiert die mongoose-Instanz