import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

export default function CombinedH0H0PVDisplay() {
  const [h0Data, setH0Data] = useState([]);
  const [h0PVData, setH0PVData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

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

        // Set default date if available
        if (h0Result.length > 0 && h0Result[0].date) {
          setSelectedDate(new Date(h0Result[0].date.split('/').reverse().join('-')));
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Debug data
  useEffect(() => {
    console.log('Selected H0 Data:', h0Data);
    console.log('Selected H0PV Data:', h0PVData);
    console.log('Selected Date:', selectedDate);
  }, [h0Data, h0PVData, selectedDate]);

  // Format date for comparison
  const formatDateForComparison = (date) => {
    return date
      ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
      : '';
  };

  // Filter data for selected date
  const selectedH0Data = h0Data.find((item) => item.date === formatDateForComparison(selectedDate));
  const selectedH0PVData = h0PVData.find((item) => item.date === formatDateForComparison(selectedDate));

  // Tariff comparison for each hour
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

  // Prepare chart data
  const chartData = {
    labels: [
      '01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
      '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
    ],
    datasets: [
      {
        label: 'H0 Values',
        data: selectedH0Data?.__parsed_extra
          ? Object.values(selectedH0Data.__parsed_extra)
          : Array(24).fill(0),
        borderColor: '#1E88E5',
        backgroundColor: 'rgba(30, 136, 229, 0.1)',
        fill: false, // Disable fill to ensure lines are visible
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'H0PV Values',
        data: selectedH0PVData?.__parsed_extra
          ? Object.values(selectedH0PVData.__parsed_extra)
          : Array(24).fill(0),
        borderColor: '#D81B60',
        backgroundColor: 'rgba(216, 27, 96, 0.1)',
        fill: false, // Disable fill to ensure lines are visible
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'H0 and H0PV Values per Hour',
        font: {
          size: 18,
          family: "'Inter', sans-serif",
          weight: '600',
        },
        color: '#333',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: "'Inter', sans-serif" },
        bodyFont: { family: "'Inter', sans-serif" },
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const h0Value = context.datasetIndex === 0 ? context.raw : chartData.datasets[0].data[index];
            const h0PVValue = context.datasetIndex === 1 ? context.raw : chartData.datasets[1].data[index];
            const label = context.dataset.label;
            const value = context.raw.toFixed(3);
            const cheaper = h0Value < h0PVValue ? 'H0 cheaper' : h0Value > h0PVValue ? 'H0PV cheaper' : 'Equal';
            return `${label}: ${value} (${cheaper})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          color: '#333',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Hour',
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          color: '#333',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="container">
      <style>
        {`
          /* General styling */
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 24px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            font-family: 'Inter', sans-serif;
          }

          /* Headings */
          h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 24px;
            text-align: center;
          }

          h2 {
            font-size: 18px;
            font-weight: 500;
            color: #333;
            margin: 24px 0 12px;
          }

          /* DatePicker styling */
          .date-picker-container {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
          }

          .date-picker-container label {
            font-size: 14px;
            font-weight: 500;
            color: #333;
          }

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

          /* Chart container */
          .chart-container {
            background-color: #fff;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
          }

          /* Table styling */
          .data-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .data-table th,
          .data-table td {
            padding: 12px;
            text-align: center;
            font-size: 14px;
            border-bottom: 1px solid #e0e0e0;
          }

          .data-table th {
            background-color: #f5f5f5;
            font-weight: 600;
            color: #333;
          }

          .data-table tbody tr:nth-child(even) {
            background-color: #fafafa;
          }

          .data-table tbody tr:hover {
            background-color: #f0f0f0;
            transition: background-color 0.2s ease;
          }

          /* Comparison table styling */
          .comparison-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-top: 24px;
          }

          .comparison-table th,
          .comparison-table td {
            padding: 12px;
            text-align: center;
            font-size: 14px;
            border-bottom: 1px solid #e0e0e0;
          }

          .comparison-table th {
            background-color: #f5f5f5;
            font-weight: 600;
            color: #333;
          }

          .comparison-table .cheaper-h0 {
            color: #1E88E5;
            font-weight: 500;
          }

          .comparison-table .cheaper-h0pv {
            color: #D81B60;
            font-weight: 500;
          }

          .comparison-table .cheaper-equal {
            color: #666;
            font-weight: 500;
          }

          /* Loading and error messages */
          .loading {
            text-align: center;
            font-size: 16px;
            color: #666;
            animation: pulse 1.5s infinite;
          }

          .error {
            text-align: center;
            font-size: 16px;
            font-weight: 500;
            color: #D81B60;
            background-color: #ffe6ec;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 24px;
          }

          .no-data {
            text-align: center;
            font-size: 16px;
            color: #666;
            padding: 12px;
            background-color: #f9f9f9;
            border-radius: 8px;
          }

          /* Animation for loading state */
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }

          /* Responsive design */
          @media (max-width: 600px) {
            .container {
              padding: 16px;
            }

            .date-picker {
              width: 100%;
            }

            .data-table th,
            .data-table td,
            .comparison-table th,
            .comparison-table td {
              font-size: 12px;
              padding: 8px;
            }
          }
        `}
      </style>

      <h1>H0 and H0PV Data</h1>

      {loading && <p className="loading">Loading data...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (h0Data.length > 0 || h0PVData.length > 0) && (
        <div>
          {/* Date picker */}
          <div className="date-picker-container">
            <label htmlFor="datePicker">Select date:</label>
            <DatePicker
              id="datePicker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select a date"
              className="date-picker"
            />
          </div>

          {/* Chart display */}
          {(selectedH0Data || selectedH0PVData) ? (
            <div>
              <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
              </div>

              {/* H0 data table */}
              {selectedH0Data?.__parsed_extra && (
                <>
                  <h2>H0 Values</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hour</th>
                        <th>Value</th>
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

              {/* H0PV data table */}
              {selectedH0PVData?.__parsed_extra && (
                <>
                  <h2>H0PV Values</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Hour</th>
                        <th>Value</th>
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

              {/* Tariff comparison table */}
              {tariffComparison.length > 0 && (
                <>
                  <h2>Cheaper Tariff per Hour</h2>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>Hour</th>
                        <th>Cheaper Tariff</th>
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
            <p className="no-data">No data available for the selected date</p>
          )}
        </div>
      )}

      {!loading && !error && h0Data.length === 0 && h0PVData.length === 0 && (
        <p className="no-data">No data available</p>
      )}
    </div>
  );
}