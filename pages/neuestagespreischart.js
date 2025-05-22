import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Chart.js Komponenten registrieren
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// Funktion zur Berechnung der Füllbereiche
function splitFillData(dataA, dataB) {
  const fillA = dataA.map((a, i) => (a > dataB[i] ? a : dataB[i]));
  const fillB = dataB.map((b, i) => (b > dataA[i] ? b : dataA[i]));
  return { fillA, fillB };
}

const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '1400px',
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
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  inputLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    width: '100px',
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

export default function CombinedChartPage() {
  // States für Strompreise (ChartPage)
  const [germanyData, setGermanyData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  // States für H0 und H0+PV (H0CombinedChart)
  const [h0pvData, setH0PVData] = useState([]);
  const [h0Data, setH0Data] = useState([]);
  const [h0Cent, setH0Cent] = useState(35); // Standardwert 35 Cent für H0
  const [h0PVCent, setH0PVCent] = useState(25); // Standardwert 25 Cent für H0+PV
  // Gemeinsame States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toInputDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const fromInputDate = (inputDate) => {
    const [year, month, day] = inputDate.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Strompreise (Germany) Daten
        const germanyRes = await fetch('/api/mongodb', { cache: 'no-store' });
        if (!germanyRes.ok) {
          throw new Error(`Germany API error: ${germanyRes.status} ${germanyRes.statusText}`);
        }
        const germanyJson = await germanyRes.json();
        const germanyData = germanyJson.germany || [];

        // Fetch H0-PV Daten
        const h0pvRes = await fetch('/api/h0-pv', { cache: 'no-store' });
        if (!h0pvRes.ok) {
          throw new Error(`H0-PV API error: ${h0pvRes.status} ${h0pvRes.statusText}`);
        }
        const h0pvJson = await h0pvRes.json();
        const h0pvData = h0pvJson.h0pv || [];

        // Fetch H0 Daten
        const h0Res = await fetch('/api/h0', { cache: 'no-store' });
        if (!h0Res.ok) {
          throw new Error(`H0 API error: ${h0Res.status} ${h0Res.statusText}`);
        }
        const h0Json = await h0Res.json();
        const h0Data = h0Json.h0 || [];

        // Setze Daten
        setGermanyData(germanyData);
        setH0PVData(h0pvData);
        setH0Data(h0Data);

        // Kombiniere und sortiere verfügbare Daten
        const germanyDates = germanyData
          .map((entry) => {
            const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
            if (!dateKey) return null;
            const dateStr = entry[dateKey];
            if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
            return dateStr;
          })
          .filter((d) => d);

        const h0Dates = h0Data.map((item) => item.datum).filter((d) => d);
        const h0pvDates = h0pvData.map((item) => item.datum).filter((d) => d);

        const allDates = [...new Set([...germanyDates, ...h0Dates, ...h0pvDates])].sort((a, b) => {
          const currentDate = getCurrentDate();
          if (a === currentDate) return -1;
          if (b === currentDate) return 1;
          return b.localeCompare(a);
        });

        setAvailableDates(allDates);

        const currentDate = getCurrentDate();
        if (allDates.includes(currentDate)) {
          setSelectedDate(currentDate);
        } else if (allDates.length > 0) {
          setSelectedDate(allDates[0]);
        }
      } catch (err) {
        setError('Fehler beim Abrufen der Daten: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={styles.loading}>⏳ Daten werden geladen…</div>;
  if (error) return <div style={styles.noData}>⚠️ {error}</div>;
  if (!germanyData.length && !h0Data.length && !h0pvData.length) {
    return <div style={styles.noData}>⚠️ Keine Daten gefunden.</div>;
  }

  // Strompreise Chart Daten (aus ChartPage)
  const selectedGermanyIndex = germanyData.findIndex((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey] === selectedDate;
  });

  const germanyLabels = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const germanyRawValues = selectedGermanyIndex !== -1 ? germanyData[selectedGermanyIndex]?.__parsed_extra.slice(0, 24) : [];
  const germanyChartData = germanyLabels
    .map((label, i) => ({ label, value: germanyRawValues[i], index: i }))
    .filter((entry) => entry.value != null);
  const germanyChartLabels = germanyChartData.map((entry) => entry.label);
  const germanyChartValues = germanyChartData.map((entry) => {
    const value = entry.value;
    return typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1 || null;
  });

  // H0 und H0+PV Chart Daten (aus H0CombinedChart)
  const selectedH0PVData = h0pvData.find((item) => item.datum === selectedDate);
  const selectedH0Data = h0Data.find((item) => item.datum === selectedDate);

  const h0Labels = [
    '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
  ];

  const dataH0PV = selectedH0PVData && selectedH0PVData.werte
    ? h0Labels.map((time) => selectedH0PVData.werte[`${time}:00`] || 0)
    : Array(24).fill(0);

  const dataH0 = selectedH0Data && selectedH0Data.werte
    ? h0Labels.map((time) => selectedH0Data.werte[`${time}:00`] || 0)
    : Array(24).fill(0);

  const costH0 = dataH0.map((value) => (value * h0Cent) / 100);
  const costH0PV = dataH0PV.map((value) => (value * h0PVCent) / 100);

  const { fillA, fillB } = splitFillData(costH0, costH0PV);

  const h0ChartData = {
    labels: h0Labels,
    datasets: [
      {
        label: 'H0 normal (in €)',
        data: costH0,
        borderColor: '#ff0000',
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        order: 3,
      },
      {
        label: 'H0 normal besser',
        data: fillA,
        borderColor: 'transparent',
        backgroundColor: 'rgba(191, 29, 0, 0.51)',
        fill: '-1',
        tension: 0.3,
        pointRadius: 0,
        order: 1,
      },
      {
        label: 'H0 mit PV (in €)',
        data: costH0PV,
        borderColor: '#228b22',
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        order: 4,
      },
      {
        label: 'H0 mit PV besser',
        data: fillB,
        borderColor: 'transparent',
        backgroundColor: 'rgba(19, 135, 19, 0.43)',
        fill: '-1',
        tension: 0.3,
        pointRadius: 0,
        order: 2,
      },
    ],
  };

  const h0ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)} €`;
          },
        },
      },
      title: {
        display: true,
        text: `Kostenvergleich: H0 normal vs. H0 mit PV (${selectedDate || 'Kein Datum ausgewählt'})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => `${value.toFixed(2)} €` },
        title: { display: true, text: 'Kosten (€)' },
      },
      x: {
        title: { display: true, text: 'Stunde' },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🇩🇪 Deutschland Strompreise & H0/H0+PV Vergleich</h1>

      {/* Date Picker */}
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

      {/* Eingabefelder für H0 und H0+PV Preise */}
      <div style={styles.inputContainer}>
        <label htmlFor="h0Cent" style={styles.inputLabel}>
          H0 Preis (Cent/kWh):
        </label>
        <input
          id="h0Cent"
          type="number"
          value={h0Cent}
          onChange={(e) => setH0Cent(Math.max(0, parseFloat(e.target.value) || 35))}
          style={styles.input}
        />
        <label htmlFor="h0PVCent" style={styles.inputLabel}>
          H0 mit PV Preis (Cent/kWh):
        </label>
        <input
          id="h0PVCent"
          type="number"
          value={h0PVCent}
          onChange={(e) => setH0PVCent(Math.max(0, parseFloat(e.target.value) || 25))}
          style={styles.input}
        />
      </div>

      {availableDates.length === 0 && (
        <div style={styles.noData}>⚠️ Keine gültigen Daten verfügbar. Bitte überprüfen Sie die Datenbank.</div>
      )}

      {/* Strompreise Chart */}
      {germanyChartData.length > 0 ? (
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>📈 Preisverlauf (0–23 Uhr)</h2>
          <Line
            data={{
              labels: germanyChartLabels,
              datasets: [
                {
                  label: `Strompreise am ${selectedDate || 'N/A'} (in Cent/kWh)`,
                  data: germanyChartValues,
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
                legend: { position: 'top' },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: { callback: (value) => `${value.toFixed(2)} ct` },
                },
              },
            }}
          />
        </div>
      ) : (
        <div style={styles.noData}>⚠️ Keine Strompreisdaten für das ausgewählte Datum.</div>
      )}

      {/* H0/H0+PV Chart */}
      {(dataH0PV.some(v => v !== 0) || dataH0.some(v => v !== 0)) ? (
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>📈 H0 / H0+PV Vergleich (0–23 Uhr)</h2>
          <Line data={h0ChartData} options={h0ChartOptions} />
        </div>
      ) : (
        <div style={styles.noData}>⚠️ Keine H0/H0+PV Daten für das ausgewählte Datum.</div>
      )}
    </div>
  );
}