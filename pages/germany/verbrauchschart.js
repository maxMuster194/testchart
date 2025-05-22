import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Chart.js Komponenten registrieren
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// Funktion zur Berechnung der Füllbereiche
function splitFillData(dataA, dataB) {
  const fillA = dataA.map((a, i) => (a > dataB[i] ? a : dataB[i]));
  const fillB = dataB.map((b, i) => (b > dataA[i] ? b : dataA[i]));
  return { fillA, fillB };
}

export default function VerbrauchChart() {
  const labels = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  
  const dataA = [
    20, 22, 24, 26, 27, 25,
    24, 22, 20, 22, 24, 26,
    30, 32, 34, 32, 30, 28,
    26, 24, 22, 20, 20, 22,
  ];
  const dataB = [
    15, 17, 19, 21, 23, 25,
    26, 28, 29, 28, 27, 26,
    30, 29, 28, 26, 24, 22,
    20, 21, 22, 21, 20, 19,
  ];

  const { fillA, fillB } = splitFillData(dataA, dataB);

  const chartData = {
    labels,
    datasets: [
      {
        label: "H0 normal Preis (in kWh)",
        data: dataA,
        borderColor: "#ff0000",
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        order: 3,
      },
      {
        label: "H0 besser",
        data: fillA,
        borderColor: "transparent",
        backgroundColor: "rgba(191, 29, 0, 0.51)",
        fill: "-1",
        tension: 0.3,
        pointRadius: 0,
        order: 1,
      },
      {
        label: "H0 mit PV (in kWh)",
        data: dataB,
        borderColor: "#228b22",
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        order: 4,
      },
      {
        label: "H0 mit PV besser",
        data: fillB,
        borderColor: "transparent",
        backgroundColor: "rgba(19, 135, 19, 0.43)",
        fill: "-1",
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
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)} kWh`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `${value.toFixed(2)} kWh`,
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
  };

  // Statistische Auswertung
  const maxA = Math.max(...dataA);
  const maxB = Math.max(...dataB);
  const avgA = (dataA.reduce((a, b) => a + b, 0) / dataA.length).toFixed(2);
  const avgB = (dataB.reduce((a, b) => a + b, 0) / dataB.length).toFixed(2);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Stromverbrauchsvergleich: H0 Normal vs. H0 mit PV
      </h2>
      
      <Line data={chartData} options={chartOptions} />

      <div style={{
        marginTop: "2rem",
        padding: "1.5rem",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}>
        <h3>Zusammenfassung</h3>
        <p><strong>Spitzenlast H0 normal:</strong> {maxA} kWh</p>
        <p><strong>Spitzenlast H0 mit PV:</strong> {maxB} kWh</p>
        <p><strong>Durchschnitt H0 normal:</strong> {avgA} kWh</p>
        <p><strong>Durchschnitt H0 mit PV:</strong> {avgB} kWh</p>
      </div>
    </div>
  );
  
}
