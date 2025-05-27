import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

// Registriere die benötigten Chart.js-Komponenten
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

function StrompreisApp() {
  const [strompreisData, setStrompreisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [verbrauchInput, setVerbrauchInput] = useState('');
  const [zeitraum, setZeitraum] = useState('monatlich');
  const [selectedMonatDetails, setSelectedMonatDetails] = useState(null);

  // Alle Monate für 2025 generieren (01/2025 bis 12/2025)
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
        const germanyData = strompreisJson.germany || [];
        setStrompreisData(germanyData);

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

  // Funktion zur Formatierung des Monatsnamens
  const formatMonthName = (monthYear) => {
    const [month, year] = monthYear.split('/');
    const date = new Date(year, month - 1);
    return date.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
  };

  // Funktion zur Berechnung des monatlichen Verbrauchs
  const calculateMonthlyVerbrauch = (verbrauchInput) => {
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
  const getMonthlyAverages = (verbrauchInput) => {
    const monthlyVerbrauch = calculateMonthlyVerbrauch(verbrauchInput);
    return allMonths.map((month) => {
      const filteredData = strompreisData.filter((entry) => {
        const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
        return dateKey && entry[dateKey].slice(3) === month;
      });

      const dailyAverages = filteredData
        .map((entry) => {
          const prices = entry.__parsed_extra
            .slice(0, 24)
            .map((value) => (typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1))
            .filter((value) => !isNaN(value) && value != null);
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
        kosten: monthAverage && monthlyVerbrauch ? (monthAverage * monthlyVerbrauch / 100).toFixed(2) : '0.00',
      };
    });
  };

  // Funktion zur Berechnung der Woche eines Datums
  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const firstDayWeekday = firstDayOfMonth.getDay() || 7; // Konvertiere Sonntag (0) zu 7
    const adjustedDay = dayOfMonth + firstDayWeekday - 1;
    return Math.floor((adjustedDay - 1) / 7) + 1;
  };

  // Funktion zur Berechnung des Datumsbereichs einer Woche
  const getWeekDateRange = (monthYear, weekNumber) => {
    const [month, year] = monthYear.split('/');
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const firstDayWeekday = firstDayOfMonth.getDay() || 7; // Konvertiere Sonntag (0) zu 7

    // Berechne den ersten Tag der Woche (Montag)
    const startDay = (weekNumber - 1) * 7 - (firstDayWeekday - 1) + 1;
    let adjustedStartDay = Math.max(1, startDay); // Verhindere negative oder ungültige Tage
    let endDay = Math.min(adjustedStartDay + 6, lastDayOfMonth); // Stelle sicher, dass endDay im Monat bleibt

    // Falls adjustedStartDay den Monat überschreitet, setze es auf den letzten Tag
    if (adjustedStartDay > lastDayOfMonth) {
      adjustedStartDay = lastDayOfMonth;
      endDay = lastDayOfMonth;
    }

    const startDate = new Date(year, month - 1, adjustedStartDay);
    const endDate = new Date(year, month - 1, endDay);

    // Überprüfe, ob die Daten gültig sind
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { start: 'N/A', end: 'N/A' };
    }

    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
    };
  };

  // Neue Funktion: Analyse eines Monats
  const getMonthAnalysis = (month) => {
    const filteredData = strompreisData.filter((entry) => {
      const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
      return dateKey && entry[dateKey].slice(3) === month;
    });

    // Gruppiere Daten nach Wochen
    const daysByWeek = {};
    filteredData.forEach((entry) => {
      const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
      const dateStr = entry[dateKey].slice(0, 10); // z. B. "2025-01-01"
      const date = new Date(dateStr);
      const weekNumber = getWeekNumber(date);

      if (!daysByWeek[weekNumber]) {
        daysByWeek[weekNumber] = [];
      }
      const dailyAverage = entry.__parsed_extra
        .slice(0, 24)
        .map((value) => (typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1))
        .filter((value) => !isNaN(value) && value != null)
        .reduce((sum, val) => sum + val, 0) / 24;
      daysByWeek[weekNumber].push({ date: dateStr, averagePrice: dailyAverage });
    });

    // Berechne Wochen-Durchschnitt, günstigsten und teuersten Tag pro Woche
    const weeklyAnalysis = Object.keys(daysByWeek).map((weekNumber) => {
      const days = daysByWeek[weekNumber];
      const weekAverage = days
        .map((day) => day.averagePrice)
        .filter((avg) => !isNaN(avg))
        .reduce((sum, val) => sum + val, 0) / days.length;
      const cheapestDay = days.reduce(
        (min, day) => (day.averagePrice < min.averagePrice ? day : min),
        days[0]
      );
      const mostExpensiveDay = days.reduce(
        (max, day) => (day.averagePrice > max.averagePrice ? day : max),
        days[0]
      );
      const dateRange = getWeekDateRange(month, parseInt(weekNumber));
      return {
        week: weekNumber,
        dateRange: `${dateRange.start} bis ${dateRange.end}`,
        averagePrice: weekAverage ? weekAverage.toFixed(2) : '0.00',
        cheapestDay: cheapestDay ? { date: cheapestDay.date, price: cheapestDay.averagePrice.toFixed(2) } : null,
        mostExpensiveDay: mostExpensiveDay
          ? { date: mostExpensiveDay.date, price: mostExpensiveDay.averagePrice.toFixed(2) }
          : null,
      };
    }).sort((a, b) => a.week - b.week); // Sortiere Wochen numerisch

    // Finde günstigsten und teuersten Tag des Monats
    const allDays = filteredData
      .map((entry) => {
        const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
        const dateStr = entry[dateKey].slice(0, 10);
        const dailyAverage = entry.__parsed_extra
          .slice(0, 24)
          .map((value) => (typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1))
          .filter((value) => !isNaN(value) && value != null)
          .reduce((sum, val) => sum + val, 0) / 24;
        return { date: dateStr, averagePrice: dailyAverage };
      })
      .filter((day) => !isNaN(day.averagePrice));

    const cheapestDay = allDays.length > 0 ? allDays.reduce(
      (min, day) => (day.averagePrice < min.averagePrice ? day : min),
      allDays[0]
    ) : null;
    const mostExpensiveDay = allDays.length > 0 ? allDays.reduce(
      (max, day) => (day.averagePrice > max.averagePrice ? day : max),
      allDays[0]
    ) : null;

    return {
      weeklyAnalysis,
      cheapestDay: cheapestDay ? { date: cheapestDay.date, price: cheapestDay.averagePrice.toFixed(2) } : null,
      mostExpensiveDay: mostExpensiveDay
        ? { date: mostExpensiveDay.date, price: mostExpensiveDay.averagePrice.toFixed(2) }
        : null,
    };
  };

  // Verbrauch berechnen
  const handleBerechnen = () => {
    const verbrauch = parseFloat(verbrauchInput);
    if (isNaN(verbrauch) || verbrauch <= 0) {
      alert('Bitte einen gültigen Verbrauchswert eingeben.');
      return;
    }
  };

  // Modal anzeigen
  const showModal = (monthData) => {
    const analysis = getMonthAnalysis(monthData.month);
    setSelectedMonatDetails({ ...monthData, analysis });
  };

  // Modal schließen
  const closeModal = () => {
    setSelectedMonatDetails(null);
  };

  // Daten für Monatsdurchschnitte
  const monthlyAverages = getMonthlyAverages(verbrauchInput);

  // Daten für das Säulendiagramm filtern (nur Monate mit averagePrice != '0.00')
  const chartData = monthlyAverages.filter((data) => data.averagePrice !== '0.00');

  // Chart.js Daten und Optionen
  const barChartData = {
    labels: chartData.map((data) => data.name.split(' ')[0]),
    datasets: [
      {
        label: 'Durchschnittspreis (Cent/kWh)',
        data: chartData.map((data) => parseFloat(data.averagePrice)),
        backgroundColor: '#006764',
        borderColor: '#004c4a',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
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
          color: #006764;
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
          max-width: 500px;
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
          color: #006764;
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
          border-color: #006764;
          box-shadow: 0 0 0 3px rgba(0, 103, 100, 0.2);
        }
        .input-group input {
          flex: 1;
        }
        .calculate-btn {
          width: 100%;
          margin-top: 1.25rem;
          padding: 0.75rem;
          background: linear-gradient(to right, #006764, #004c4a);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }
        .calculate-btn:hover {
          background: linear-gradient(to right, #004c4a, #006764);
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
          background: linear-gradient(135deg, #b3e2e0 0%, #006764 100%);
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        .month-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #006764;
          margin-bottom: 0.5rem;
        }
        .month-card p {
          font-size: 1rem;
          color: #334155;
          margin: 0.25rem 0;
        }
        .month-card p span {
          font-weight: 500;
          color: #006764;
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
          color: #006764;
          margin-bottom: 1rem;
        }
        .modal-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #006764;
          margin: 1rem 0 0.5rem;
        }
        .modal-content p {
          font-size: 1rem;
          color: #334155;
          margin-bottom: 0.5rem;
        }
        .modal-content p span {
          font-weight: 500;
          color: #006764;
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
          color: #006764;
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
          background: linear-gradient(to right, #006764, #004c4a);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }
        .modal-close-btn:hover {
          background: linear-gradient(to right, #004c4a, #006764);
          transform: translateY(-2px);
        }
        .chart-container {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 2.5rem auto;
          max-width: 800px;
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
          .chart-container {
            padding: 1rem;
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
        }
      `}</style>
      <h1>Strompreisübersicht 2025</h1>

      {loading && <p className="loading">⏳ Daten werden geladen...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div>
          {/* Eingabefeld für Verbrauch */}
          <div className="input-container">
            <label htmlFor="verbrauchInput">Verbrauch eingeben:</label>
            <div className="input-group">
              <input
                type="number"
                id="verbrauchInput"
                placeholder="z. B. 300 kWh"
                value={verbrauchInput}
                onChange={(e) => setVerbrauchInput(e.target.value)}
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

          {/* Monatsübersicht in Karten */}
          <h2>Durchschnittspreise und Kosten 2025</h2>
          <div className="month-grid">
            {monthlyAverages.map((monthData, index) => (
              <div
                key={index}
                className="month-card"
                onClick={() => showModal(monthData)}
              >
                <h3>{monthData.name}</h3>
                <p>Ø Preis: <span>{monthData.averagePrice} Cent/kWh</span></p>
                <p>Ø Verbrauch: <span>{monthData.verbrauch || 'N/A'} kWh</span></p>
                <p>Ø Kosten: <span>{monthData.kosten !== 'N/A' ? `${monthData.kosten} €` : 'N/A'}</span></p>
              </div>
            ))}
          </div>

          {/* Säulendiagramm */}
          {chartData.length > 0 && (
            <div className="chart-container">
              <h2>Monatliche Durchschnittspreise 2025</h2>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          )}

          {/* Modal für Detailansicht */}
          {selectedMonatDetails && (
            <div className="modal">
              <div className="modal-content">
                <h2>{selectedMonatDetails.name}</h2>
                <p>Ø Preis: <span>{selectedMonatDetails.averagePrice} Cent/kWh</span></p>
                <p>Ø Verbrauch: <span>{selectedMonatDetails.verbrauch || 'N/A'} kWh</span></p>
                <p>Ø Kosten: <span>{selectedMonatDetails.kosten !== 'N/A' ? `${selectedMonatDetails.kosten} €` : 'N/A'}</span></p>
                <h3>Monatsanalyse</h3>
                <h4>Wöchentliche Analyse</h4>
                {selectedMonatDetails.analysis.weeklyAnalysis.map((week, index) => (
                  <div key={index}>
                    <h5>Woche {week.week} ({week.dateRange})</h5>
                    <table>
                      <thead>
                        <tr>
                          <th>Woche</th>
                          <th>Zeitraum</th>
                          <th>Ø Preis (Cent/kWh)</th>
                          <th>Günstigster Tag</th>
                          <th>Teuerster Tag</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{week.week}</td>
                          <td>{week.dateRange}</td>
                          <td>{week.averagePrice}</td>
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
                      </tbody>
                    </table>
                  </div>
                ))}
                <h4>Gesamtmonat</h4>
                <ul>
                  {selectedMonatDetails.analysis.cheapestDay && (
                    <li>
                      Günstigster Tag: <span>{selectedMonatDetails.analysis.cheapestDay.date}</span> ({selectedMonatDetails.analysis.cheapestDay.price} Cent/kWh)
                    </li>
                  )}
                  {selectedMonatDetails.analysis.mostExpensiveDay && (
                    <li>
                      Teuerster Tag: <span>{selectedMonatDetails.analysis.mostExpensiveDay.date}</span> ({selectedMonatDetails.analysis.mostExpensiveDay.price} Cent/kWh)
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