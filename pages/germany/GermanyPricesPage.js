import { useEffect, useState } from 'react';
import {
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js Komponenten registrieren
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Stilobjekte (identisch mit deinem ursprünglichen Code)
const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#1a1a1a',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  datePickerLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333',
  },
  datePicker: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left',
    backgroundColor: '#f7f7f7',
    borderBottom: '1px solid #e0e0e0',
    fontWeight: '500',
    color: '#333',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #e0e0e0',
  },
  trEven: {
    backgroundColor: '#fafafa',
  },
  trOdd: {
    backgroundColor: '#fff',
  },
  chartContainer: {
    marginTop: '2rem',
  },
  chartTitle: {
    fontSize: '1.25rem',
    fontWeight: '500',
    marginBottom: '1rem',
    color: '#1a1a1a',
  },
  loading: {
    fontSize: '1.25rem',
    color: '#555',
    textAlign: 'center',
    padding: '2rem',
  },
  noData: {
    fontSize: '1.25rem',
    color: '#d32f2f',
    textAlign: 'center',
    padding: '2rem',
  },
};

export default function MongoDBPricesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mongodb', {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        console.log('API Response:', JSON.stringify(json, null, 2));

        const germanyData = json.germany || [];
        if (!germanyData.length) {
          console.warn('No germany data found in response');
          setData([]);
          setLoading(false);
          return;
        }

        console.log('Germany Data:', germanyData);
        setData(germanyData);

        // Extract dates from dynamic key
        const uniqueDates = [...new Set(
          germanyData
            .map((entry) => {
              const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
              if (!dateKey) {
                console.warn('No date key found in entry:', entry);
                return null;
              }
              const dateStr = entry[dateKey];
              if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                console.warn('Invalid date format:', dateStr);
                return null;
              }
              return dateStr;
            })
            .filter((d) => d)
        )];

        console.log('Unique Dates:', uniqueDates);
        setAvailableDates(uniqueDates);

        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        } else {
          console.warn('No valid dates found');
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Corrected: Call the fetchData function
  }, []);

  const toInputDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const fromInputDate = (inputDate) => {
    const [year, month, day] = inputDate.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) return <div style={styles.loading}>⏳ Daten werden geladen…</div>;
  if (!data.length) return <div style={styles.noData}>⚠️ Keine Daten gefunden.</div>;

  // Find the date key for comparison
  const selectedIndex = data.findIndex((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey] === selectedDate;
  });

  // Generate hour labels (00 to 23)
  const labelsAll = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // Use __parsed_extra as prices
  const rawValuesAll = selectedIndex !== -1 ? data[selectedIndex]?.__parsed_extra.slice(0, 24) : [];

  console.log('Labels All:', labelsAll);
  console.log('Raw Values All:', rawValuesAll);
  console.log('Selected Index:', selectedIndex);

  // Grafik: nur die ersten 24 Stunden
  const chartData = labelsAll
    .map((label, i) => ({ label, value: rawValuesAll[i], index: i }))
    .filter((entry) => entry.value != null);
  const chartLabels = chartData.map((entry) => entry.label);
  const chartRawValues = chartData.map((entry) => entry.value);
  const chartConvertedValues = chartRawValues.map((v) =>
    typeof v === 'number' ? v * 0.1 : parseFloat(v) * 0.1 || null
  );

  // Tabelle: nur die ersten 24 Stunden
  const tableRows = labelsAll
    .map((label, i) => ({ label, value: rawValuesAll[i] }))
    .filter((row) => row.value != null);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🇩🇪 Deutschland Strompreise (MongoDB) – {selectedDate || 'Kein Datum ausgewählt'}</h1>

      <div style={styles.datePickerContainer}>
        <label htmlFor="date-picker" style={styles.datePickerLabel}>
          🔎 Datum auswählen:
        </label>
        <input
          id="date-picker"
          type="date"
          value={toInputDate(selectedDate)}
          onChange={(e) => setSelectedDate(fromInputDate(e.target.value))}
          style={styles.datePicker}
          disabled={availableDates.length === 0}
        />
      </div>

      {availableDates.length === 0 && (
        <div style={styles.noData}>⚠️ Keine gültigen Daten verfügbar. Bitte überprüfen Sie die Datenbank.</div>
      )}

      {tableRows.length > 0 ? (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Stunde</th>
                <th style={styles.th}>Preis (Cent/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={row.label} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>{row.label}:00</td>
                  <td style={styles.td}>
                    {row.value !== null && row.value !== undefined
                      ? (parseFloat(row.value) * 0.1).toFixed(2)
                      : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>📈 Preisverlauf (0–23 Uhr)</h2>
            <Line
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    label: `Strompreise am ${selectedDate || 'N/A'} (in Cent/kWh)`,
                    data: chartConvertedValues,
                    fill: false,
                    borderColor: '#ff4500',
                    backgroundColor: '#ff4500',
                    tension: 0.3,
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: {
                      callback: (value) => `${value.toFixed(2)} ct`,
                    },
                  },
                },
              }}
            />
          </div>
        </>
      ) : (
        <div style={styles.noData}>⚠️ Keine Daten für das ausgewählte Datum.</div>
      )}
    </div>
  );
}