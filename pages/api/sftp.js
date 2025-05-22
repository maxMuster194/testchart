import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// MongoDB-Verbindung
const mongoURI = 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

// Verbindung nur herstellen, wenn sie noch nicht besteht
if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error('MongoDB-Verbindungsfehler:', err));
}

// Flexibles Schema für dynamische CSV-Daten
const germanySchema = new mongoose.Schema({}, { strict: false });
const austriaSchema = new mongoose.Schema({}, { strict: false });

// Mongoose-Modelle nur einmal definieren
const GermanyPrice = mongoose.models.GermanyPrice || mongoose.model('GermanyPrice', germanySchema);
const AustriaPrice = mongoose.models.AustriaPrice || mongoose.model('AustriaPrice', austriaSchema);

// SFTP Config
const sftpConfig = {
  host: "ftp.epexspot.com",
  port: 22,
  username: "ew-reutte.marketdata",
  password: "j3zbZNcXo$p52Pkpo"
};

// CSV-Daten über SFTP laden
const fetchCSVData = async (remotePath) => {
  const sftp = new SFTPClient();
  try {
    await sftp.connect(sftpConfig);
    const fileData = await sftp.get(remotePath);
    await sftp.end();

    return new Promise((resolve, reject) => {
      Papa.parse(fileData.toString(), {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        dynamicTyping: true,
        complete: (result) => resolve(result.data),
        error: (error) => reject(error),
      });
    });
  } catch (err) {
    console.error("Fehler beim Abrufen der Datei:", err);
    return [];
  }
};

// CSV lokal speichern
const saveCSVFile = (data, filename) => {
  const csv = Papa.unparse(data);
  const filePath = path.join(process.cwd(), 'data', filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csv);
  return filePath;
};

// In MongoDB speichern
const insertToMongoDB = async (data, model) => {
  try {
    await model.insertMany(data, { ordered: false }); // ordered: false für bessere Performance
    console.log(`Daten erfolgreich in MongoDB gespeichert (${model.modelName})`);
  } catch (err) {
    console.error(`Fehler beim Schreiben in MongoDB (${model.modelName}):`, err);
  }
};

// API-Handler
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Nur GET-Anfragen erlaubt' });
  }

  const filePathGermany = '/germany/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_germany_luxembourg_2025.csv';
  const filePathAustria = '/austria/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_austria_2025.csv';

  try {
    const [germanyPrices, austriaPrices] = await Promise.all([
      fetchCSVData(filePathGermany),
      fetchCSVData(filePathAustria),
    ]);

    // Lokale Speicherung als CSV
    saveCSVFile(germanyPrices, 'germany_prices.csv');
    saveCSVFile(austriaPrices, 'austria_prices.csv');

    // In MongoDB speichern
    await Promise.all([
      insertToMongoDB(germanyPrices, GermanyPrice),
      insertToMongoDB(austriaPrices, AustriaPrice),
    ]);

    // Antwort an den Client
    res.status(200).json({
      message: "Daten erfolgreich verarbeitet.",
      germany: germanyPrices,
      austria: austriaPrices
    });
  } catch (error) {
    console.error('API-Fehler:', error);
    res.status(500).json({ error: error.message });
  }
}