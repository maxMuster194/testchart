// pages/api/sftp.js
import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import { connectDB } from '../../lib/mongoose';
import Price from '../../models/Price';

const sftp = new SFTPClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  try {
    await sftp.connect({
      host: 'daten.energiedaten.info',
      port: 22,
      username: 'anonymous',
      password: 'anonymous',
    });

    const fileBuffer = await sftp.get('/MarketData/Energy/DayAhead/Auction/euro/mid/midprice_202405.csv');
    const fileContent = fileBuffer.toString();

    const { data } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    await Price.deleteMany(); // optional: alte löschen
    await Price.insertMany(data); // neue einfügen

    await sftp.end();
    res.status(200).json({ message: 'Import erfolgreich', count: data.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Importieren', error });
  }
}
