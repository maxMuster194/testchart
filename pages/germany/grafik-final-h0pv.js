import { useState } from 'react';
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

// Chart.js registrieren
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// Dummy-Daten definieren
const dummyData = [
  {
    datum: '2025-05-20',
    werte: {
      '01:00:00': 1.2,
      '02:00:00': 1.1,
      '03:00:00': 1.0,
      '04:00:00': 0.9,
      '05:00:00': 1.0,
      '06:00:00': 1.3,
      '07:00:00': 1.8,
      '08:00:00': 2.2,
      '09:00:00': 2.0,
      '10:00:00': 2.1,
      '11:00:00': 2.3,
      '12:00:00': 2.5,
      '13:00:00': 2.4,
      '14:00:00': 2.2,
      '15:00:00': 2.1,
      '16:00:00': 1.9,
      '17:00:00': 1.7,
      '18:00:00': 1.6,
      '19:00:00': 1.5,
      '20:00:00': 1.4,
      '21:00:00': 1.3,
      '22:00:00': 1.2,
      '23:00:00': 1.1,
      '24:00:00': 1.0,
    },
  },
];

const dummyPVData = [
  {
    datum: '2025-05-20',
    werte: {
      '01:00:00': 1.0,
      '02:00:00': 0.9,
      '03:00:00': 0.8,
      '04:00:00': 0.7,
      '05:00:00': 0.9,
      '06:00:00': 1.1,
      '07:00:00': 1.5,
      '08:00:00': 1.8,
      '09:00:00': 1.9,
      '10:00:00': 2.0,
      '11:00:00': 2.2,
      '12:00:00': 2.3,
      '13:00:00': 2.1,
      '14:00:00': 2.0,
      '15:00:00': 1.8,
      '16:00:00': 1.6,
      '17:00:00': 1.4,
      '18:00:00': 1.3,
      '19:00:00': 1.2,
      '20:00:00': 1.1,
      '21:00:00': 1.0,
      '22:00:00': 0.9,
      '23:00:00': 0.8,
      '24:00:00': 0.7,
    },
  },
];

// Füllbereiche berechnen
function splitFillData(dataA, dataB) {
  const fillA = dataA.map((a, i) => (a > dataB[i] ? a : null));
  const fillB = dataB.map((b, i) => (b > dataA[i] ? b : null));
  return { fillA, fillB };
}

export default function DummyChart() {
  const [h0Cent, setH0Cent] = useState(35);
  const [h0PVCent, setH0PVCent] = useState(25);

  const selectedDate = '2025-05-20';

  const labels = [
    '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
  ];

  const selectedH0 = dummyData[0].werte;
  const selectedPV = dummyPVData[0].werte;

  const dataH0 = labels.map((time) => selectedH0[`${time}:00`] || 0);
  const dataPV = labels.map((time) => selectedPV[`${time}:00`] || 0);

  const costH0 = dataH0.map((v) => (v * h0Cent) / 100);
  const costPV = dataPV.map((v) => (v * h0PVCent) / 100);

  const { fillA, fillB } = splitFillData(costH0, costPV);

  const chartData = {
    labels,
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
        backgroundColor: 'rgba(191, 29, 0, 0.5)',
        fill: '-1',
        tension: 0.3,
        pointRadius: 0,
        order: 1,
      },
      {
        label: 'H0 mit PV (in €)',
        data: costPV,
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
        text: `Kostenvergleich am ${selectedDate}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value.toFixed(2)} €`,
        },
        title: {
          display: true,
          text: 'Kosten (€)',
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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '20px' }}>
        <label>H0 Preis (Cent/kWh): </label>
        <input
          type="number"
          value={h0Cent}
          onChange={(e) => setH0Cent(Math.max(0, parseFloat(e.target.value) || 35))}
          style={{ marginRight: '20px' }}
        />
        <label>H0 mit PV Preis (Cent/kWh): </label>
        <input
          type="number"
          value={h0PVCent}
          onChange={(e) => setH0PVCent(Math.max(0, parseFloat(e.target.value) || 25))}
        />
      </div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
