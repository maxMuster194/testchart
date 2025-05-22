import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// ChartJS-Komponenten registrieren
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

export default function H0PVDisplay() {
  const [h0PVData, setH0PVData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Daten von der API holen
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/h0pv'); // Anpassung an die H0PV-API
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        const result = await response.json();

        if (Array.isArray(result)) {
          setH0PVData(result);
          if (result.length > 0 && result[0].date) {
            // Setze das erste Datum als Standard, konvertiert in Date-Objekt
            setSelectedDate(new Date(result[0].date.split('/').reverse().join('-')));
          }
        } else {
          setError('Keine Daten von der API erhalten');
        }
      } catch (err) {
        setError('Netzwerkfehler: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Gefilterte Daten für das ausgewählte Datum
  const formatDateForComparison = (date) => {
    // Konvertiere Date-Objekt in das Format DD/MM/YYYY
    return date
      ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
      : '';
  };

  const selectedData = h0PVData.find((item) => item.date === formatDateForComparison(selectedDate));

  // Daten für den Chart vorbereiten
  const chartData = {
    labels: [
      '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
      '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
    ],
    datasets: [
      {
        label: 'H0PV-Werte',
        data: selectedData && selectedData.__parsed_extra
          ? Object.values(selectedData.__parsed_extra)
          : Array(24).fill(0),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'H0PV-Werte pro Stunde',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Wert',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Stunde',
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>H0PV-Daten</h1>

      {loading && <p>Lade Daten...</p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {!loading && !error && h0PVData.length > 0 && (
        <div>
          {/* Kalender für Datumauswahl */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="datePicker" style={{ marginRight: '10px' }}>
              Datum auswählen:
            </label>
            <DatePicker
              id="datePicker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Wähle ein Datum"
              style={{ padding: '8px', fontSize: '16px' }}
            />
          </div>

          {/* Chart-Darstellung und Tabelle */}
          {selectedData && selectedData.__parsed_extra ? (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>

              <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>
                      Stunde
                    </th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>
                      Wert
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedData.__parsed_extra).map(([hour, value]) => (
                    <tr key={hour}>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        {String(Number(hour) + 1).padStart(2, '0') + ':00'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        {value.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Keine Daten für das ausgewählte Datum verfügbar</p>
          )}
        </div>
      )}

      {!loading && !error && h0PVData.length === 0 && (
        <p>Keine Daten verfügbar</p>
      )}
    </div>
  );
}