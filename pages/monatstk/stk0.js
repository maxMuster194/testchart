import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import Chart.js Bar component with SSR disabled
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
});

// Import Chart.js components
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Styles object for inline CSS
const styles = {
  container: {
    padding: '1rem', // Reduced padding for a more open feel
    maxWidth: '1440px', // Slightly wider max-width for a more spacious layout
    margin: '0 auto',
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
  title: {
    fontSize: '2.25rem', // Slightly larger for prominence
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: 'rgb(67,114,183)',
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: '2rem',
    padding: '1rem', // Reduced padding
    backgroundColor: 'transparent', // Remove background for openness
    borderRadius: '8px', // Softer corners
    boxShadow: 'none', // Remove box shadow for a flatter look
  },
  chartTitle: {
    fontSize: '1.75rem', // Slightly larger for emphasis
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'rgb(67,114,183)',
    textAlign: 'center',
  },
  loading: {
    fontSize: '1.5rem',
    fontWeight: '500',
    color: 'rgb(67,114,183)',
    textAlign: 'center',
    padding: '2rem',
    borderRadius: '8px',
  },
  noData: {
    fontSize: '1.5rem',
    fontWeight: '500',
    color: '#dc2626',
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: 'transparent', // Remove background for consistency
    borderRadius: '8px',
  },
};

// Data constants
const months = [
  '01/2025', '02/2025', '03/2025', '04/2025', '05/2025', '06/2025',
  '07/2025', '08/2025', '09/2025', '10/2025', '11/2025', '12/2025',
];

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

// Statistik component
function Statistik() {
  const [data, setData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/mongodb', { cache: 'no-store' });
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
    }

    fetchData();
  }, []);

  const calculateMonthlyAverage = (monthData) => {
    const validAverages = monthData
      .filter((day) => day.average !== '–')
      .map((day) => parseFloat(day.average));
    return validAverages.length > 0
      ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
      : '–';
  };

  if (loading) {
    return <div style={styles.loading}>⏳ Daten werden geladen…</div>;
  }

  if (!data.length && !Object.keys(monthlyData).length) {
    return <div style={styles.noData}>⚠️ Keine Daten gefunden.</div>;
  }

  return (
    <>
      <Head>
        <title>MongoDB Monthly Prices</title>
      </Head>
      <div style={styles.container}>
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Monatliche Durchschnittspreise 2025</h2>
          <Bar
            data={{
              labels: monthNames,
              datasets: [
                {
                  label: 'Durchschnittspreis (ct/kWh)',
                  data: months.map((monthKey) => {
                    const monthlyAverage = monthlyData[monthKey]
                      ? calculateMonthlyAverage(monthlyData[monthKey])
                      : null;
                    return monthlyAverage !== '–' ? parseFloat(monthlyAverage) : null;
                  }),
                  backgroundColor: 'rgb(67,114,183)',
                  borderColor: 'rgb(67,114,183)',
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
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.raw;
                      return value !== null ? `${value.toFixed(2)} Cent/kWh` : 'Keine Daten';
                    },
                  },
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
      </div>
    </>
  );
}

export default Statistik;