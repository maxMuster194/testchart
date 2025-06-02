import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

// Registriere die benötigten Chart.js-Komponenten
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// Feste Kalenderwochen für Januar 2025
const januarWeeks = [
  { week: 1, dateRange: '2025-01-01 bis 2025-01-05' },
  { week: 2, dateRange: '2025-01-06 bis 2025-01-12' },
  { week: 3, dateRange: '2025-01-13 bis 2025-01-19' },
  { week: 4, dateRange: '2025-01-20 bis 2025-01-26' },
  { week: 5, dateRange: '2025-01-27 bis 2025-02-02' },
];

// Funktion zur Formatierung des Monatsnamens
const formatMonthName = (monthYear) => {
  const [month, year] = monthYear.split('/');
  const date = new Date(year, month - 1);
  return date.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
};

// Funktion zur Berechnung des Datumsbereichs
const getWeekDateRange = (year, weekNumber) => {
  const week = januarWeeks.find((w) => w.week === weekNumber);
  if (!week) {
    return { start: 'N/A', end: 'N/A' };
  }
  return {
    start: week.dateRange.split(' bis ')[0],
    end: week.dateRange.split(' bis ')[1],
  };
};

// Funktion zur Berechnung der ISO-Kalenderwoche
const getISOWeekNumber = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return null;
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  const weekNumber = Math.round(((tempDate - week1) / 86400000 + 1) / 7);
  return weekNumber >= 1 && weekNumber <= 53 ? weekNumber : null;
};

// Funktion zur Berechnung des monatlichen Verbrauchs
const calculateMonthlyVerbrauch = (verbrauchInput, zeitraum) => {
  const verbrauch = parseFloat(verbrauchInput);
  if (isNaN(verbrauch) || verbrauch <= 0) return 0;

  if (zeitraum === 'täglich') {
    return Math.round(verbrauch * 30);
  } else if (zeitraum === 'jährlich') {
    return Math.round(verbrauch / 12);
  }
  return Math.round(verbrauch);
};

// Funktion zur Berechnung der Monatsdurchschnittspreise und Kosten
const getMonthlyAverages = (strompreisData, verbrauchInput, eigenerPreis, zeitraum, allMonths) => {
  const monthlyVerbrauch = calculateMonthlyVerbrauch(verbrauchInput, zeitraum);
  const parsedEigenerPreis = parseFloat(eigenerPreis);
  const useEigenerPreis = !isNaN(parsedEigenerPreis) && parsedEigenerPreis > 0;

  return allMonths.map((month) => {
    const filteredData = strompreisData.filter((entry) => {
      const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
      return dateKey && entry[dateKey].slice(3, 10) === month;
    });

    const dailyAverages = filteredData
      .map((entry) => {
        const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
        const dateStr = dateKey ? entry[dateKey].slice(0, 10) : null;
        // Setze Preis für 30.12.2024 und 31.12.2024 auf 0
        if (dateStr === '2024-12-30' || dateStr === '2024-12-31') {
          return 0;
        }
        const prices = entry.__parsed_extra
          ?.slice(0, 24)
          .map((value) => (typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1))
          .filter((value) => !isNaN(value) && value != null) || [];
        return prices.length > 0 ? prices.reduce((sum, val) => sum + val, 0) / prices.length : null;
      })
      .filter((avg) => avg !== null);

    const monthAverage = dailyAverages.length > 0
      ? dailyAverages.reduce((sum, val) => sum + val, 0) / dailyAverages.length
      : 0;

    return {
      month,
      name: formatMonthName(month),
      averagePrice: monthAverage ? monthAverage.toFixed(2) : '0.00',
      verbrauch: monthlyVerbrauch,
      kosten: monthlyVerbrauch && useEigenerPreis
        ? (parsedEigenerPreis * monthlyVerbrauch / 100).toFixed(2)
        : monthlyVerbrauch && monthAverage
        ? (monthAverage * monthlyVerbrauch / 100).toFixed(2)
        : '0.00',
      eigenerPreis: useEigenerPreis ? parsedEigenerPreis.toFixed(2) : null,
    };
  });
};

