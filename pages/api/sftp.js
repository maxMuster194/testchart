import SFTPClient from 'ssh2-sftp-client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import cron from 'node-cron';

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

// In MongoDB speichern (bestehende Daten löschen und neue einfügen)
const updateMongoDB = async (data, model) => {
  try {
    // Bestehende Daten löschen
    await model.deleteMany({});
    // Neue Daten einfügen
    await model.insertMany(data, { ordered: false });
    console.log(`Daten erfolgreich in MongoDB aktualisiert (${model.modelName})`);
  } catch (err) {
    console.error(`Fehler beim Aktualisieren in MongoDB (${model.modelName}):`, err);
  }
};

// Funktion zum Abrufen und Aktualisieren der Daten
const updateData = async () => {
  console.log('Datenaktualisierung gestartet:', new Date().toLocaleString());
  
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

    // In MongoDB aktualisieren
    await Promise.all([
      updateMongoDB(germanyPrices, GermanyPrice),
      updateMongoDB(austriaPrices, AustriaPrice),
    ]);

    console.log('Datenaktualisierung erfolgreich abgeschlossen.');
  } catch (error) {
    console.error('Fehler bei der Datenaktualisierung:', error);
  }
};

// API-Handler für manuelle Auslösung
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Nur GET-Anfragen erlaubt' });
  }

  try {
    await updateData();
    res.status(200).json({ message: "Daten erfolgreich aktualisiert." });
  } catch (error) {
    console.error('API-Fehler:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cron-Job: Täglich um 14:10 Uhr die Daten aktualisieren
cron.schedule('10 14 * * *', async () => {
  console.log('Geplante Datenaktualisierung um 14:10 Uhr wird ausgeführt.');
  await updateData();
}, {
  timezone: 'Europe/Berlin' // Zeitzone für Mitteleuropa
});

// Initiale Ausführung beim Start des Skripts
updateData();