// pages/api/prices.js
import { connectToDatabase } from '../../lib/mongoose'; // Benannter Import
import Price from '../../models/Price'; // Pfad anpassen, falls kein @/models-Alias verwendet wird

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const { market, date } = req.query;

    const query = {};
    if (market) query.Market = market;
    if (date) query.Date = date;

    const prices = await Price.find(query).limit(100).lean();
    res.status(200).json({ success: true, data: prices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fehler beim Abrufen der Daten' });
  }
}