import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '24px',
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#333',
    margin: '24px 0 12px',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  datePickerLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  inputLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    padding: '12px',
  },
  error: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500',
    color: '#D81B60',
    backgroundColor: '#ffe6ec',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  noData: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
};

export default function StrompreisChart() {
  const [strompreisData, setStrompreisData] = useState([]);
  const [h0Data, setH0Data] = useState([]);
  const [h0PVData, setH0PVData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [customPrice, setCustomPrice] = useState('32'); // Default value set to 32 Cent/kWh
  const [inputError, setInputError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForComparison = (date) => {
    return date
      ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
      : '';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Strompreis data
        const strompreisRes = await fetch('/api/mongodb', { cache: 'no-store' });
        if (!strompreisRes.ok) {
          throw new Error(`API error for Strompreis: ${strompreisRes.status} ${strompreisRes.statusText}`);
        }
        const strompreisJson = await strompreisRes.json();
        const germanyData = strompreisJson.germany || [];
        setStrompreisData(germanyData);

        // Fetch H0 data
        const h0Response = await fetch('/api/h0');
        if (!h0Response.ok) {
          throw new Error(`HTTP error for H0: ${h0Response.status}`);
        }
        const h0Result = await h0Response.json();
        if (!Array.isArray(h0Result)) {
          throw new Error('No H0 data received from API');
        }
        setH0Data(h0Result);

        // Fetch H0PV data
        const h0PVResponse = await fetch('/api/h0pv');
        if (!h0PVResponse.ok) {
          throw new Error(`HTTP error for H0PV: ${h0PVResponse.status}`);
        }
        const h0PVResult = await h0PVResponse.json();
        if (!Array.isArray(h0PVResult)) {
          throw new Error('No H0PV data received from API');
        }
        setH0PVData(h0PVResult);

        // Set available dates and default date
        const uniqueDates = [...new Set(
          germanyData
            .map((entry) => {
              const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
              if (!dateKey) return null;
              const dateStr = entry[dateKey];
              if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
              return dateStr;
            })
            .filter((d) => d)
        )];
        setAvailableDates(uniqueDates);

        const currentDate = getCurrentDate();
        if (uniqueDates.includes(currentDate)) {
          setSelectedDate(new Date(currentDate.split('/').reverse().join('-')));
        } else if (uniqueDates.length > 0) {
          setSelectedDate(new Date(uniqueDates[0].split('/').reverse().join('-')));
        } else if (h0Result.length > 0 && h0Result[0].date) {
          setSelectedDate(new Date(h0Result[0].date.split('/').reverse().join('-')));
        }
      } catch (err) {
        setError('Fehler beim Abrufen der Daten: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle custom price input
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setCustomPrice(value);
    if (value === '') {
      setInputError('Bitte geben Sie einen Preis ein.');
    } else {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue) || parsedValue < 0) {
        setInputError('Bitte geben Sie einen gültigen positiven Preis in Cent/kWh ein.');
      } else {
        setInputError(null);
      }
    }
  };

  // Strompreis data processing
  const selectedStrompreisIndex = strompreisData.findIndex((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey] === formatDateForComparison(selectedDate);
  });

  const labelsAll = Array.from({ length: 24 }, (_, i) => `${String(i + 1).padStart(2, '0')}:00`);
  const rawStrompreisValues = selectedStrompreisIndex !== -1 ? strompreisData[selectedStrompreisIndex]?.__parsed_extra.slice(0, 24) : [];
  const strompreisChartData = labelsAll
    .map((label, i) => ({ label, value: rawStrompreisValues[i], index: i }))
    .filter((entry) => entry.value != null);
  const strompreisChartLabels = strompreisChartData.map((entry) => entry.label);
  const strompreisChartValues = strompreisChartData.map((entry) => {
    const value = entry.value;
    return typeof value === 'number' ? value * 0.1 : parseFloat(value) * 0.1 || null;
  });

  // H0/H0PV data processing
  const selectedH0Data = h0Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedH0PVData = h0PVData.find((item) => item.date === formatDateForComparison(selectedDate));

  // Custom price multiplied by H0 values
  const parsedCustomPrice = parseFloat(customPrice);
  const customPriceValues = !isNaN(parsedCustomPrice) && parsedCustomPrice >= 0 && selectedH0Data?.__parsed_extra
    ? Object.values(selectedH0Data.__parsed_extra).map((value) => value * parsedCustomPrice)
    : Array(24).fill(null);

  // H0PV multiplied by Strompreis
  const h0PVAdjustedValues = selectedH0PVData?.__parsed_extra && strompreisChartValues.length > 0
    ? Object.values(selectedH0PVData.__parsed_extra).map((h0pvValue, index) => {
        const strompreisValue = strompreisChartValues[index];
        return strompreisValue != null && h0pvValue != null ? h0pvValue * strompreisValue : null;
      })
    : Array(24).fill(null);

  const tariffComparison = selectedH0Data?.__parsed_extra && selectedH0PVData?.__parsed_extra
    ? Object.keys(selectedH0Data.__parsed_extra).map((hour) => {
        const h0Value = selectedH0Data.__parsed_extra[hour];
        const h0PVValue = selectedH0PVData.__parsed_extra[hour];
        return {
          hour: String(Number(hour) + 1).padStart(2, '0') + ':00',
          cheaper: h0Value < h0PVValue ? 'H0' : h0Value > h0PVValue ? 'H0PV' : 'Equal',
        };
      })
    : [];

  // Combined chart data
  const combinedChart = {
    labels: labelsAll,
    datasets: [
      {
        label: `Strompreise (Cent/kWh)`,
        data: strompreisChartValues.length > 0 ? strompreisChartValues : Array(24).fill(null),
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'H0PV * Strompreis (Cent/kWh)',
        data: h0PVAdjustedValues,
        borderColor: '#8dd770',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: `H0 * Preis (${customPrice || 'N/A'} Cent/kWh)`,
        data: customPriceValues,
        borderColor: '#808080',
        backgroundColor: 'rgba(30, 136, 229, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        hidden: isNaN(parsedCustomPrice) || parsedCustomPrice < 0,
      },
    ],
  };

  const combinedChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 14, family: "'Inter', sans-serif" }, color: '#333' },
      },
      title: {
        display: true,
        text: `Strompreise, H0, H0PV*Strompreis und H0*Preis am ${formatDateForComparison(selectedDate) || 'N/A'}`,
        font: { size: 18, family: "'Inter', sans-serif", weight: '600' },
        color: '#333',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: "'Inter', sans-serif" },
        bodyFont: { family: "'Inter', sans-serif" },
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const label = context.dataset.label;
            const value = context.raw ? context.raw.toFixed(3) : 'N/A';
            if (label === 'Strompreise (Cent/kWh)' || label.includes('H0 * Preis') || label.includes('H0PV * Strompreis')) {
              return `${label}: ${value} ct/kWh`;
            }
            const h0Value = combinedChart.datasets[1].data[index];
            const h0PVValue = selectedH0PVData?.__parsed_extra ? Object.values(selectedH0PVData.__parsed_extra)[index] : null;
            const cheaper = h0Value < h0PVValue ? 'H0 cheaper' : h0Value > h0PVValue ? 'H0PV cheaper' : 'Equal';
            return `${label}: ${value} (${cheaper})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Wert (Cent/kWh)', font: { size: 14, family: "'Inter', sans-serif" }, color: '#333' },
        ticks: { callback: (value) => `${value.toFixed(2)}` },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        title: { display: true, text: 'Stunde', font: { size: 14, family: "'Inter', sans-serif" }, color: '#333' },
        grid: { display: false },
      },
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          .date-picker {
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #f9f9f9;
            width: 150px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .date-picker:focus {
            outline: none;
            border-color: #1E88E5;
            box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
          }
          .price-input {
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #f9f9f9;
            width: 100px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .price-input:focus {
            outline: none;
            border-color:rgb(7, 255, 7);
            box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
          }
          .input-error {
            color: #D81B60;
            font-size: 12px;
            margin-top: 4px;
          }
          .chart-container {
            background-color: #fff;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
          }
          .data-table, .comparison-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-top: 24px;
          }
          .data-table th, .data-table td, .comparison-table th, .comparison-table td {
            padding: 12px;
            text-align: center;
            font-size: 14px;
            border-bottom: 1px solid #e0e0e0;
          }
          .data-table th, .comparison-table th {
            background-color: #f5f5f5;
            font-weight: 600;
            color: #333;
          }
          .data-table tbody tr:nth-child(even), .comparison-table tbody tr:nth-child(even) {
            background-color: #fafafa;
          }
          .data-table tbody tr:hover, .comparison-table tbody tr:hover {
            background-color: #f0f0f0;
            transition: background-color 0.2s ease;
          }
          .comparison-table .cheaper-h0 { color: #1E88E5; font-weight: 500; }
          .comparison-table .cheaper-h0pv { color: #D81B60; font-weight: 500; }
          .comparison-table .cheaper-equal { color: #666; font-weight: 500; }
          @media (max-width: 600px) {
            .date-picker, .price-input { width: 100%; }
            .data-table th, .data-table td, .comparison-table th, .comparison-table td {
              font-size: 12px;
              padding: 8px;
            }
          }
        `}
      </style>

      <h1 style={styles.title}>🇩🇪 Strompreise, H0, H0PV*Strompreis und H0*Preis Vergleich</h1>

      {loading && <p style={styles.loading}>⏳ Daten werden geladen...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <div>
          <div style={styles.datePickerContainer}>
            <label style={styles.datePickerLabel} htmlFor="datePicker">🔎 Datum auswählen:</label>
            <DatePicker
              id="datePicker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Datum auswählen"
              className="date-picker"
              disabled={availableDates.length === 0 && h0Data.length === 0 && h0PVData.length === 0}
            />
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.inputLabel} htmlFor="priceInput">Preis (Cent/kWh):</label>
            <input
              id="priceInput"
              type="number"
              value={customPrice}
              onChange={handlePriceChange}
              placeholder="z.B. 32"
              className="price-input"
              step="0.01"
              min="0"
            />
            {inputError && <p className="input-error">{inputError}</p>}
          </div>

          {(strompreisChartData.length > 0 || selectedH0Data || selectedH0PVData || customPriceValues.some(v => v !== null)) ? (
            <div>
              <div className="chart-container">
                <h2 style={styles.chartTitle}>📈 Preisverlauf (0–23 Uhr)</h2>
                <Line data={combinedChart} options={combinedChartOptions} />
              </div>

              {/* H0 Data Table */}
              {selectedH0Data?.__parsed_extra && (
                <>
                  <h2 style={styles.chartTitle}>H0 Werte</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Stunde</th>
                        <th>Wert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedH0Data.__parsed_extra).map(([hour, value]) => (
                        <tr key={hour}>
                          <td>{String(Number(hour) + 1).padStart(2, '0') + ':00'}</td>
                          <td>{value.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* H0PV Data Table */}
              {selectedH0PVData?.__parsed_extra && (
                <>
                  <h2 style={styles.chartTitle}>H0PV Werte (Original)</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Stunde</th>
                        <th>Wert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedH0PVData.__parsed_extra).map(([hour, value]) => (
                        <tr key={hour}>
                          <td>{String(Number(hour) + 1).padStart(2, '0') + ':00'}</td>
                          <td>{value.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* H0PV * Strompreis Table */}
              {h0PVAdjustedValues.some(v => v !== null) && (
                <>
                  <h2 style={styles.chartTitle}>H0PV * Strompreis (Cent/kWh)</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Stunde</th>
                        <th>Wert (Cent/kWh)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h0PVAdjustedValues.map((value, index) => (
                        <tr key={index}>
                          <td>{labelsAll[index]}</td>
                          <td>{value ? value.toFixed(3) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Custom Price * H0 Table */}
              {customPriceValues.some(v => v !== null) && (
                <>
                  <h2 style={styles.chartTitle}>H0 * Preis ({customPrice} Cent/kWh)</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Stunde</th>
                        <th>Wert (Cent/kWh)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customPriceValues.map((value, index) => (
                        <tr key={index}>
                          <td>{labelsAll[index]}</td>
                          <td>{value ? value.toFixed(3) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Tariff Comparison Table */}
              {tariffComparison.length > 0 && (
                <>
                  <h2 style={styles.chartTitle}>Günstigerer Tarif pro Stunde (H0 vs. H0PV)</h2>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Stunde</th>
                        <th>Günstigerer Tarif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tariffComparison.map(({ hour, cheaper }) => (
                        <tr key={hour}>
                          <td>{hour}</td>
                          <td className={`cheaper-${cheaper.toLowerCase().replace('pv', 'pv')}`}>
                            {cheaper}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ) : (
            <p style={styles.noData}>⚠️ Keine Daten für das ausgewählte Datum.</p>
          )}
        </div>
      )}
    </div>
  );
}
