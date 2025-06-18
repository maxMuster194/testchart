import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const styles = {
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'rgb(3, 160, 129)',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  datePickerLabel: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#34495e',
  },
  datePicker: {
    padding: '0.5rem',
    border: '1px solid #dfe6e9',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
    cursor: 'pointer',
  },
  chartContainer: {
    marginTop: '1rem',
    padding: '0.5rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '550px', // Adjusted to fit dirgam-section
  },
  chartTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#34495e',
    marginBottom: '0.5rem',
  },
  loading: {
    fontSize: '1rem',
    color: '#7f8c8d',
    textAlign: 'center',
    padding: '1rem',
  },
  noData: {
    fontSize: '1rem',
    color: '#e74c3c',
    textAlign: 'center',
    padding: '1rem',
  },
};

export default function Dypreis0() {
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
  const rawValuesAll = selectedIndex !== -1 ? data[selectedIndex]?.__parsed_extra?.slice(0, 24) : [];

  const chartData = labelsAll
    .map((label, i) => ({ label, value: rawValuesAll[i], index: i }))
    .filter((entry) => entry.value != null);
  const chartLabels = chartData.map((entry) => entry.label);
  const chartRawValues = chartData.map((entry) => entry.value);
  const chartConvertedValues = chartRawValues.map((v) =>
    typeof v === 'number' ? v * 0.1 : parseFloat(v) * 0.1 || null
  );

  return (
    <>
      <div style={styles.headerContainer}>
        <h1 style={styles.title}>Aktueller Strompreis</h1>
        <div style={styles.datePickerContainer}>
          <label htmlFor="date-picker" style={styles.datePickerLabel}>
          
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
      </div>
      {availableDates.length === 0 && (
        <div style={styles.noData}>⚠️ Keine gültigen Daten verfügbar. Bitte überprüfen Sie die Datenbank.</div>
      )}
      {chartData.length > 0 ? (
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Preisverlauf {selectedDate} (0–23 Uhr)</h2>
          <Line
            data={{
              labels: chartLabels,
              datasets: [
                {
                  label: `Strompreise am ${selectedDate || 'N/A'} (in Cent/kWh)`,
                  data: chartConvertedValues,
                  fill: false,
                  borderColor: 'rgb(3, 160, 129)',
                  backgroundColor: 'rgb(3, 160, 129)',
                  tension: 0.3,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    font: {
                      size: 12,
                      weight: '500',
                    },
                    color: '#34495e',
                  },
                },
                tooltip: {
                  backgroundColor: 'rgb(3, 160, 129)',
                  titleFont: { size: 12 },
                  bodyFont: { size: 10 },
                  padding: 8,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: '#34495e',
                    font: { size: 10 },
                  },
                },
                y: {
                  beginAtZero: false,
                  grid: {
                    color: '#dfe6e9',
                  },
                  ticks: {
                    callback: (value) => `${value.toFixed(2)} ct`,
                    color: '#34495e',
                    font: { size: 10 },
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <div style={styles.noData}>⚠️ Keine Daten für das ausgewählte Datum.</div>
      )}
    </>
  );
}