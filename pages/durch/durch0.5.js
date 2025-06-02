import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js Komponenten registrieren
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Stilobjekte (erweitert um Modal-Stile)
const styles = {
  // ... (bestehende Stile bleiben unverändert)


  container: {
    padding: '2rem',
    maxWidth: '1280px',
    margin: '0 auto',
    fontFamily: "'Inter', 'Roboto', sans-serif",
    backgroundColor: '#f0fdf4',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '2rem',
    color: '#1a4731',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a4731',
    marginBottom: '1rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1fae5',
    borderRadius: '8px',
    width: '200px',
  },
  select: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1fae5',
    borderRadius: '8px',
    backgroundColor: '#f0fdf4',
    color: '#1a4731',
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.75rem',
    marginBottom: '3rem',
  },
  card: {
    padding: '2rem',
    background: 'linear-gradient(135deg, #1a4731 0%, #2f6b4f 100%)',
    borderRadius: '16px',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'none',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '220px',
    height: '180px',
  },
  selectedCard: {
    background: 'linear-gradient(135deg, #2f6b4f 0%, #4a9c6b 100%)',
    boxShadow: '0 8px 24px rgba(74, 156, 107, 0.3)',
    color: '#ffffff',
    width: '220px',
    height: '180px',
    transition: 'none',
  },
  cardTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  cardPrice: {
    fontSize: '1.25rem',
    fontWeight: '500',
    opacity: 0.85,
  },
  cardKwh: {
    fontSize: '1rem',
    fontWeight: '500',
    marginTop: '0.5rem',
    opacity: 0.9,
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '2.5rem',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    backgroundColor: '#f0fdf4',
    borderBottom: '2px solidrgb(10, 232, 117)',
    fontWeight: '600',
    color: '#1a4731',
    fontSize: '1.1rem',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #d1fae5',
    fontSize: '1rem',
    color: '#1f2937',
  },
  trEven: {
    backgroundColor: '#f0fdf4',
  },
  trOdd: {
    backgroundColor: '#ffffff',
  },
  chartContainer: {
    marginTop: '2.5rem',
    marginBottom: '2.5rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  chartTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    color: '#1a4731',
    textAlign: 'center',
  },
  loading: {
    fontSize: '1.5rem',
    fontWeight: '500',
    color: '#1a4731',
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
  },
  noData: {
    fontSize: '1.5rem',
    fontWeight: '500',
    color: '#dc2626',
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
  },
  monthTitle: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginTop: '2.5rem',
    marginBottom: '1.25rem',
    color: '#1a4731',
    textAlign: 'center',
  },
  monthlyAverage: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginTop: '1.25rem',
    marginBottom: '2.5rem',
    color: '#1a4731',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#1a4731',
  },
};

// Kalenderwochen-Definition (unverändert)
const calendarWeeks = {
  '01/2025': [
    { kw: '01', days: ['30/12/2024', '31/12/2024', '01/01/2025', '02/01/2025', '03/01/2025', '04/01/2025', '05/01/2025'] },
    { kw: '02', days: ['06/01/2025', '07/01/2025', '08/01/2025', '09/01/2025', '10/01/2025', '11/01/2025', '12/01/2025'] },
    { kw: '03', days: ['13/01/2025', '14/01/2025', '15/01/2025', '16/01/2025', '17/01/2025', '18/01/2025', '19/01/2025'] },
    { kw: '04', days: ['20/01/2025', '21/01/2025', '22/01/2025', '23/01/2025', '24/01/2025', '25/01/2025', '26/01/2025'] },
    { kw: '05', days: ['27/01/2025', '28/01/2025', '29/01/2025', '30/01/2025', '31/01/2025'] },
  ],
};

