import mongoose from 'mongoose';

// MongoDB-Verbindung
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

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

// Schema für H0-Collection
const H0Schema = new mongoose.Schema({
  date: { type: String, required: true }, // Anpassung an 'date' statt 'datum'
  __parsed_extra: { type: Object, required: true }, // Anpassung an '__parsed_extra' als Objekt
  __v: { type: Number }, // Optional, wenn __v in den Daten vorhanden ist
}, { collection: 'H0' });

// Modell
const H0Model = mongoose.models.H0Model || mongoose.model('H0Model', H0Schema);

// API-Handler
export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const data = await H0Model.find({}).lean();
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'No data found in H0 collection' });
      }
      // Daten anpassen, um sicherzustellen, dass __parsed_extra numerische Werte enthält
      const formattedData = data.map((item) => ({
        _id: item._id,
        date: item.date,
        __parsed_extra: Object.fromEntries(
          Object.entries(item.__parsed_extra).map(([key, value]) => [key, Number(value)])
        ),
        __v: item.__v,
      }));
      return res.status(200).json(formattedData); // Entferne die unnötige 'h0'-Ebene
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}