import connectToDatabase from '/lib/mongoose'; 
import Price from '/models/Price'; // Dein Mongoose Model für die Preise

const fetchCSVData = async (path) => {
  const sftp = new SFTPClient();
  try {
    await sftp.connect(sftpConfig);
    const fileData = await sftp.get(path);
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

export default async function handler(req, res) {
  const filePathGermanyPrices = '/germany/Day-Ahead Auction/Hourly/Current/Prices_Volumes/auction_spot_prices_germany_luxembourg_2025.csv';
  const filePathAustriaPrices = '/austria/Day-Ahead Auction/Hourly/Current/Prices_Vumes/auction_spot_prices_austria_2025.csv';

  try {
    const germanyPrices = await fetchCSVData(filePathGermanyPrices);
    const austriaPrices = await fetchCSVData(filePathAustriaPrices);

    // Verbindung zu MongoDB herstellen
    await connectToDatabase();

    // Daten in MongoDB speichern
    const resultGermany = await Price.insertMany(germanyPrices);
    console.log('✅ Erfolgreich gespeichert - Deutschland:', resultGermany.length, 'Einträge');

    const resultAustria = await Price.insertMany(austriaPrices);
    console.log('✅ Erfolgreich gespeichert - Österreich:', resultAustria.length, 'Einträge');

    // Erfolgreiche Antwort
    res.status(200).json({ success: true, message: 'Daten gespeichert' });
  } catch (error) {
    console.error('❌ Fehler beim Speichern der Daten:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Daten' });
  }
}
