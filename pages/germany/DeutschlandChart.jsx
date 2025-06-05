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
import Berechnung from '../berechnung/berechnung0.5';
import Profil03 from '../haushalt/Profil0.3'; // Import der neuen Komponente (umbenannt für Klarheit)

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const styles = {
  banner: {
    width: '100vw',
    height: '250px',
    objectFit: 'cover',
    position: 'relative',
    left: 'calc(-50vw + 50%)',
    marginBottom: '2rem',
  },
  container: {
    padding: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: '1',
    minWidth: '300px',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  rightColumn: {
    flex: '1',
    minWidth: '300px',
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

export default function DeutschlandChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
        const germanyData = json.germany || [];
        if (!germanyData.length) {
          setData([]);
          setLoading(false);
          return;
        }

        setData(germanyData);
        const uniqueDates = [...new Set(
          germanyData
            .map((entry) => {
              const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
              if (!dateKey) return null;
              const dateStr = entry[dateKey];
              if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
              return dateStr;
            })
            .filter((d) => d)
        )];

        setAvailableDates(uniqueDates);

        const currentDate = getCurrentDate();
        if (uniqueDates.includes(currentDate)) {
          setSelectedDate(currentDate);
        } else if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const selectedIndex = data.findIndex((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey] === selectedDate;
  });

  const labelsAll = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const rawValuesAll = selectedIndex !== -1 ? data[selectedIndex]?.__parsed_extra.slice(0, 24) : [];

  const chartData = labelsAll
    .map((label, i) => ({ label, value: rawValuesAll[i], index: i }))
    .filter((entry) => entry.value != null);
  const chartLabels = chartData.map((entry) => entry.label);
  const chartRawValues = chartData.map((entry) => entry.value);
  const chartConvertedValues = chartRawValues.map((v) =>
    typeof v === 'number' ? v * 0.1 : parseFloat(v) * 0.1 || null
  );

  return (
    <div>
      <img
        src="/bilder/Ilumy.jpg"
        alt="Header Banner"
        style={styles.banner}
      />
      <div style={styles.container}>
        <div style={styles.leftColumn}>
          <h2 style={{ ...styles.title, fontSize: '1.5rem' }}></h2>
          <Berechnung />
        </div>
        <div style={styles.rightColumn}>
          <h1 style={styles.title}>🇩🇪 Deutschland Strompreise – {selectedDate || 'Kein Datum ausgewählt'}</h1>
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
          {chartData.length > 0 ? (
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
          ) : (
            <div style={styles.noData}>⚠️ Keine Daten für das ausgewählte Datum.</div>
          )}
          {/* Neue Grafik aus Profil0.3.js */}
          <div style={styles.chartContainer}>
            <h2 style={styles.chartTitle}>📈 Profil 0.3 Vergleich (0–23 Uhr)</h2>
            <Profil03 selectedDate={selectedDate} /> {/* Übergabe des ausgewählten Datums */}
          </div>
        </div>
      </div>
    </div>
  );
}