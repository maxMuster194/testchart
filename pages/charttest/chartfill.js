import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Filler,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
  import { useState } from 'react';
  
  ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, Legend);
  
  export default function StromChart() {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  
    // HARTKODIERTE DATEN
    const h0 = [
      0.35, 0.40, 0.28, 0.25, 0.24, 0.23, 0.22, 0.25,
      0.27, 0.29, 0.30, 0.36, 0.45, 0.37, 0.32, 0.30,
      0.29, 0.27, 0.26, 0.29, 0.35, 0.27, 0.22, 0.21,
    ];
  
    const h0pv = [
      0.31, 0.28, 0.25, 0.22, 0.21, 0.20, 0.19, 0.22,
      0.24, 0.32, 0.48, 0.36, 0.30, 0.29, 0.28, 0.26,
      0.25, 0.23, 0.22, 0.29, 0.40, 0.45, 0.26, 0.17,
    ];
  
    const [view, setView] = useState('both'); // Standardansicht zeigt beide Linien
  
    const getDataset = () => {
      const datasets = [];
  
      if (view === 'both' || view === 'h0') {
        // Erste H0-Linie (Grau)
        datasets.push({
          label: 'H0 (Primär)',
          data: h0,
          borderColor: '#808080', // Grau
          backgroundColor: 'rgba(95, 255, 3, 0.3)',
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 3,
        });
        // Zweite H0-Linie (Hellgrau, gestrichelt)
        datasets.push({
          label: 'H0 (Sekundär)',
          data: h0,
          borderColor: '#D3D3D3', // Hellgrau
          backgroundColor: 'rgba(68, 243, 9, 0.3)',
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
          borderDash: [5, 5], // Gestrichelte Linie zur Unterscheidung
        });
      }
  
      if (view === 'both' || view === 'pv') {
        // Erste H0 mit PV-Linie (Grün)
        datasets.push({
          label: 'H0 mit PV (Primär)',
          data: h0pv,
          borderColor: '#32CD32', // Grün
          backgroundColor: 'rgba(50, 205, 50, 0.3)',
          tension: 0.3,
          // Fülle zwischen H0 (Primär) und H0 mit PV (Primär)
          fill: view === 'both' ? { target: '-2', above: 'rgba(251, 7, 7, 0.2)', below: 'rgba(59, 251, 0, 0.2)' } : false,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 3,
        });
        // Zweite H0 mit PV-Linie (Hellgrün, gestrichelt)
        datasets.push({
          label: 'H0 mit PV (Sekundär)',
          data: h0pv,
          borderColor: '#98FB98', // Hellgrün
          backgroundColor: 'rgba(250, 12, 12, 0.3)',
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
          borderDash: [5, 5], // Gestrichelte Linie zur Unterscheidung
        });
      }
  
      return datasets;
    };
  
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Strompreisvergleich: H0 vs. H0 mit PV</h2>
  
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => setView('both')} style={buttonStyle}>
            Beide anzeigen
          </button>
          <button onClick={() => setView('h0')} style={buttonStyle}>
            Nur H0
          </button>
          <button onClick={() => setView('pv')} style={buttonStyle}>
            Nur H0 mit PV
          </button>
        </div>
  
        <Line
          data={{
            labels,
            datasets: getDataset(),
          }}
          options={{
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: {
                    size: 14,
                  },
                  color: '#333',
                },
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
              },
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: '€/kWh',
                  font: { size: 14 },
                },
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Uhrzeit',
                  font: { size: 14 },
                },
                grid: {
                  display: false,
                },
              },
            },
          }}
        />
      </div>
    );
  }
  
  const buttonStyle = {
    marginRight: '10px',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
  };