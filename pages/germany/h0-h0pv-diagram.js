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

export default function H0CombinedChart() {
  const [h0pvData, setH0PVData] = useState([]);
  const [h0Data, setH0Data] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Daten von beiden APIs holen
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // H0_PV-Daten abrufen
        const h0pvResponse = await fetch('/api/h0-pv');
        const h0pvResult = await h0pvResponse.json();

        // H0-Daten abrufen
        const h0Response = await fetch('/api/h0');
        const h0Result = await h0Response.json();

        if (
          h0pvResponse.ok &&
          h0pvResult.h0pv &&
          Array.isArray(h0pvResult.h0pv) &&
          h0Response.ok &&
          h0Result.h0 &&
          Array.isArray(h0Result.h0)
        ) {
          setH0PVData(h0pvResult.h0pv);
          setH0Data(h0Result.h0);
          // Setze das Datum auf das erste verfügbare Datum aus H0_PV oder H0
          if (h0pvResult.h0pv.length > 0 && h0pvResult.h0pv[0].datum) {
            setSelectedDate(h0pvResult.h0pv[0].datum);
          } else if (h0Result.h0.length > 0 && h0Result.h0[0].datum) {
            setSelectedDate(h0Result.h0[0].datum);
          }
        } else {
          setError('Keine Daten von einer oder beiden APIs erhalten');
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
  const selectedH0PVData = h0pvData.find((item) => item.datum === selectedDate);
  const selectedH0Data = h0Data.find((item) => item.datum === selectedDate);

  // Daten für den Chart vorbereiten
  const labels = [
    '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
  ];

  const dataH0PV = selectedH0PVData && selectedH0PVData.werte
    ? [
        selectedH0PVData.werte['01:00:00'] || 0,
        selectedH0PVData.werte['02:00:00'] || 0,
        selectedH0PVData.werte['03:00:00'] || 0,
        selectedH0PVData.werte['04:00:00'] || 0,
        selectedH0PVData.werte['05:00:00'] || 0,
        selectedH0PVData.werte['06:00:00'] || 0,
        selectedH0PVData.werte['07:00:00'] || 0,
        selectedH0PVData.werte['08:00:00'] || 0,
        selectedH0PVData.werte['09:00:00'] || 0,
        selectedH0PVData.werte['10:00:00'] || 0,
        selectedH0PVData.werte['11:00:00'] || 0,
        selectedH0PVData.werte['12:00:00'] || 0,
        selectedH0PVData.werte['13:00:00'] || 0,
        selectedH0PVData.werte['14:00:00'] || 0,
        selectedH0PVData.werte['15:00:00'] || 0,
        selectedH0PVData.werte['16:00:00'] || 0,
        selectedH0PVData.werte['17:00:00'] || 0,
        selectedH0PVData.werte['18:00:00'] || 0,
        selectedH0PVData.werte['19:00:00'] || 0,
        selectedH0PVData.werte['20:00:00'] || 0,
        selectedH0PVData.werte['21:00:00'] || 0,
        selectedH0PVData.werte['22:00:00'] || 0,
        selectedH0PVData.werte['23:00:00'] || 0,
        selectedH0PVData.werte['24:00:00'] || 0,
      ]
    : Array(24).fill(0);

  const dataH0 = selectedH0Data && selectedH0Data.werte
    ? [
        selectedH0Data.werte['01:00:00'] || 0,
        selectedH0Data.werte['02:00:00'] || 0,
        selectedH0Data.werte['03:00:00'] || 0,
        selectedH0Data.werte['04:00:00'] || 0,
        selectedH0Data.werte['05:00:00'] || 0,
        selectedH0Data.werte['06:00:00'] || 0,
        selectedH0Data.werte['07:00:00'] || 0,
        selectedH0Data.werte['08:00:00'] || 0,
        selectedH0Data.werte['09:00:00'] || 0,
        selectedH0Data.werte['10:00:00'] || 0,
        selectedH0Data.werte['11:00:00'] || 0,
        selectedH0Data.werte['12:00:00'] || 0,
        selectedH0Data.werte['13:00:00'] || 0,
        selectedH0Data.werte['14:00:00'] || 0,
        selectedH0Data.werte['15:00:00'] || 0,
        selectedH0Data.werte['16:00:00'] || 0,
        selectedH0Data.werte['17:00:00'] || 0,
        selectedH0Data.werte['18:00:00'] || 0,
        selectedH0Data.werte['19:00:00'] || 0,
        selectedH0Data.werte['20:00:00'] || 0,
        selectedH0Data.werte['21:00:00'] || 0,
        selectedH0Data.werte['22:00:00'] || 0,
        selectedH0Data.werte['23:00:00'] || 0,
        selectedH0Data.werte['24:00:00'] || 0,
      ]
    : Array(24).fill(0);

  const { fillA, fillB } = splitFillData(dataH0, dataH0PV);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'H0 normal (in kWh)',
        data: dataH0,
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
        label: 'H0 mit PV (in kWh)',
        data: dataH0PV,
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)} kWh`;
          },
        },
      },
      title: {
        display: true,
        text: `Stromverbrauchsvergleich: H0 normal vs. H0 mit PV (${selectedDate || 'Kein Datum ausgewählt'})`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `${value.toFixed(2)} kWh`,
        },
        title: {
          display: true,
          text: 'Wert (kWh)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Stunde',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  };

  // Statistische Auswertung
  const maxH0 = Math.max(...dataH0);
  const maxH0PV = Math.max(...dataH0PV);
  const avgH0 = (dataH0.reduce((a, b) => a + b, 0) / dataH0.length).toFixed(2);
  const avgH0PV = (dataH0PV.reduce((a, b) => a + b, 0) / dataH0PV.length).toFixed(2);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Stromverbrauchsvergleich: H0 normal vs. H0 mit PV
      </h2>

      {loading && <p>Lade Daten...</p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {!loading && !error && (h0pvData.length > 0 || h0Data.length > 0) && (
        <div>
          {/* Dropdown für Datumauswahl */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="dateSelect" style={{ marginRight: '10px' }}>
              Datum auswählen:
            </label>
            <select
              id="dateSelect"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '8px', fontSize: '16px' }}
            >
              {[...new Set([...h0pvData.map((item) => item.datum), ...h0Data.map((item) => item.datum)])].map(
                (date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Chart-Darstellung */}
          <div style={{ marginBottom: '40px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Statistische Zusammenfassung */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '40px',
            }}
          >
            <h3>Zusammenfassung</h3>
            <p><strong>Spitzenlast H0 normal:</strong> {maxH0.toFixed(2)} kWh</p>
            <p><strong>Spitzenlast H0 mit PV:</strong> {maxH0PV.toFixed(2)} kWh</p>
            <p><strong>Durchschnitt H0 normal:</strong> {avgH0} kWh</p>
            <p><strong>Durchschnitt H0 mit PV:</strong> {avgH0PV} kWh</p>
          </div>

          {/* Tabelle für H0_PV-Daten */}
          {selectedH0PVData && selectedH0PVData.werte && (
            <div style={{ marginBottom: '40px' }}>
              <h3>H0 mit PV-Daten</h3>
              <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>
                      Stunde
                    </th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>
                      Wert (kWh)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(selectedH0PVData.werte).map((hour) => (
                    <tr key={hour}>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        {hour}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        {selectedH0PVData.werte[hour].toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabelle für H0-Daten */}
          {selectedH0Data && selectedH0Data.werte && (
            <div>
              <h3>H0 normal-Daten</h3>
              <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>
                      Stunde
                    </th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>
                      Wert (kWh)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(selectedH0Data.werte).map((hour) => (
                    <tr key={hour}>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        {hour}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        {selectedH0Data.werte[hour].toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && !error && h0pvData.length === 0 && h0Data.length === 0 && (
        <p>Keine Daten verfügbar</p>
      )}
    </div>
  );
}