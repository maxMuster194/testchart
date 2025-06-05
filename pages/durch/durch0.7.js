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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const styles = {
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
    opacity: '0.9',
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
    borderBottom: '2px solid #d1fae5',
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
  summaryContainer: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    textAlign: 'center',
  },
  summaryItem: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#1a4731',
    marginBottom: '0.5rem',
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
    backgroundColor: '#f4f6f8',
    color: '#2c3e50',
    padding: '16px 20px',
    marginBottom: '12px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    fontSize: '16px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    lineHeight: '1.4',
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

const calendarWeeks = {
  '01/2025': [
    { kw: '01', days: ['30/12/2024', '31/12/2024', '01/01/2025', '02/01/2025', '03/01/2025', '04/01/2025', '05/01/2025'] },
    { kw: '02', days: ['06/01/2025', '07/01/2025', '08/01/2025', '09/01/2025', '10/01/2025', '11/01/2025', '12/01/2025'] },
    { kw: '03', days: ['13/01/2025', '14/01/2025', '15/01/2025', '16/01/2025', '17/01/2025', '18/01/2025', '19/01/2025'] },
    { kw: '04', days: ['20/01/2025', '21/01/2025', '22/01/2025', '23/01/2025', '24/01/2025', '25/01/2025', '26/01/2025'] },
    { kw: '05', days: ['27/01/2025', '28/01/2025', '29/01/2025', '30/01/2025', '31/01/2025', '01/02/2025', '02/02/2025'] },
  ],
  '02/2025': [
    { kw: '05', days: ['27/01/2025', '28/01/2025', '29/01/2025', '30/01/2025', '31/01/2025', '01/02/2025', '02/02/2025'] },
    { kw: '06', days: ['03/02/2025', '04/02/2025', '05/02/2025', '06/02/2025', '07/02/2025', '08/02/2025', '09/02/2025'] },
    { kw: '07', days: ['10/02/2025', '11/02/2025', '12/02/2025', '13/02/2025', '14/02/2025', '15/02/2025', '16/02/2025'] },
    { kw: '08', days: ['17/02/2025', '18/02/2025', '19/02/2025', '20/02/2025', '21/02/2025', '22/02/2025', '23/02/2025'] },
    { kw: '09', days: ['24/02/2025', '25/02/2025', '26/02/2025', '27/02/2025', '28/02/2025', '01/03/2025', '02/03/2025'] },
  ],
  '03/2025': [
    { kw: '09', days: ['24/02/2025', '25/02/2025', '26/02/2025', '27/02/2025', '28/02/2025', '01/03/2025', '02/03/2025'] },
    { kw: '10', days: ['03/03/2025', '04/03/2025', '05/03/2025', '06/03/2025', '07/03/2025', '08/03/2025', '09/03/2025'] },
    { kw: '11', days: ['10/03/2025', '11/03/2025', '12/03/2025', '13/03/2025', '14/03/2025', '15/03/2025', '16/03/2025'] },
    { kw: '12', days: ['17/03/2025', '18/03/2025', '19/03/2025', '20/03/2025', '21/03/2025', '22/03/2025', '23/03/2025'] },
    { kw: '13', days: ['24/03/2025', '25/03/2025', '26/03/2025', '27/03/2025', '28/03/2025', '29/03/2025', '30/03/2025'] },
    { kw: '14', days: ['31/03/2025', '01/04/2025', '02/04/2025', '03/04/2025', '04/04/2025', '05/04/2025', '06/04/2025'] },
  ],
  '04/2025': [
    { kw: '14', days: ['31/03/2025', '01/04/2025', '02/04/2025', '03/04/2025', '04/04/2025', '05/04/2025', '06/04/2025'] },
    { kw: '15', days: ['07/04/2025', '08/04/2025', '09/04/2025', '10/04/2025', '11/04/2025', '12/04/2025', '13/04/2025'] },
    { kw: '16', days: ['14/04/2025', '15/04/2025', '16/04/2025', '17/04/2025', '18/04/2025', '19/04/2025', '20/04/2025'] },
    { kw: '17', days: ['21/04/2025', '22/04/2025', '23/04/2025', '24/04/2025', '25/04/2025', '26/04/2025', '27/04/2025'] },
    { kw: '18', days: ['28/04/2025', '29/04/2025', '30/04/2025', '01/05/2025', '02/05/2025', '03/05/2025', '04/05/2025'] },
  ],
  '05/2025': [
    { kw: '18', days: ['28/04/2025', '29/04/2025', '30/04/2025', '01/05/2025', '02/05/2025', '03/05/2025', '04/05/2025'] },
    { kw: '19', days: ['05/05/2025', '06/05/2025', '07/05/2025', '08/05/2025', '09/05/2025', '10/05/2025', '11/05/2025'] },
    { kw: '20', days: ['12/05/2025', '13/05/2025', '14/05/2025', '15/05/2025', '16/05/2025', '17/05/2025', '18/05/2025'] },
    { kw: '21', days: ['19/05/2025', '20/05/2025', '21/05/2025', '22/05/2025', '23/05/2025', '24/05/2025', '25/05/2025'] },
    { kw: '22', days: ['26/05/2025', '27/05/2025', '28/05/2025', '29/05/2025', '30/05/2025', '31/05/2025', '01/06/2025'] },
  ],
  '06/2025': [
    { kw: '22', days: ['26/05/2025', '27/05/2025', '28/05/2025', '29/05/2025', '30/05/2025', '31/05/2025', '01/06/2025'] },
    { kw: '23', days: ['02/06/2025', '03/06/2025', '04/06/2025', '05/06/2025', '06/06/2025', '07/06/2025', '08/06/2025'] },
    { kw: '24', days: ['09/06/2025', '10/06/2025', '11/06/2025', '12/06/2025', '13/06/2025', '14/06/2025', '15/06/2025'] },
    { kw: '25', days: ['16/06/2025', '17/06/2025', '18/06/2025', '19/06/2025', '20/06/2025', '21/06/2025', '22/06/2025'] },
    { kw: '26', days: ['23/06/2025', '24/06/2025', '25/06/2025', '26/06/2025', '27/06/2025', '28/06/2025', '29/06/2025'] },
    { kw: '27', days: ['30/06/2025', '01/07/2025', '02/07/2025', '03/07/2025', '04/07/2025', '05/07/2025', '06/07/2025'] },
  ],
  '07/2025': [
    { kw: '27', days: ['30/06/2025', '01/07/2025', '02/07/2025', '03/07/2025', '04/07/2025', '05/07/2025', '06/07/2025'] },
    { kw: '28', days: ['07/07/2025', '08/07/2025', '09/07/2025', '10/07/2025', '11/07/2025', '12/07/2025', '13/07/2025'] },
    { kw: '29', days: ['14/07/2025', '15/07/2025', '16/07/2025', '17/07/2025', '18/07/2025', '19/07/2025', '20/07/2025'] },
    { kw: '30', days: ['21/07/2025', '22/07/2025', '23/07/2025', '24/07/2025', '25/07/2025', '26/07/2025', '27/07/2025'] },
    { kw: '31', days: ['28/07/2025', '29/07/2025', '30/07/2025', '31/07/2025', '01/08/2025', '02/08/2025', '03/08/2025'] },
  ],
  '08/2025': [
    { kw: '31', days: ['28/07/2025', '29/07/2025', '30/07/2025', '31/07/2025', '01/08/2025', '02/08/2025', '03/08/2025'] },
    { kw: '32', days: ['04/08/2025', '05/08/2025', '06/08/2025', '07/08/2025', '08/08/2025', '09/08/2025', '10/08/2025'] },
    { kw: '33', days: ['11/08/2025', '12/08/2025', '13/08/2025', '14/08/2025', '15/08/2025', '16/08/2025', '17/08/2025'] },
    { kw: '34', days: ['18/08/2025', '19/08/2025', '20/08/2025', '21/08/2025', '22/08/2025', '23/08/2025', '24/08/2025'] },
    { kw: '35', days: ['25/08/2025', '26/08/2025', '27/08/2025', '28/08/2025', '29/08/2025', '30/08/2025', '31/08/2025'] },
  ],
  '09/2025': [
    { kw: '36', days: ['01/09/2025', '02/09/2025', '03/09/2025', '04/09/2025', '05/09/2025', '06/09/2025', '07/09/2025'] },
    { kw: '37', days: ['08/09/2025', '09/09/2025', '10/09/2025', '11/09/2025', '12/09/2025', '13/09/2025', '14/09/2025'] },
    { kw: '38', days: ['15/09/2025', '16/09/2025', '17/09/2025', '18/09/2025', '19/09/2025', '20/09/2025', '21/09/2025'] },
    { kw: '39', days: ['22/09/2025', '23/09/2025', '24/09/2025', '25/09/2025', '26/09/2025', '27/09/2025', '28/09/2025'] },
    { kw: '40', days: ['29/09/2025', '30/09/2025', '01/10/2025', '02/10/2025', '03/10/2025', '04/10/2025', '05/10/2025'] },
  ],
  '10/2025': [
    { kw: '40', days: ['29/09/2025', '30/09/2025', '01/10/2025', '02/10/2025', '03/10/2025', '04/10/2025', '05/10/2025'] },
    { kw: '41', days: ['06/10/2025', '07/10/2025', '08/10/2025', '09/10/2025', '10/10/2025', '11/10/2025', '12/10/2025'] },
    { kw: '42', days: ['13/10/2025', '14/10/2025', '15/10/2025', '16/10/2025', '17/10/2025', '18/10/2025', '19/10/2025'] },
    { kw: '43', days: ['20/10/2025', '21/10/2025', '22/10/2025', '23/10/2025', '24/10/2025', '25/10/2025', '26/10/2025'] },
    { kw: '44', days: ['27/10/2025', '28/10/2025', '29/10/2025', '30/10/2025', '31/10/2025', '01/11/2025', '02/11/2025'] },
  ],
  '11/2025': [
    { kw: '44', days: ['27/10/2025', '28/10/2025', '29/10/2025', '30/10/2025', '31/10/2025', '01/11/2025', '02/11/2025'] },
    { kw: '45', days: ['03/11/2025', '04/11/2025', '05/11/2025', '06/11/2025', '07/11/2025', '08/11/2025', '09/11/2025'] },
    { kw: '46', days: ['10/11/2025', '11/11/2025', '12/11/2025', '13/11/2025', '14/11/2025', '15/11/2025', '16/11/2025'] },
    { kw: '47', days: ['17/11/2025', '18/11/2025', '19/11/2025', '20/11/2025', '21/11/2025', '22/11/2025', '23/11/2025'] },
    { kw: '48', days: ['24/11/2025', '25/11/2025', '26/11/2025', '27/11/2025', '28/11/2025', '29/11/2025', '30/11/2025'] },
  ],
  '12/2025': [
    { kw: '49', days: ['01/12/2025', '02/12/2025', '03/12/2025', '04/12/2025', '05/12/2025', '06/12/2025', '07/12/2025'] },
    { kw: '50', days: ['08/12/2025', '09/12/2025', '10/12/2025', '11/12/2025', '12/12/2025', '13/12/2025', '14/12/2025'] },
    { kw: '51', days: ['15/12/2025', '16/12/2025', '17/12/2025', '18/12/2025', '19/12/2025', '20/12/2025', '21/12/2025'] },
    { kw: '52', days: ['22/12/2025', '23/12/2025', '24/12/2025', '25/12/2025', '26/12/2025', '27/12/2025', '28/12/2025'] },
    { kw: '53', days: ['29/12/2025', '30/12/2025', '31/12/2025', '01/01/2026', '02/01/2026', '03/01/2026', '04/01/2026'] },
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const months = [
    '01/2025', '02/2025', '03/2025', '04/2025', '05/2025', '06/2025',
    '07/2025', '08/2025', '09/2025', '10/2025', '11/2025', '12/2025',
  ];

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
        const daysInMonth = monthData.length;
        if (zeitraum === 'täglich') {
          kwhValue = ((verbrauch / 365) * daysInMonth).toFixed(2);
        } else if (zeitraum === 'monatlich') {
          kwhValue = (verbrauch / 12).toFixed(2);
        } else {
          kwhValue = verbrauch.toFixed(2);
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
        weeklyAverages.push({ kw: '01', average: '0.00', days: week.days });
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

        weeklyAverages.push({ kw: week.kw, average: weeklyAverage, days: week.days });
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

  const getWeekDateRange = (days) => {
    if (!days || !days.length) return '–e';
    const startDate = days[0];
    const endDate = days[days.length - 1];
    return `${startDate} - ${endDate}`;
  };

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ];

  const handleCardClick = (monthKey) => {
    setSelectedMonth(monthKey);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMonth(null);
  };

  if (loading) {
    return <div style={styles.loading}>⏳ Daten werden geladen…</div>;
  }

  if (!data.length && !Object.keys(monthlyData).length) {
    return <div style={styles.noData}>⚠️ Keine Daten gefunden.</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🇩🇪 Vergleich 0.7</h1>

      <div style={styles.inputContainer}>
        <label htmlFor="verbrauchInput" style={styles.inputLabel}>
          Verbrauch und Preis eingeben:
        </label>
        <div style={styles.inputGroup}>
          <input
            type="number"
            id="verbrauchInput"
            placeholder="z. B. 3600 kWh/Jahr"
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
            
            <option value="monatlich">Jährlich</option>
            
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
              style={selectedMonth === monthKey ? { ...styles.card, ...styles.selectedCard } : styles.card}
              onClick={() => handleCardClick(monthKey)}
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

      {isModalOpen && selectedMonth && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button onClick={closeModal} style={styles.modalCloseButton}>
              ×
            </button>
            {monthlyData[selectedMonth] && monthlyData[selectedMonth].length > 0 ? (
              <>
                <h2 style={styles.monthTitle}>
                  📅 {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
                </h2>
                <div style={styles.monthlyAverage}>
                  📊 Monatsdurchschnitt: {calculateMonthlyAverage(monthlyData[selectedMonth])} Cent/kWh
                </div>
                <div style={styles.monthlyAverage}>
                  ⚡ Eingegebener Verbrauch: {displayedKwh[selectedMonth] || '–'} kWh
                </div>
                <div style={styles.monthlyAverage}>
                  💰 Eingegebener Preis: {eigenerPreis ? `${eigenerPreis} Cent/kWh` : '–'}
                </div>
                {/* Entfernte Tabelle: Wöchentliche Durchschnitte */}
                <div style={styles.summaryContainer}>
                  <h3 style={styles.monthTitle}>Zusammenfassung Wöchentliche Kosten</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Kalenderwoche</th>
                        <th style={styles.th}>Zeitraum</th>
                        <th style={styles.th}>Wöchentlicher Durchschnitt (Cent/kWh)</th>
                        <th style={styles.th}>Verbrauch (kWh)</th>
                        <th style={styles.th}>Kosten (€)</th>
                        <th style={styles.th}>Kosten Eigener Preis (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]).map((week, i) => {
                        const verbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                        const weeklyAverage = week.average !== '–' ? parseFloat(week.average) : 0;
                        const eigenerPreisValue = parseFloat(eigenerPreis) || 0;
                        const weeklyKwh = verbrauch ? (verbrauch / 4).toFixed(2) : '–';
                        const kosten = verbrauch && weeklyAverage ? ((weeklyAverage * verbrauch) / 100 / 4).toFixed(2) : '–';
                        const kostenEigenerPreis = verbrauch && eigenerPreisValue ? ((eigenerPreisValue * verbrauch) / 100 / 4).toFixed(2) : '–';

                        return (
                          <tr key={week.kw} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                            <td style={styles.td}>KW {week.kw}</td>
                            <td style={styles.td}>{getWeekDateRange(week.days)}</td>
                            <td style={styles.td}>{week.average}</td>
                            <td style={styles.td}>{weeklyKwh}</td>
                            <td style={styles.td}>{kosten}</td>
                            <td style={styles.td}>{kostenEigenerPreis}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={styles.trEven}>
                        <td style={styles.td} colSpan={2}><strong>Gesamt</strong></td>
                        <td style={styles.td}>
                          <strong>
                            {(() => {
                              const weeklyAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                              const validAverages = weeklyAverages
                                .filter((week) => week.average !== '–')
                                .map((week) => parseFloat(week.average));
                              return validAverages.length > 0
                                ? (validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length).toFixed(2)
                                : '–';
                            })()}
                          </strong>
                        </td>
                        <td style={styles.td}>
                          <strong>
                            {(() => {
                              const verbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                              return verbrauch ? verbrauch.toFixed(2) : '–';
                            })()}
                          </strong>
                        </td>
                        <td style={styles.td}>
                          <strong>
                            {(() => {
                              const weeklyAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                              const verbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                              const totalKosten = weeklyAverages
                                .filter((week) => week.average !== '–')
                                .reduce((sum, week) => {
                                  const weeklyAverage = parseFloat(week.average);
                                  return sum + (weeklyAverage * verbrauch) / 100 / 4;
                                }, 0);
                              return totalKosten ? totalKosten.toFixed(2) : '–';
                            })()}
                          </strong>
                        </td>
                        <td style={styles.td}>
                          <strong>
                            {(() => {
                              const weeklyAverages = calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]);
                              const verbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                              const eigenerPreisValue = parseFloat(eigenerPreis) || 0;
                              const totalKostenEigenerPreis = weeklyAverages
                                .filter((week) => week.average !== '–')
                                .reduce((sum) => sum + (eigenerPreisValue * verbrauch) / 100 / 4, 0);
                              return totalKostenEigenerPreis ? totalKostenEigenerPreis.toFixed(2) : '–';
                            })()}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  
                </div>
                {calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth]).filter((week) => week.average !== '–').length > 0 && (
                  <div style={styles.chartContainer}>
                    <h2 style={styles.chartTitle}>
                      📊 Wöchentliche Durchschnitte für {monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} {selectedMonth.split('/')[1]}
                    </h2>
                    <Bar
                      data={{
                        labels: calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth])
                          .filter((week) => week.average !== '–')
                          .map((week) => `KW ${week.kw} (${getWeekDateRange(week.days)})`),
                        datasets: [
                          {
                            label: `Wöchentliche Durchschnitte ${monthNames[parseInt(selectedMonth.split('/')[0]) - 1]} ${selectedMonth.split('/')[1]} (Cent/kWh)`,
                            data: calculateWeeklyAverages(selectedMonth, monthlyData[selectedMonth])
                              .filter((week) => week.average !== '–')
                              .map((week) => parseFloat(week.average)),
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
                    <div style={styles.summaryContainer}>
                      <div style={styles.summaryItem}>
                        Gesamtkosten bei Durchschnittspreis: {(() => {
                          const verbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                          const monthlyAverage = parseFloat(calculateMonthlyAverage(monthlyData[selectedMonth])) || 0;
                          return verbrauch && monthlyAverage ? `${(monthlyAverage * verbrauch / 100).toFixed(2)} €` : '–';
                        })()}
                      </div>
                      <div style={styles.summaryItem}>
                        Gesamtkosten Eigener Preis: {(() => {
                          const verbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                          const eigenerPreisValue = parseFloat(eigenerPreis) || 0;
                          return verbrauch && eigenerPreisValue ? `${(eigenerPreisValue * verbrauch / 100).toFixed(2)} €` : '–';
                        })()}
                      </div>
                      <div style={styles.summaryItem}>
                        Sparbetrag (Verwendung von dynamischem Tarif): {(() => {
                          const verbrauch = parseFloat(displayedKwh[selectedMonth]) || 0;
                          const monthlyAverage = parseFloat(calculateMonthlyAverage(monthlyData[selectedMonth])) || 0;
                          const eigenerPreisValue = parseFloat(eigenerPreis) || 0;
                          if (!verbrauch || !monthlyAverage || !eigenerPreisValue) return '–';
                          const diff = (eigenerPreisValue * verbrauch / 100) - (monthlyAverage * verbrauch / 100);
                          return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} €`;
                        })()}
                      </div>
                    </div>
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