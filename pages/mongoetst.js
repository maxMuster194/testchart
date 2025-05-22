import { useEffect, useState } from 'react';

export default function MongoTest() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/prices');
        const { data } = await res.json();
        setPrices(data);
        setLoading(false);
      } catch (err) {
        setError('Fehler beim Laden der Daten');
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  if (loading) return <div>Lädt...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Preisdaten</h1>
      <table>
        <thead>
          <tr>
            <th>Markt</th>
            <th>Datum</th>
            <th>Stunde</th>
            <th>Preis (€)</th>
            <th>Volumen</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price, index) => (
            <tr key={index}>
              <td>{price.Market}</td>
              <td>{price.Date}</td>
              <td>{price.Hour}</td>
              <td>{price.Price}</td>
              <td>{price.Volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}