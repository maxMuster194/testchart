import { useEffect, useState } from 'react';

export default function GermanyPage() {
  const [germanyData, setGermanyData] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/sftp');
      const data = await response.json();

      // Filtere nur Zeilen mit Inhalt
      const cleanedData = data.germany.filter(row =>
        Object.values(row).some(value => value !== '' && value !== null && value !== undefined)
      );

      setGermanyData(cleanedData);
    };
    fetchData();
  }, []);

  const sortData = (field) => {
    setSortAsc(field === sortField ? !sortAsc : true);
    setSortField(field);
    const sorted = [...germanyData].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (!isNaN(valA) && !isNaN(valB)) {
        return sortAsc ? valA - valB : valB - valA;
      }

      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    setGermanyData(sorted);
  };

  if (!germanyData.length) return <div>Daten werden geladen...</div>;

  // Nur sinnvolle Header anzeigen
  const headers = Object.keys(germanyData[0]).filter(key => key && key.trim() !== '');

  return (
    <div>
      <h1>📊 Stromdaten Deutschland</h1>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ backgroundColor: '#eee' }}>
          <tr>
            {headers.map((header, i) => (
              <th key={i} onClick={() => sortData(header)} style={{ cursor: 'pointer' }}>
                {header} {sortField === header ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {germanyData.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#fff' }}>
              {headers.map((key, i) => (
                <td key={i}>{row[key] === '' ? '-' : row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
