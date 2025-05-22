// pages/api/mongodb-austria.js
import mongoose from 'mongoose';

// MongoDB connection function
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    // Already connected
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

// Define schema for austriaprices collection (adjust as needed)
const AustriaPriceSchema = new mongoose.Schema({
  date: String,
  __parsed_extra: [String], // Adjust based on actual data structure
  // Add other fields if present in your collection
}, { collection: 'austriaprices' }); // Explicitly set collection name

const AustriaPrice = mongoose.models.AustriaPrice || mongoose.model('AustriaPrice', AustriaPriceSchema, 'austriaprices');

// API route handler
export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    await connectDB();

    if (req.method === 'GET') {
      // Query the test.austriaprices collection
      const data = await AustriaPrice.find({}).lean();
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'No data found in austriaprices collection' });
      }
      return res.status(200).json({ austria: data });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}