export default function MongoDBPricesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [verbrauchInput, setVerbrauchInput] = useState('');
  const [eigenerPreis, setEigenerPreis] = useState('');
  const [zeitraum, setZeitraum] = useState('monatlich');
  const [displayedKwh, setDisplayedKwh] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // Neuer State für Modal

  const months = [
    '01/2025', '02/2025', '03/2025', '04/2025', '05/2025', '06/2025',
    '07/2025', '08/2025', '09/2025', '10/2025', '11/2025', '12/2025',
  ];

  // API-Daten abrufen (unverändert)
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

        const uniqueData = [];
        const seenDates = new Set();
        germanyData.forEach((entry) => {
          const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
          if (!dateKey) return;
          const dateStr = entry[dateKey];
          if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return;
          if (!seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            uniqueData.push(entry);
          }
        });

        const sortedData = uniqueData.sort((a, b) => {
          const dateKeyA = Object.keys(a).find((key) => key.includes('Prices - EPEX'));
          const dateKeyB = Object.keys(b).find((key) => key.includes('Prices - EPEX'));
          if (!dateKeyA || !dateKeyB) return 0;
          const [dayA, monthA, yearA] = a[dateKeyA].split('/').map(Number);
          const [dayB, monthB, yearB] = b[dateKeyB].split('/').map(Number);
          return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });

        setData(sortedData);

        const groupedByMonth = {};
        sortedData.forEach((entry) => {
          const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
          if (!dateKey) return;
          const dateStr = entry[dateKey];
          if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return;

          const [, month, year] = dateStr.split('/').map(Number);
          const monthKey = `${month.toString().padStart(2, '0')}/${year}`;

          if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = [];
          }

          const prices = entry.__parsed_extra?.slice(0, 24) || [];
          const validPrices = prices
            .map((v) => {
              const num = typeof v === 'number' ? v : parseFloat(v);
              return isNaN(num) ? null : num * 0.1;
            })
            .filter((v) => v !== null);

          const dailyAverage = validPrices.length > 0
            ? (validPrices.reduce((sum, val) => sum + val, 0) / validPrices.length).toFixed(2)
            : null;

          groupedByMonth[monthKey].push({
            date: dateStr,
            average: dailyAverage !== null ? dailyAverage : '–',
          });
        });

        setMonthlyData(groupedByMonth);
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // kWh-Werte für Karten (unverändert)
  useEffect(() => {
    if (!verbrauchInput || parseFloat(verbrauchInput) <= 0) {
      setDisplayedKwh({});
      return;
    }

    const verbrauch = parseFloat(verbrauchInput);
    const kwhValues = {};

    months.forEach((monthKey) => {
      const monthData = monthlyData[monthKey] || [];
      let kwhValue = '–';

      if (monthData.length > 0) {
        if (zeitraum === 'monatlich') {
          kwhValue = verbrauch.toFixed(2);
        } else if (zeitraum === 'täglich') {
          const daysInMonth = monthData.length;
          kwhValue = (verbrauch / daysInMonth).toFixed(2);
        } else if (zeitraum === 'jährlich') {
          kwhValue = (verbrauch * 12).toFixed(2);
        }
      }

      kwhValues[monthKey] = kwhValue;
    });

    setDisplayedKwh(kwhValues);
  }, [verbrauchInput, zeitraum, monthlyData]);

  const calculateWeeklyAverages = (monthKey, monthData) => {
    const weeks = calendarWeeks[monthKey] || [];
    const weeklyAverages = [];

    weeks.forEach((week) => {
      if (monthKey === '01/2025' && week.kw === '01') {
        weeklyAverages.push({ kw: week.kw, average: '0.00' });
      } else {
        const weekDays = week.days.filter((day) => {
          const [, month, year] = day.split('/').map(Number);
          return `${month.toString().padStart(2, '0')}/${year}` === monthKey;
        });

        const validAverages = weekDays
          .map((day) => {
            const dayData = monthData.find((d) => d.date === day);
            return dayData && dayData.average !== '–' ? parseFloat(dayData.average) : null;
          })
          .filter((avg) => avg !== null);

        const weeklyAverage = validAverages.length > 0
          ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
          : '–';

        weeklyAverages.push({ kw: week.kw, average: weeklyAverage });
      }
    });

    return weeklyAverages;
  };

  const calculateMonthlyAverage = (monthData) => {
    const validAverages = monthData
      .filter((day) => day.average !== '–')
      .map((day) => parseFloat(day.average));

    return validAverages.length > 0
      ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
      : '–';
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];

  const handleCardClick = (monthKey) => {
    setSelectedMonth(monthKey);
    setIsModalOpen(true); // Modal öffnen
  };

  const closeModal = () => {
    setIsModalOpen(false); // Modal schließen
  };

  if (loading) return <div style={styles.loading}>⏳ Daten werden geladen…</div>;
  if (!data.length && !Object.keys(monthlyData).length) {
    return <div style={styles.noData}>⚠️ Keine Daten gefunden.</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🇩🇪 Übersicht 0.5</h1>

      <div style={styles.inputContainer}>
        <label style={styles.inputLabel} htmlFor="verbrauchInput">Verbrauch und Preis eingeben:</label>
        <div style={styles.inputGroup}>
          <input
            type="number"
            id="verbrauchInput"
            placeholder="z. B. 300 kWh"
            value={verbrauchInput}
            onChange={(e) => setVerbrauchInput(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            id="eigenerPreis"
            placeholder="z. B. 30 Cent/kWh"
            value={eigenerPreis}
            onChange={(e) => setEigenerPreis(e.target.value)}
            style={styles.input}
          />
          <select
            id="zeitraum"
            value={zeitraum}
            onChange={(e) => setZeitraum(e.target.value)}
            style={styles.select}
          >
            <option value="monatlich">Monatlich</option>
            <option value="täglich">Täglich</option>
            <option value="jährlich">Jährlich</option>
          </select>
        </div>
      </div>

      <div style={styles.cardContainer}>
        {months.map((monthKey, index) => {
          const monthlyAverage = monthlyData[monthKey]
            ? calculateMonthlyAverage(monthlyData[monthKey])
            : '–';
          const kwhValue = displayedKwh[monthKey] || '–';

          return (
            <div
              key={monthKey}
              style={{
                ...styles.card,
                ...(selectedMonth === monthKey ? styles.selectedCard : {}),
              }}
              onClick={() => handleCardClick(monthKey)} // Angepasster Klick-Handler
            >
              <div style={styles.cardTitle}>{monthNames[index]}</div>
              <div style={styles.cardPrice}>
                {monthlyAverage !== '–'
                  ? `Ø Preis: ${monthlyAverage} Cent/kWh`
                  : 'Keine Daten'}
              </div>
              <div style={styles.cardKwh}>
                Ø Verbrauch: {kwhValue !== '–' ? `${kwhValue} kWh` : '–'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal für Monatsanalyse */}
      {isModalOpen && selectedMonth && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.modalCloseButton} onClick={closeModal}>
              ×
            </button>
            <h2 style={styles.monthTitle}>
              📅 {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
            </h2>
            <h2 style={styles.monthTitle}>Monatsanalyse
        </h2>
            {monthlyData[selectedMonth] && monthlyData[selectedMonth].length > 0 ? (
              <>
              
                <h3 style={styles.chartTitle}>📋 Tagesdurchschnitte</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Datum</th>
                      <th style={styles.th}>Tagesdurchschnitt (Cent/kWh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData[selectedMonth].map((day, i) => (
                      <tr key={day.date} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={styles.td}>{day.date}</td>
                        <td style={styles.td}>{day.average}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 style={styles.chartTitle}>📅 Wöchentliche Durchschnitte</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Kalenderwoche</th>
                      <th style={styles.th}>Wöchentlicher Durchschnitt (Cent/kWh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]).map((week, i) => (
                      <tr key={week.kw} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={styles.td}>KW {week.kw}</td>
                        <td style={styles.td}>{week.average}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={styles.monthlyAverage}>
                  📊 Monatsdurchschnitt: {calculateMonthlyAverage(monthlyData[selectedMonth])} Cent/kWh
                </div>

                {monthlyData[selectedMonth].filter((day) => day.average !== '–').length > 0 && (
                  <div style={styles.chartContainer}>
                    <h2 style={styles.chartTitle}>
                      📊 Tagesdurchschnitte für {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
                    </h2>
                    <Bar
                      data={{
                        labels: monthlyData[selectedMonth]
                          .filter((day) => day.average !== '–')
                          .map((day) => day.date),
                        datasets: [
                          {
                            label: `Tagesdurchschnitte ${monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} ${selectedMonth.split('/')[1]} (Cent/kWh)`,
                            data: monthlyData[selectedMonth]
                              .filter((day) => day.average !== '–')
                              .map((day) => parseFloat(day.average)),
                            backgroundColor: '#4682b4',
                            borderColor: '#4682b4',
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => `${value.toFixed(2)} ct`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div style={styles.noData}>
                ⚠️ Keine Daten für {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]} verfügbar.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}