// Analyse eines Monats mit Kalenderwochen
const getMonthAnalysis = (month, eigenerPreis, strompreisData, verbrauchInput, zeitraum) => {
  const parsedEigenerPreis = parseFloat(eigenerPreis);
  const useEigenerPreis = !isNaN(parsedEigenerPreis) && parsedEigenerPreis > 0;
  const monthlyVerbrauch = calculateMonthlyVerbrauch(verbrauchInput, zeitraum);
  const [monthNum, year] = month.split('/');

  const filteredData = strompreisData.filter((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey].slice(3, 10) === month;
  });

  // Gruppiere Daten nach Kalenderwochen
  const daysByWeek = {};
  filteredData.forEach((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    if (!dateKey) return;
    const dateStr = entry[dateKey].slice(0, 10);
    const date = new Date(dateStr);
    const weekNumber = getISOWeekNumber(date);

    if (!weekNumber) return;
    if (!daysByWeek[weekNumber]) {
      daysByWeek[weekNumber] = [];
    }
    const dailyAverage =
      dateStr === '2024-12-30' || dateStr === '2024-12-31'
        ? 0
        : entry.__parsed_extra
            ?.slice(0, 24)
            .map((value) => (typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1))
            .filter((value) => !isNaN(value) && value != null)
            .reduce((sum, val) => sum + val, 0) / 24 || 0;
    daysByWeek[weekNumber].push({ date: dateStr, averagePrice: dailyAverage });
  });

  // Berechne Wochen-Durchschnitt, günstigsten und teuersten Tag pro Woche
  const weeklyAnalysis = januarWeeks.map(({ week, dateRange }) => {
    const days = daysByWeek[week] || [];
    const weekAverage = days.length > 0
      ? days
          .map((day) => day.averagePrice)
          .filter((avg) => !isNaN(avg))
          .reduce((sum, val) => sum + val, 0) / days.length
      : 0;
    const cheapestDay = days.length > 0
      ? days.reduce((min, day) => (day.averagePrice < min.averagePrice ? day : min), days[0])
      : null;
    const mostExpensiveDay = days.length > 0
      ? days.reduce((max, day) => (day.averagePrice > max.averagePrice ? day : max), days[0])
      : null;

    return {
      week,
      dateRange,
      averagePrice: weekAverage ? weekAverage.toFixed(2) : '0.00',
      verbrauch: monthlyVerbrauch ? (monthlyVerbrauch / 5).toFixed(2) : '0.00',
      kosten: monthlyVerbrauch && weekAverage ? ((weekAverage * monthlyVerbrauch) / 100 / 5).toFixed(2) : '0.00',
      kostenEigenerPreis: useEigenerPreis && monthlyVerbrauch
        ? ((parsedEigenerPreis * monthlyVerbrauch) / 100 / 5).toFixed(2)
        : '0.00',
      cheapestDay: cheapestDay ? { date: cheapestDay.date, price: cheapestDay.averagePrice.toFixed(2) } : null,
      mostExpensiveDay: mostExpensiveDay
        ? { date: mostExpensiveDay.date, price: mostExpensiveDay.averagePrice.toFixed(2) }
        : null,
    };
  });

  // Finde günstigsten und teuersten Tag des Monats
  const allDays = filteredData
    .map((entry) => {
      const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
      if (!dateKey) return null;
      const dateStr = entry[dateKey].slice(0, 10);
      const dailyAverage =
        dateStr === '2024-12-30' || dateStr === '2024-12-31'
          ? 0
          : entry.__parsed_extra
              ?.slice(0, 24)
              .map((value) => (typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1))
              .filter((value) => !isNaN(value) && value != null)
              .reduce((sum, val) => sum + val, 0) / 24 || 0;
      return { date: dateStr, averagePrice: dailyAverage };
    })
    .filter((day) => day && !isNaN(day.averagePrice));

  const cheapestDay = allDays.length > 0
    ? allDays.reduce((min, day) => (day.averagePrice < min.averagePrice ? day : min), allDays[0])
    : null;
  const mostExpensiveDay = allDays.length > 0
    ? allDays.reduce((max, day) => (day.averagePrice > max.averagePrice ? day : max), allDays[0])
    : null;

  // Zusammenfassung der Gesamtkosten
  const totalKosten = weeklyAnalysis
    .reduce((sum, week) => sum + parseFloat(week.kosten), 0)
    .toFixed(2);
  const totalKostenEigenerPreis = useEigenerPreis
    ? (weeklyAnalysis.length * parseFloat(weeklyAnalysis[0].kostenEigenerPreis)).toFixed(2)
    : '0.00';

  return {
    weeklyAnalysis,
    cheapestDay: cheapestDay ? { date: cheapestDay.date, price: cheapestDay.averagePrice.toFixed(2) } : null,
    mostExpensiveDay: mostExpensiveDay
      ? { date: mostExpensiveDay.date, price: mostExpensiveDay.averagePrice.toFixed(2) }
      : null,
    eigenerPreis: useEigenerPreis ? parsedEigenerPreis.toFixed(2) : null,
    totalKosten,
    totalKostenEigenerPreis,
  };
};

