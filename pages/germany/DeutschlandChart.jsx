import { useEffect, useState } from 'react';
import Berechnung from './Berechnung';
import Chartsde from './chartsde'; // Corrected import name and path

const styles = {
  banner: {
    width: '100vw',
    height: '250px',
    objectFit: 'cover',
    position: 'relative',
    left: 'calc(-50vw + 50%)',
    marginBottom: '2rem',
  },
  container: {
    padding: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: '1',
    minWidth: '300px',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  rightColumn: {
    flex: '1',
    minWidth: '300px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#1a1a1a',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  datePickerLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333',
  },
  datePicker: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  loading: {
    fontSize: '1.25rem',
    color: '#555',
    textAlign: 'center',
    padding: '2rem',
  },
  noData: {
    fontSize: '1.25rem',
    color: '#d32f2f',
    textAlign: 'center',
    padding: '2rem',
  },
};

export default function DeutschlandChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

        setData(germanyData);
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
          setSelectedDate(currentDate);
        } else if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={styles.loading}>⏳ Daten werden geladen…</div>;
  if (!data.length) return <div style={styles.noData}>⚠️ Keine Daten gefunden.</div>;

  return (
    <div>
      <img
        src="/bilder/Ilumy.jpg"
        alt="Header Banner"
        style={styles.banner}
      />
      <div style={styles.container}>
        <div style={styles.leftColumn}>
          <h2 style={{ ...styles.title, fontSize: '1.5rem' }}></h2>
          <Berechnung />
        </div>
        <div style={styles.rightColumn}>
         
          <Chartsde data={data} selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}