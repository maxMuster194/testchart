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
  const strompreis = [
    0.35, 0.32, 0.30, 0.28, 0.27, 0.26, 0.25, 0.28,
    0.30, 0.32, 0.34, 0.36, 0.38, 0.37, 0.35, 0.34,
    0.33, 0.31, 0.30, 0.29, 0.28, 0.27, 0.26, 0.25
  ];

  const h0 = [
    0.35, 0.40, 0.28, 0.25, 0.24, 0.23, 0.22, 0.25,
    0.27, 0.29, 0.30, 0.36, 0.45, 0.37, 0.32, 0.30,
    0.29, 0.27, 0.26, 0.29, 0.35, 0.27, 0.22, 0.21
  ];

  const h0pv = [
    0.31, 0.28, 0.25, 0.22, 0.21, 0.20, 0.19, 0.22,
    0.24, 0.32, 0.48, 0.36, 0.30, 0.29, 0.28, 0.26,
    0.25, 0.23, 0.22, 0.29, 0.40, 0.45, 0.26, 0.17
  ];

  const [view, setView] = useState('all');

  const getDataset = () => {
    const datasets = [
      {
        label: 'Strompreis',
        data: strompreis,
        borderColor: 'red',
        backgroundColor: 'transparent',
        tension: 0.3,
        fill: false, // wichtig: nicht selbst füllen
      },
    ];
  
    if (view === 'all' || view === 'h0') {
      datasets.push({
        label: 'H0',
        data: h0,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        fill: { target: 0 }, // gegen 0 (Y-Achse) füllen
        tension: 0.3,
      });
  
      datasets.push({
        label: 'Zwischen Strompreis und H0',
        data: h0.map((v, i) => strompreis[i] > v ? strompreis[i] : v), // obere Linie
        borderColor: 'transparent',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        pointRadius: 0,
        fill: { target: 'H0' },
        tension: 0.3,
      });
    }
  
    if (view === 'all' || view === 'pv') {
      datasets.push({
        label: 'H0 mit PV',
        data: h0pv,
        borderColor: 'green',
        backgroundColor: 'rgba(0, 128, 0, 0.2)',
        fill: { target: 0 },
        tension: 0.3,
      });
  
      datasets.push({
        label: 'Zwischen Strompreis und H0 mit PV',
        data: h0pv.map((v, i) => strompreis[i] > v ? strompreis[i] : v),
        borderColor: 'transparent',
        backgroundColor: 'rgba(0, 128, 0, 0.1)',
        pointRadius: 0,
        fill: { target: 'H0 mit PV' },
        tension: 0.3,
      });
    }
  
    return datasets;
  };
  

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Strompreisvergleich: Strompreis vs. H0 / H0 mit PV</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setView('all')} style={buttonStyle}>Alle anzeigen</button>
        <button onClick={() => setView('h0')} style={buttonStyle}>Nur H0</button>
        <button onClick={() => setView('pv')} style={buttonStyle}>Nur H0 mit PV</button>
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
            },
          },
          scales: {
            y: {
              title: {
                display: true,
                text: '€/kWh',
              },
              beginAtZero: true,
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