// Haupt-Komponente
function StrompreisApp() {
  const [strompreisData, setStrompreisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [verbrauchInput, setVerbrauchInput] = useState('');
  const [eigenerPreis, setEigenerPreis] = useState('');
  const [zeitraum, setZeitraum] = useState('monatlich');
  const [selectedMonatDetails, setSelectedMonatDetails] = useState(null);

  // Alle Monate für 2025
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return `${month}/2025`;
  });

  // Daten von der MongoDB-API abrufen
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const strompreisRes = await fetch('/api/mongodb', { cache: 'no-store' });
        if (!strompreisRes.ok) {
          throw new Error(`API-Fehler: ${strompreisRes.status} ${strompreisRes.statusText}`);
        }
        const strompreisJson = await strompreisRes.json();
        const germdata = strompreisJson.germany || [];
        setStrompreisData(germdata);

        const currentMonth = new Date().toLocaleString('de-DE', { month: '2-digit', year: 'numeric' });
        if (allMonths.includes(currentMonth)) {
          setSelectedMonth(currentMonth);
        } else {
          setSelectedMonth(allMonths[0]);
        }
      } catch (err) {
        setError('Fehler beim Abrufen der Daten: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Verbrauch und Preis validieren
  const handleBerechnen = () => {
    const verbrauch = parseFloat(verbrauchInput);
    const parsedEigenerPreis = parseFloat(eigenerPreis);
    if (isNaN(verbrauch) || verbrauch <= 0) {
      alert('Bitte einen gültigen Verbrauchswert eingeben.');
      return;
    }
    if (eigenerPreis !== '' && (isNaN(parsedEigenerPreis) || parsedEigenerPreis <= 0)) {
      alert('Fehler: Bitte einen gültigen Preis (Cent/kWh) eingeben.');
      return;
    }
  };

  // Modal anzeigen
  const showModal = (monthData) => {
    const analysis = getMonthAnalysis(monthData.month, eigenerPreis, strompreisData, verbrauchInput, zeitraum);
    setSelectedMonatDetails({ ...monthData, analysis });
  };

  // Modal schließen
  const closeModal = () => {
    setSelectedMonatDetails(null);
  };

  // Daten für Monatsdurchschnitte
  const monthlyAverages = getMonthlyAverages(strompreisData, verbrauchInput, eigenerPreis, zeitraum, allMonths);

  // Daten für das Säulendiagramm filtern
  const chartData = monthlyAverages.filter((data) => data.averagePrice !== '0.00');

  // Chart.js Daten und Optionen für das Haupt-Diagramm
  const barChartData = {
    labels: chartData.map((data) => data.name.split(' ')[0]),
    datasets: [
      {
        label: 'Durchschnittspreis (Cent/kWh)',
        data: chartData.map((data) => parseFloat(data.averagePrice)),
        backgroundColor: '#0066b4',
        borderColor: '#004c4a',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Preis (Cent/kWh)',
          font: { size: 14 },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Monat',
          font: { size: 14 },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} Cent/kWh`;
          },
        },
      },
    },
  };

  // Chart.js Daten und Optionen für das Wochen-Diagramm im Modal
  const weeklyChartData = selectedMonatDetails
    ? {
        labels: selectedMonatDetails.analysis.weeklyAnalysis.map((week) => `KW ${week.week}`),
        datasets: [
          {
            label: 'Durchschnittspreis (Cent/kWh)',
            data: selectedMonatDetails.analysis.weeklyAnalysis.map((week) => parseFloat(week.averagePrice)),
            backgroundColor: '#36A2EB',
            borderColor: '#2A8ABF',
            borderWidth: 1,
          },
        ],
      }
    : {};

  const weeklyChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Preis (Cent/kWh)',
          font: { size: 14 },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Kalenderwoche',
          font: { size: 14 },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} Cent/kWh`;
          },
        },
      },
    },
  };

  return (
    <div className="strompreis-app">
      <style>{`
        .strompreis-app {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
          font-family: 'Arial', sans-serif;
        }
        .strompreis-app h1, .strompreis-app h2 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0066b4;
          text-align: center;
          margin-bottom: 3rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .strompreis-app h2 {
          font-size: 2rem;
        }
        .loading, .error {
          text-align: center;
          font-size: 1.125rem;
          color: #6b7280;
        }
        .error { color: #e63946; }
        .input-container, .select-container {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 700px;
          margin: 0 auto 2.5rem;
          transition: transform 0.3s ease;
        }
        .input-container:hover, .select-container:hover {
          transform: translateY(-5px);
        }
        .input-container label, .select-container label {
          display: block;
          font-size: 1.125rem;
          font-weight: 600;
          color: #0066b4;
          margin-bottom: 0.75rem;
        }
        .input-group {
          display: flex;
          gap: 1rem;
        }
        .input-group input, .input-group select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #f9fafb;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .input-group input:focus, .input-group select:focus {
          border-color: #0066b4;
          box-shadow: 0 0 0 3px rgba(0, 103, 100, 0.2);
        }
        .input-group input {
          flex: 1;
        }
        .calculate-btn {
          width: 100%;
          margin-top: 1.25rem;
          padding: 0.75rem;
          background: linear-gradient(to right, #0066b4, #004c4a);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }
        .calculate-btn:hover {
          background: linear-gradient(to right, #004c4a, #0066b4);
          transform: translateY(-2px);
        }
        .month-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .month-card {
          background: linear-gradient(135deg, #e6f0fa 0%, #b3e2e0 100%);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          text-align: center;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
        }
        .month-card:hover {
          background: linear-gradient(135deg, #b3e2e0 0%, #0066b4 100%);
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        .month-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0066b4;
          margin-bottom: 0.5rem;
        }
        .month-card p {
          font-size: 1rem;
          color: #334155;
          margin: 0.25rem 0;
        }
        .month-card p span {
          font-weight: 500;
          color: #0066b4;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 103, 100, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          max-width: 700px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          transform: scale(0.95);
          transition: transform 0.3s ease;
        }
        .modal-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0066b4;
          margin-bottom: 1rem;
        }
        .modal-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0066b4;
          margin: 1rem 0 0.5rem;
        }
        .modal-content h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0066b4;
          margin: 0.75rem 0;
        }
        .modal-content p {
          font-size: 1rem;
          color: #334155;
          margin-bottom: 0.5rem;
        }
        .modal-content p span {
          font-weight: 500;
          color: #0066b4;
        }
        .modal-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        .modal-content th, .modal-content td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #d1d5db;
        }
        .modal-content th {
          background: #f9fafb;
          font-weight: 600;
          color: #0066b4;
        }
        .modal-content td {
          color: #334155;
        }
        .modal-content ul {
          list-style: none;
          padding: 0;
        }
        .modal-content ul li {
          font-size: 1rem;
          color: #334155;
          margin-bottom: 0.5rem;
        }
        .modal-close-btn {
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.75rem;
          background: linear-gradient(to right, #0066b4, #004c4a);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }
        .modal-close-btn:hover {
          background: linear-gradient(to right, #004c4a, #0066b4);
          transform: translateY(-2px);
        }
        .modal-weekly-chart {
          margin: 1.5rem 0;
        }
        @media (max-width: 640px) {
          .strompreis-app {
            padding: 16px;
          }
          .strompreis-app h1 {
            font-size: 2rem;
          }
          .month-grid {
            grid-template-columns: 1fr;
          }
          .modal-content {
            max-width: 90%;
          }
          .modal-content table {
            font-size: 0.9rem;
          }
          .modal-content th, .modal-content td {
            padding: 0.5rem;
          }
          .input-group {
            flex-direction: column;
          }
        }
      `}</style>
      <h1>Strompreisübersicht 2025</h1>

      {loading && <p className="loading">⏳ Daten werden geladen...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div>
          <div className="input-container">
            <label htmlFor="verbrauchInput">Verbrauch und Preis eingeben:</label>
            <div className="input-group">
              <input
                type="number"
                id="verbrauchInput"
                placeholder="z. B. 300 kWh"
                value={verbrauchInput}
                onChange={(e) => setVerbrauchInput(e.target.value)}
              />
              <input
                type="number"
                id="eigenerPreis"
                placeholder="z. B. 30 Cent/kWh"
                value={eigenerPreis}
                onChange={(e) => setEigenerPreis(e.target.value)}
              />
              <select
                id="zeitraum"
                value={zeitraum}
                onChange={(e) => setZeitraum(e.target.value)}
              >
                <option value="monatlich">Monatlich</option>
                <option value="täglich">Täglich</option>
                <option value="jährlich">Jährlich</option>
              </select>
            </div>
            <button className="calculate-btn" onClick={handleBerechnen}>
              Kosten berechnen
            </button>
          </div>

          <h2>Durchschnittspreise und Kosten 2025</h2>
          <div className="month-grid">
            {monthlyAverages.map((monthData, index) => (
              <div
                key={index}
                className="month-card"
                onClick={() => showModal(monthData)}
              >
                <h3>{monthData.name}</h3>
                <p>
                  Ø Preis: <span>{monthData.averagePrice} Cent/kWh</span>
                </p>
                {monthData.eigenerPreis && (
                  <p>
                    Eigener Preis: <span>{monthData.eigenerPreis} Cent/kWh</span>
                  </p>
                )}
                <p>
                  Ø Verbrauch: <span>{monthData.verbrauch || 'N/A'} kWh</span>
                </p>
                <p>
                  Ø Kosten:{' '}
                  <span>{monthData.kosten !== '0.00' ? `${monthData.kosten} €` : 'N/A'}</span>
                </p>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="chart-container">
              <h2>Monatliche Durchschnittspreise 2025</h2>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          )}

          {selectedMonatDetails && (
            <div className="modal">
              <div className="modal-content">
                <h2>{selectedMonatDetails.name}</h2>
                <p>
                  Ø Preis: <span>{selectedMonatDetails.averagePrice} Cent/kWh</span>
                </p>
                {selectedMonatDetails.eigenerPreis && (
                  <p>
                    Eigener Preis: <span>{selectedMonatDetails.eigenerPreis} Cent/kWh</span>
                  </p>
                )}
                <p>
                  Ø Verbrauch: <span>{selectedMonatDetails.verbrauch || 'N/A'} kWh</span>
                </p>
                <p>
                  Ø Kosten:{' '}
                  <span>
                    {selectedMonatDetails.kosten !== '0.00' ? `${selectedMonatDetails.kosten} €` : 'N/A'}
                  </span>
                </p>
                <h3>Monatsanalyse</h3>
                <h4>Kalenderwochen</h4>
                <table>
                  <thead>
                    <tr>
                      <th>KW</th>
                      <th>Datumsbereich</th>
                      <th>Ø Preis (Cent/kWh)</th>
                      <th>Verbrauch (kWh)</th>
                      <th>Kosten (€)</th>
                      {selectedMonatDetails.eigenerPreis && <th>Kosten (Eigener Preis) (€)</th>}
                      <th>Günstigster Tag</th>
                      <th>Teuerster Tag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMonatDetails.analysis.weeklyAnalysis.map((week, index) => (
                      <tr key={index}>
                        <td>{week.week}</td>
                        <td>{week.dateRange}</td>
                        <td>{week.averagePrice}</td>
                        <td>{week.verbrauch}</td>
                        <td>{week.kosten}</td>
                        {selectedMonatDetails.eigenerPreis && <td>{week.kostenEigenerPreis}</td>}
                        <td>
                          {week.cheapestDay
                            ? `${week.cheapestDay.date} (${week.cheapestDay.price} Cent/kWh)`
                            : 'N/A'}
                        </td>
                        <td>
                          {week.mostExpensiveDay
                            ? `${week.mostExpensiveDay.date} (${week.mostExpensiveDay.price} Cent/kWh)`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="modal-weekly-chart">
                  <h4>Wöchentliche Durchschnittspreise</h4>
                  <Bar data={weeklyChartData} options={weeklyChartOptions} />
                </div>
                <h4>Zusammenfassung</h4>
                <ul>
                  <li>
                    Gesamtkosten (Ø Preis): <span>{selectedMonatDetails.analysis.totalKosten} €</span>
                  </li>
                  {selectedMonatDetails.eigenerPreis && (
                    <li>
                      Gesamtkosten (Eigener Preis):{' '}
                      <span>{selectedMonatDetails.analysis.totalKostenEigenerPreis} €</span>
                    </li>
                  )}
                  {selectedMonatDetails.eigenerPreis && (
                    <li>
                      Differenz (Ø Preis vs. Eigener Preis):{' '}
                      <span>
                        {(
                          parseFloat(selectedMonatDetails.analysis.totalKosten) -
                          parseFloat(selectedMonatDetails.analysis.totalKostenEigenerPreis)
                        ).toFixed(2)}{' '}
                        €
                      </span>
                    </li>
                  )}
                  {selectedMonatDetails.eigenerPreis && (
                    <li>
                      Durchschnittlicher Preis der Wochen:{' '}
                      <span>
                        {(
                          selectedMonatDetails.analysis.weeklyAnalysis.reduce(
                            (sum, week) => sum + parseFloat(week.averagePrice || 0),
                            0,
                          ) / selectedMonatDetails.analysis.weeklyAnalysis.length
                        ).toFixed(2)}{' '}
                        Cent/kWh
                      </span>
                    </li>
                  )}
                  {selectedMonatDetails.eigenerPreis && (
                    <li>
                      Vergleich (Durchschnitt vs. Eigener Preis):{' '}
                      <span>
                        {(
                          selectedMonatDetails.analysis.weeklyAnalysis.reduce(
                            (sum, week) => sum + parseFloat(week.averagePrice || 0),
                            0,
                          ) /
                            selectedMonatDetails.analysis.weeklyAnalysis.length -
                          parseFloat(selectedMonatDetails.eigenerPreis)
                        ).toFixed(2)}{' '}
                        Cent/kWh
                      </span>
                    </li>
                  )}
                  {selectedMonatDetails.analysis.cheapestDay && (
                    <li>
                      Günstigster Tag: <span>{selectedMonatDetails.analysis.cheapestDay.date}</span> (
                      {selectedMonatDetails.analysis.cheapestDay.price} Cent/kWh)
                    </li>
                  )}
                  {selectedMonatDetails.analysis.mostExpensiveDay && (
                    <li>
                      Teuerster Tag: <span>{selectedMonatDetails.analysis.mostExpensiveDay.date}</span> (
                      {selectedMonatDetails.analysis.mostExpensiveDay.price} Cent/kWh)
                    </li>
                  )}
                </ul>
                <button className="modal-close-btn" onClick={closeModal}>
                  Schließen
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StrompreisApp;