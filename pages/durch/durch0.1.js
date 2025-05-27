import { useEffect, useState } from 'react';

export default function StrompreisMonatsAusgabe() {
  const [strompreisData, setStrompreisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(''); // Format: MM/YYYY, z.B. "05/2025"
  const [availableMonths, setAvailableMonths] = useState([]);

  // Daten von der MongoDB-API abrufen
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const strompreisRes = await fetch('/api/mongodb', { cache: 'no-store' });
        if (!strompreisRes.ok) {
          throw new Error(`API-Fehler: ${strompreisRes.status} ${strompreisRes.statusText}`);
        }
        const strompreisJson = await strompreisRes.json();
        const germanyData = strompreisJson.germany || [];
        setStrompreisData(germanyData);

        // Extrahiere verfügbare Monate
        const months = [...new Set(
          germanyData
            .map((entry) => {
              const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
              if (!dateKey) return null;
              const dateStr = entry[dateKey];
              if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
              return dateStr.slice(3); // Extrahiert MM/YYYY, z.B. "05/2025"
            })
            .filter((d) => d)
        )];
        setAvailableMonths(months);

        // Setze den aktuellen Monat als Standard
        const currentMonth = new Date().toLocaleString('de-DE', { month: '2-digit', year: 'numeric' });
        if (months.includes(currentMonth)) {
          setSelectedMonth(currentMonth);
        } else if (months.length > 0) {
          setSelectedMonth(months[0]);
        }
      } catch (err) {
        setError('Fehler beim Abrufen der Daten: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funktion zur Berechnung der Tage im Monat
  const getDaysInMonth = (monthYear) => {
    if (!monthYear) return 31;
    const [month, year] = monthYear.split('/');
    return new Date(year, month, 0).getDate();
  };

  // Funktion zur Formatierung des Monatsnamens
  const formatMonthName = (monthYear) => {
    const [month, year] = monthYear.split('/');
    const date = new Date(year, month - 1);
    return date.toLocaleString('de-DE', { month: 'long', year: 'numeric' }); // z.B. "Mai 2025"
  };

  // Funktion zur Berechnung der Monatsdurchschnittspreise
  const getMonthlyAverages = () => {
    const monthlyAverages = availableMonths.map((month) => {
      const filteredData = strompreisData.filter((entry) => {
        const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
        return dateKey && entry[dateKey].slice(3) === month;
      });

      const dailyAverages = filteredData
        .map((entry) => {
          const prices = entry.__parsed_extra
            .slice(0, 24)
            .map((value) => (typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1))
            .filter((value) => !isNaN(value) && value != null);
          return prices.length > 0 ? prices.reduce((sum, val) => sum + val, 0) / prices.length : null;
        })
        .filter((avg) => avg !== null);

      const monthAverage = dailyAverages.length > 0
        ? (dailyAverages.reduce((sum, val) => sum + val, 0) / dailyAverages.length).toFixed(2)
        : 'N/A';

      return { month, averagePrice: monthAverage };
    });

    return monthlyAverages;
  };

  // Funktion zur Ausgabe der Tagesdaten für den ausgewählten Monat
  const getMonthlyData = (month) => {
    if (!month) return [];

    const filteredData = strompreisData
      .filter((entry) => {
        const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
        return dateKey && entry[dateKey].slice(3) === month;
      })
      .map((entry) => {
        const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
        const date = entry[dateKey];
        const day = parseInt(date.slice(0, 2), 10);
        const prices = entry.__parsed_extra
          .slice(0, 24)
          .map((value) => (typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1))
          .filter((value) => !isNaN(value) && value != null);
        const averagePrice = prices.length > 0 ? prices.reduce((sum, val) => sum + val, 0) / prices.length : null;
        return { date, day, averagePrice: averagePrice ? averagePrice.toFixed(2) : 'N/A', prices };
      });

    const daysInMonth = getDaysInMonth(month);
    const monthlySummary = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const entry = filteredData.find((e) => e.day === day);
      return {
        date: entry ? entry.date : `${String(day).padStart(2, '0')}/${month}`,
        day,
        averagePrice: entry ? entry.averagePrice : 'N/A',
      };
    });

    return monthlySummary.sort((a, b) => a.day - b.day);
  };

  // Daten für den ausgewählten Monat und Monatsdurchschnitte
  const monthlyData = getMonthlyData(selectedMonth);
  const monthlyAverages = getMonthlyAverages();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>
        Strompreise nach Monat
      </h1>

      {loading && <p style={{ textAlign: 'center' }}>⏳ Daten werden geladen...</p>}
      {error && <p style={{ textAlign: 'center', color: '#D81B60' }}>{error}</p>}

      {!loading && !error && (
        <div>
          {/* Monatsauswahl */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', marginRight: '12px' }}>
              Monat auswählen:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px' }}
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthName(month)}
                </option>
              ))}
            </select>
          </div>

          {/* Monatsübersicht in Kästchen */}
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>
            Durchschnittspreise pro Monat
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            {monthlyAverages.map((monthData, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  backgroundColor: '#f0f4f8',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minWidth: '150px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                  {formatMonthName(monthData.month)}
                </h3>
                <p style={{ fontSize: '14px', color: '#333' }}>
                  {monthData.averagePrice} Cent/kWh
                </p>
              </div>
            ))}
          </div>

          {/* Tagesansicht für ausgewählten Monat */}
          {monthlyData.length > 0 ? (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>
                Strompreise für {formatMonthName(selectedMonth)}
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f4f8' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Tag</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Datum</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Durchschnittspreis (Cent/kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((entry, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{entry.day}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{entry.date}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{entry.averagePrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>
              ⚠️ Keine Daten für den ausgewählten Monat.
            </p>
          )}
        </div>
      )}
    </div>
  );
}