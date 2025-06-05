import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registriere die Chart.js-Komponenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Standardverbraucher-Objekt
const standardVerbraucher = {
  kühlschrank: 120,
  gefrierschrank: 200,
  aquarium: 50,
  waschmaschine: 1200,
  geschirrspüler: 600,
  wäschetrockner: 3500,
  herd: 2000,
  multimedia: 350,
  licht: 60,
  eauto: 3000,
};

// Benutzerdefinierte Beschreibungen für Tooltips
const verbraucherBeschreibungen = {
  kühlschrank: "Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W.",
  gefrierschrank: "Der Gefrierschrank benötigt etwa 200 W für Langzeitlagerung.",
  aquarium: "Ein Aquarium verbraucht ca. 50 W, abhängig von Größe und Ausstattung.",
  waschmaschine: "Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (1,37h/Woche).",
  geschirrspüler: "Der Geschirrspüler benötigt ca. 600 W pro Spülgang (1,27h/Woche).",
  wäschetrockner: "Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (1,37h/Woche).",
  herd: "Der Herd benötigt etwa 2000 W bei 1 Stunde täglicher Nutzung.",
  multimedia: "Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.",
  licht: "Beleuchtung verbraucht etwa 60 W bei 5 Stunden täglicher Nutzung.",
  eauto: "E-Auto-Ladung verbraucht ca. 3000 W, abhängig von Batterie und Wallbox.",
};

// Zeitoptionen für Dropdown-Menüs (00:00 bis 23:30 in 30-Minuten-Schritten)
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const minutes = (i % 2 === 0 ? '00' : '30');
  return `${hours}:${minutes}`;
});

function App() {
  const [mode, setMode] = useState('allgemein');
  const [strompreis, setStrompreis] = useState(0.32);
  const [verbraucherDaten, setVerbraucherDaten] = useState(
    Object.keys(standardVerbraucher).reduce((acc, key) => ({
      ...acc,
      [key]: { watt: 0, checked: false, kosten: 0 },
    }), {})
  );
  const [erweiterteEinstellungen, setErweiterteEinstellungen] = useState(
    Object.keys(standardVerbraucher).reduce((acc, key) => {
      let startzeit, endzeit, dauer, nutzung;
  
      switch (key) {
        case 'waschmaschine':
          startzeit = '10:00';
          endzeit = '11:30';
          dauer = 1.37;
          nutzung = 2;
          break;
        case 'wäschetrockner':
          startzeit = '14:00';
          endzeit = '15:30';
          dauer = 1.37;
          nutzung = 2;
          break;
        case 'geschirrspüler':
          startzeit = '18:00';
          endzeit = '19:30';
          dauer = 1.27;
          nutzung = 7;
          break;
        case 'herd':
          startzeit = '12:00';
          endzeit = '13:00';
          dauer = 1.0;
          nutzung = 3;
          break;
        case 'multimedia':
          startzeit = '18:00';
          endzeit = '22:00';
          dauer = 3.0;
          nutzung = 3;
          break;
        case 'licht':
          startzeit = '18:00';
          endzeit = '22:00';
          dauer = 5.0;
          nutzung = 3;
          break;
        case 'eauto':
          startzeit = '00:00';
          endzeit = '00:00';
          dauer = 2.0;
          nutzung = 0;
          break;
        default:
          startzeit = 'Startzeit';
          endzeit = 'Endzeit';
          dauer = 0;
          nutzung = 0;
      }
  
      return {
        ...acc,
        [key]: {
          nutzung,
          zeitraeume: [{
            id: Date.now() + Math.random(),
            startzeit,
            endzeit,
            dauer
          }]
        }
      };
    }, {})
  );
  
  const [showErweiterteOptionen, setShowErweiterteOptionen] = useState(false);
  const [zusammenfassung, setZusammenfassung] = useState({
    grundlast: 0,
    dynamisch: 0,
    gesamt: 0,
  });
  const [ladezyklen, setLadezyklen] = useState([{ id: Date.now(), von: '06:00', bis: '08:00' }]);
  const [showLadezyklen, setShowLadezyklen] = useState(false);
  const [eAutoDaten, setEAutoDaten] = useState({
    batterieKW: 0,
    wallboxKW: 0,
    ladefrequenz: 0,
    standardLadung: false,
    jahreskosten: '–',
  });
  const [error, setError] = useState('');
  const [showGrundlast, setShowGrundlast] = useState(true);
  const [showDynamisch, setShowDynamisch] = useState(true);
  const [showEAuto, setShowEAuto] = useState(true);

  const getStrompreis = () => strompreis;

  const updateKosten = (watt, verbraucher) => {
    const strompreis = getStrompreis();
    let kosten = 0;

    switch (verbraucher) {
      case 'waschmaschine':
        kosten = (watt * 2 * 52) / 1000 * strompreis;
        break;
      case 'geschirrspüler':
        kosten = (watt * 7 * 52) / 1000 * strompreis;
        break;
      case 'wäschetrockner':
        kosten = (watt * 2 * 52) / 1000 * strompreis;
        break;
      case 'herd':
        kosten = (watt * 2 * 365) / 1000 * strompreis;
        break;
      case 'multimedia':
        kosten = (watt * 3 * 365) / 1000 * strompreis;
        break;
      case 'licht':
        kosten = (watt * 3 * 365) / 1000 * strompreis;
        break;
      case 'eauto':
        kosten = (watt * strompreis * 250) / 1000;
        break;
      default:
        kosten = (watt * strompreis * 24 * 365) / 1000;
    }

    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
    }));
  };

  const onCheckboxChange = (verbraucher, checked) => {
    const watt = checked ? standardVerbraucher[verbraucher] || 0 : 0;
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], watt, checked },
    }));
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht', 'eauto'].includes(verbraucher);
    if (checked) {
      if (isDynamisch) {
        const kosten = berechneDynamischenVerbrauch(watt, verbraucher);
        setVerbraucherDaten((prev) => ({
          ...prev,
          [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
        }));
      } else {
        updateKosten(watt, verbraucher);
      }
    } else {
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: 0 },
      }));
    }
    updateZusammenfassung();
  };

  const berechneDynamischenVerbrauch = (watt, verbraucher) => {
    const strompreis = getStrompreis();
    const einstellung = erweiterteEinstellungen[verbraucher];

    if (!einstellung || einstellung.zeitraeume.length === 0 || watt === 0) return 0;

    let totalDauer = 0;
    einstellung.zeitraeume.forEach(zeitraum => {
      const dauer = parseFloat(zeitraum.dauer) || 0;
      totalDauer += dauer;
    });

    if (totalDauer === 0) return 0;

    let kosten = 0;
    if (['waschmaschine', 'geschirrspüler', 'wäschetrockner'].includes(verbraucher)) {
      kosten = (watt * totalDauer * 52) / 1000 * strompreis;
    } else if (['herd', 'multimedia', 'licht'].includes(verbraucher)) {
      kosten = (watt * totalDauer * 365) / 1000 * strompreis;
    } else if (verbraucher === 'eauto') {
      kosten = (watt * totalDauer) / 1000 * strompreis;
    }

    return kosten;
  };

  const updateZusammenfassung = () => {
    let grundlast = 0;
    let dynamisch = 0;

    Object.keys(standardVerbraucher).forEach((key) => {
      if (key === 'eauto') return;

      const kosten = parseFloat(verbraucherDaten[key].kosten) || 0;
      if (['kühlschrank', 'gefrierschrank', 'aquarium'].includes(key)) {
        grundlast += kosten;
      } else {
        dynamisch += kosten;
      }
    });

    const eAutoKosten = eAutoDaten.jahreskosten !== '–' ? parseFloat(eAutoDaten.jahreskosten) || 0 : 0;
    dynamisch += eAutoKosten;

    setZusammenfassung({
      grundlast: grundlast.toFixed(2),
      dynamisch: dynamisch.toFixed(2),
      gesamt: (grundlast + dynamisch).toFixed(2),
    });
  };

  const standardEAutoKosten = () => {
    const { batterieKW } = eAutoDaten;
    const strompreis = getStrompreis();

    if (isNaN(batterieKW) || batterieKW <= 0 || isNaN(strompreis) || strompreis <= 0) {
      setEAutoDaten((prev) => ({ ...prev, jahreskosten: '–' }));
      setError('Bitte geben Sie eine gültige Batteriekapazität und einen Strompreis ein.');
      return '–';
    }

    const batterieKWh = batterieKW;
    const ladungenProJahr = 4 * 52;
    const jahreskosten = batterieKWh * ladungenProJahr * strompreis;

    setEAutoDaten((prev) => ({ ...prev, jahreskosten: jahreskosten.toFixed(2) }));
    setError('');
    return jahreskosten.toFixed(2);
  };

  const manuellEAutoKosten = () => {
    const { batterieKW, wallboxKW, ladefrequenz } = eAutoDaten;
    const strompreis = getStrompreis();

    if (
      isNaN(batterieKW) ||
      batterieKW <= 0 ||
      isNaN(wallboxKW) ||
      wallboxKW <= 0 ||
      isNaN(ladefrequenz) ||
      ladefrequenz <= 0 ||
      isNaN(strompreis) ||
      strompreis <= 0
    ) {
      setEAutoDaten((prev) => ({ ...prev, jahreskosten: '–' }));
      setError('Bitte geben Sie gültige Werte für Batterie, Wallbox und Ladefrequenz ein.');
      return '–';
    }

    const batterieKWh = batterieKW;
    const ladungenProJahr = ladefrequenz * 52;
    const jahreskosten = batterieKWh * ladungenProJahr * strompreis;

    setEAutoDaten((prev) => ({ ...prev, jahreskosten: jahreskosten.toFixed(2) }));
    setError('');
    return jahreskosten.toFixed(2);
  };

  const eAutoKosten = () => {
    let jahreskosten;

    if (eAutoDaten.standardLadung) {
      jahreskosten = standardEAutoKosten();
    } else {
      jahreskosten = manuellEAutoKosten();
    }

    setVerbraucherDaten((prev) => ({
      ...prev,
      eauto: {
        ...prev.eauto,
        kosten: jahreskosten !== '–' ? parseFloat(jahreskosten).toFixed(2) : '0.00',
      },
    }));
  };

  const toggleLadezyklen = () => {
    setShowLadezyklen((prev) => !prev);
  };

  const addLadezyklus = () => {
    setLadezyklen((prev) => [...prev, { id: Date.now(), von: '06:00', bis: '08:00' }]);
  };

  const removeLadezyklus = (id) => {
    setLadezyklen((prev) => prev.filter((zyklus) => zyklus.id !== id));
  };

  const handleLadezyklusChange = (id, field, value) => {
    setLadezyklen((prev) =>
      prev.map((zyklus) => (zyklus.id === id ? { ...zyklus, [field]: value } : zyklus))
    );
  };

  const handleWattChange = (verbraucher, value) => {
    const watt = parseFloat(value) || 0;
    if (watt < 0) {
      setError(`Wattleistung für ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], watt },
    }));
    setError('');

    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht', 'eauto'].includes(verbraucher);
    if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(watt, verbraucher);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
    } else {
      updateKosten(watt, verbraucher);
    }
    updateZusammenfassung();
  };

  const handleErweiterteEinstellungChange = (verbraucher, field, value, zeitraumId) => {
    const parsedValue = field === 'nutzung' || field === 'dauer' ? parseFloat(value) || 0 : value;
    if ((field === 'nutzung' || field === 'dauer') && parsedValue < 0) {
      setError(`Nutzung oder Dauer für ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: {
        ...prev[verbraucher],
        zeitraeume: prev[verbraucher].zeitraeume.map(zeitraum =>
          zeitraum.id === zeitraumId ? { ...zeitraum, [field]: parsedValue } : zeitraum
        )
      },
    }));
    setError('');

    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht', 'eauto'].includes(verbraucher);
    if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
      updateZusammenfassung();
    }
  };

  const addZeitraum = (verbraucher) => {
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: {
        ...prev[verbraucher],
        zeitraeume: [...prev[verbraucher].zeitraeume, {
          id: Date.now() + Math.random(), // Eindeutige ID
          startzeit: '08:00', // Standard-Startzeit für neuen Zeitraum
          endzeit: '10:00', // Standard-Endzeit für neuen Zeitraum
          dauer: prev[verbraucher].zeitraeume[0].dauer || 0 // Übernahme der Dauer des ersten Zeitraums
        }]
      }
    }));
  };

  const removeZeitraum = (verbraucher, zeitraumId) => {
    setErweiterteEinstellungen((prev) => {
      const zeitraeume = prev[verbraucher].zeitraeume;
      if (zeitraeume.length <= 1) {
        setError(`Mindestens ein Zeitraum muss für ${verbraucher} bestehen bleiben.`);
        return prev;
      }
      return {
        ...prev,
        [verbraucher]: {
          ...prev[verbraucher],
          zeitraeume: zeitraeume.filter(zeitraum => zeitraum.id !== zeitraumId)
        }
      };
    });
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht', 'eauto'].includes(verbraucher);
    if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
      updateZusammenfassung();
    }
  };

  const handleEAutoChange = (field, value) => {
    setEAutoDaten((prev) => ({
      ...prev,
      [field]: field === 'standardLadung' ? value : parseFloat(value) || 0,
    }));
    setError('');
  };

  const handleStrompreisChange = (value) => {
    const newStrompreis = parseFloat(value) || 0.32;
    if (newStrompreis < 0) {
      setError('Strompreis darf nicht negativ sein.');
      return;
    }
    setStrompreis(newStrompreis);
    setError('');

    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        if (verbraucher === 'eauto') {
          eAutoKosten();
        } else if (['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht'].includes(verbraucher)) {
          const kosten = berechneDynamischenVerbrauch(watt, verbraucher);
          setVerbraucherDaten((prev) => ({
            ...prev,
            [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
          }));
        } else {
          updateKosten(watt, verbraucher);
        }
      }
    });
    updateZusammenfassung();
  };

  const berechneStundenVerbrauch = () => {
    const stunden = Array(24).fill(0);

    Object.keys(standardVerbraucher).forEach((verbraucher) => {
      const watt = verbraucherDaten[verbraucher].watt || 0;
      if (watt <= 0) return;

      const isGrundlast = ['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher);
      const einstellung = erweiterteEinstellungen[verbraucher];

      if (isGrundlast) {
        for (let i = 0; i < 24; i++) {
          stunden[i] += watt / 1000;
        }
      } else {
        einstellung.zeitraeume.forEach(zeitraum => {
          const startzeit = zeitraum.startzeit;
          const endzeit = zeitraum.endzeit;
          if (startzeit && endzeit) {
            let startStunde = parseInt(startzeit.split(':')[0]);
            let endStunde = parseInt(endzeit.split(':')[0]);
            if (endStunde < startStunde) endStunde += 24;
            for (let i = startStunde; i <= endStunde && i < 24; i++) {
              stunden[i % 24] += watt / 1000;
            }
          }
        });
      }
    });

    return stunden;
  };

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Stromverbrauch (kW)',
        data: berechneStundenVerbrauch(),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stündlicher Stromverbrauch (kW)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Verbrauch (kW)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Uhrzeit',
        },
      },
    },
  };

  useEffect(() => {
    updateZusammenfassung();
    eAutoKosten();
  }, [verbraucherDaten, erweiterteEinstellungen, eAutoDaten]);

  const ladeAllgemein = () => setMode('allgemein');
  const ladeDetails = () => setMode('details');
  const ladeSpeicher = () => setMode('speicher');
  const ladeErzeuger = () => setMode('erzeuger');
  const toggleErweiterteOptionen = () => setShowErweiterteOptionen(!showErweiterteOptionen);

  const renderContent = () => {
    switch (mode) {
      case 'allgemein':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Allgemein</h2>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Haushalt – Standard Personen</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {[1, 2, 3, 4, '5+'].map((anzahl) => (
                  <button
                    key={anzahl}
                    onClick={() => console.log(`${anzahl} Person(en)`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    {anzahl} Person{anzahl === '5+' ? 'en' : ''}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Weitere Optionen</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {['PV-Vergleich'].map((option) => (
                  <button
                    key={option}
                    onClick={() => console.log(option)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Lastprofile</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {['H0-Profil', 'H0 mit PV'].map((option) => (
                  <button
                    key={option}
                    onClick={() => console.log(option)}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Details</h2>
            {error && <div className="text-red-500 p-4 bg-red-100 rounded">{error}</div>}
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Strompreis (€/kWh)</h3>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  id="strompreis"
                  value={strompreis}
                  step="0.01"
                  min="0"
                  onChange={(e) => handleStrompreisChange(e.target.value)}
                  className="p-2 border rounded w-32"
                  aria-label="Strompreis in € pro kWh"
                />
                <span className="text-gray-600">€/kWh (Standard: 0.32)</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 accordion-header p-2 rounded" onClick={() => setShowGrundlast(!showGrundlast)}>
                Grundlast Verbraucher {showGrundlast ? '▲' : '▼'}
              </h3>
              {showGrundlast && (
                <table className="w-full border-collapse bg-white rounded shadow">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Verbraucher</th>
                      <th className="p-2 text-left">Standard</th>
                      <th className="p-2 text-left">Info</th>
                      <th className="p-2 text-left">Watt</th>
                      <th className="p-2 text-left">Kosten/Jahr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['kühlschrank', 'gefrierschrank', 'aquarium'].map((verbraucher) => (
                      <tr key={verbraucher} className="border-b">
                        <td className="p-2">{verbraucher.charAt(0).toUpperCase() + verbraucher.slice(1)}</td>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={verbraucherDaten[verbraucher].checked}
                            onChange={(e) => onCheckboxChange(verbraucher, e.target.checked)}
                            aria-label={`Standardwert für ${verbraucher} aktivieren`}
                          />
                        </td>
                        <td className="p-2">
                          <span className="tooltip" aria-label={`Beschreibung für ${verbraucher}`}
                          >
                            ℹ️
                            <span className="tooltiptext">{verbraucherBeschreibungen[verbraucher]}</span>
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            id={`watt-${verbraucher}`}
                            value={verbraucherDaten[verbraucher].watt || ''}
                            placeholder="Watt eingeben"
                            onChange={(e) => handleWattChange(verbraucher, e.target.value)}
                            className="p-2 border rounded w-24"
                            aria-label={`Wattleistung für ${verbraucher} eingeben`}
                          />
                        </td>
                        <td className="p-2">{verbraucherDaten[verbraucher].kosten} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 accordion-header p-2 rounded" onClick={() => setShowDynamisch(!showDynamisch)}>
                Dynamische Verbraucher {showDynamisch ? '▲' : '▼'}
              </h3>
              {showDynamisch && (
                <table className="w-full border-collapse bg-white rounded shadow">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Verbraucher</th>
                      <th className="p-2 text-left">Standard</th>
                      <th className="p-2 text-left">Info</th>
                      <th className="p-2 text-left">Watt</th>
                      <th className="p-2 text-left">Kosten/Jahr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht'].map(
                      (verbraucher) => (
                        <tr key={verbraucher} className="border-b">
                          <td className="p-2">{verbraucher.charAt(0).toUpperCase() + verbraucher.slice(1)}</td>
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={verbraucherDaten[verbraucher].checked}
                              onChange={(e) => onCheckboxChange(verbraucher, e.target.checked)}
                              aria-label={`Standardwert für ${verbraucher} aktivieren`}
                            />
                          </td>
                          <td className="p-2">
                            <span className="tooltip" aria-label={`Beschreibung für ${verbraucher}`}>
                              ℹ️
                              <span className="tooltiptext">{verbraucherBeschreibungen[verbraucher]}</span>
                            </span>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              id={`watt-${verbraucher}`}
                              value={verbraucherDaten[verbraucher].watt || ''}
                              placeholder="Watt eingeben"
                              onChange={(e) => handleWattChange(verbraucher, e.target.value)}
                              className="p-2 border rounded w-24"
                              aria-label={`Wattleistung für ${verbraucher} eingeben`}
                            />
                          </td>
                          <td className="p-2">{verbraucherDaten[verbraucher].kosten} €</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 accordion-header p-2 rounded" onClick={() => setShowEAuto(!showEAuto)}>
                E-Auto Einstellungen {showEAuto ? '▲' : '▼'}
              </h3>
              {showEAuto && (
                <table className="w-full border-collapse bg-white rounded shadow">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">E-Auto Batterie (kWh)</td>
                      <td className="p-2">
                        <input
                          type="number"
                          id="batterie-kwh"
                          placeholder="z. B. 30"
                          value={eAutoDaten.batterieKW || ''}
                          onChange={(e) => handleEAutoChange('batterieKW', e.target.value)}
                          className="p-2 border rounded w-24"
                          aria-label="Batteriekapazität des E-Autos in kWh"
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Wallbox Leistung (kW)</td>
                      <td className="p-2">
                        <input
                          type="number"
                          id="wallbox-kw"
                          placeholder="z. B. 11"
                          value={eAutoDaten.wallboxKW || ''}
                          onChange={(e) => handleEAutoChange('wallboxKW', e.target.value)}
                          className="p-2 border rounded w-24"
                          aria-label="Wallbox-Leistung in kW"
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Ladefrequenz pro Woche</td>
                      <td className="p-2">
                        <input
                          type="number"
                          id="ladefrequenz"
                          placeholder="z. B. 3"
                          min="1"
                          value={eAutoDaten.ladefrequenz || ''}
                          onChange={(e) => handleEAutoChange('ladefrequenz', e.target.value)}
                          className="p-2 border rounded w-24"
                          aria-label="Ladefrequenz pro Woche"
                        />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Standardladung</td>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          id="standard-full"
                          checked={eAutoDaten.standardLadung}
                          onChange={(e) => handleEAutoChange('standardLadung', e.target.checked)}
                          aria-label="Standardladung für E-Auto verwenden"
                        />
                        <label htmlFor="standard-full" className="ml-2">Standardladung verwenden</label>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2"><strong>Jährliche Ladekosten (€)</strong></td>
                      <td className="p-2 text-green-600 font-semibold">{eAutoDaten.jahreskosten} €</td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="p-2">
                        <button
                          onClick={toggleLadezyklen}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition w-full"
                        >
                          Ladezyklen {showLadezyklen ? 'ausblenden' : 'anzeigen'}
                        </button>
                      </td>
                    </tr>
                    {showLadezyklen && (
                      <tr>
                        <td colSpan="2" className="p-2">
                          <div className="space-y-2">
                            {ladezyklen.map((zyklus) => (
                              <div key={zyklus.id} className="flex items-center gap-2">
                                <select
                                  value={zyklus.von}
                                  onChange={(e) => handleLadezyklusChange(zyklus.id, 'von', e.target.value)}
                                  className="p-2 border rounded"
                                  aria-label="Startzeit des Ladezyklus"
                                >
                                  <option value="">Startzeit wählen</option>
                                  {timeOptions.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                                <span>bis</span>
                                <select
                                  value={zyklus.bis}
                                  onChange={(e) => handleLadezyklusChange(zyklus.id, 'bis', e.target.value)}
                                  className="p-2 border rounded"
                                  aria-label="Endzeit des Ladezyklus"
                                >
                                  <option value="">Endzeit wählen</option>
                                  {timeOptions.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={addLadezyklus}
                                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => removeLadezyklus(zyklus.id)}
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  –
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 accordion-header p-2 rounded" onClick={toggleErweiterteOptionen}>
                Erweiterte Einstellungen {showErweiterteOptionen ? '▲' : '▼'}
              </h3>
              {showErweiterteOptionen && (
                <table className="w-full border-collapse bg-white rounded shadow">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Verbraucher</th>
                      <th className="p-2 text-left">Nutzung</th>
                      <th className="p-2 text-left">Startzeit</th>
                      <th className="p-2 text-left">Endzeit</th>
                      <th className="p-2 text-left">Dauer (h)</th>
                      <th className="p-2 text-left">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht', 'eauto'].map(
                      (verbraucher) => (
                        <tr key={verbraucher} className="border-b">
                          <td className="p-2 align-top">{verbraucher.charAt(0).toUpperCase() + verbraucher.slice(1)}</td>
                          <td className="p-2 align-top">
                            <label className="block text-sm">
                              Nutzung pro {['herd', 'multimedia', 'licht'].includes(verbraucher) ? 'Tag' : 'Woche'}:
                              <input
                                type="number"
                                value={erweiterteEinstellungen[verbraucher].nutzung || 0}
                                placeholder="0"
                                onChange={(e) =>
                                  handleErweiterteEinstellungChange(verbraucher, 'nutzung', e.target.value, erweiterteEinstellungen[verbraucher].zeitraeume[0].id)
                                }
                                className="p-2 border rounded w-24 mt-1"
                                aria-label={`Nutzung für ${verbraucher}`}
                              />
                            </label>
                          </td>
                          <td className="p-2">
                            {erweiterteEinstellungen[verbraucher].zeitraeume.map(zeitraum => (
                              <div key={zeitraum.id} className="mb-2">
                                <select
                                  value={zeitraum.startzeit}
                                  onChange={(e) =>
                                    handleErweiterteEinstellungChange(verbraucher, 'startzeit', e.target.value, zeitraum.id)
                                  }
                                  className="p-2 border rounded"
                                  aria-label={`Startzeit für ${verbraucher}`}
                                >
                                  <option value="">Startzeit wählen</option>
                                  {timeOptions.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </td>
                          <td className="p-2">
                            {erweiterteEinstellungen[verbraucher].zeitraeume.map(zeitraum => (
                              <div key={zeitraum.id} className="mb-2">
                                <select
                                  value={zeitraum.endzeit}
                                  onChange={(e) =>
                                    handleErweiterteEinstellungChange(verbraucher, 'endzeit', e.target.value, zeitraum.id)
                                  }
                                  className="p-2 border rounded"
                                  aria-label={`Endzeit für ${verbraucher}`}
                                >
                                  <option value="">Endzeit wählen</option>
                                  {timeOptions.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </td>
                          <td className="p-2">
                            {erweiterteEinstellungen[verbraucher].zeitraeume.map(zeitraum => (
                              <div key={zeitraum.id} className="mb-2">
                                <input
                                  type="number"
                                  value={zeitraum.dauer || 0}
                                  placeholder="0"
                                  onChange={(e) =>
                                    handleErweiterteEinstellungChange(verbraucher, 'dauer', e.target.value, zeitraum.id)
                                  }
                                  className="p-2 border rounded w-24"
                                  aria-label={`Dauer für ${verbraucher}`}
                                />
                              </div>
                            ))}
                          </td>
                          <td className="p-2">
                            {erweiterteEinstellungen[verbraucher].zeitraeume.map((zeitraum, index) => (
                              <div key={zeitraum.id} className="flex items-center gap-2 mb-2">
                                <button
                                  onClick={() => addZeitraum(verbraucher)}
                                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  +
                                </button>
                                {erweiterteEinstellungen[verbraucher].zeitraeume.length > 1 && (
                                  <button
                                    onClick={() => removeZeitraum(verbraucher, zeitraum.id)}
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                  >
                                    –
                                  </button>
                                )}
                              </div>
                            ))}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700">Zusammenfassung</h3>
              <table className="w-full border-collapse bg-white rounded shadow">
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Gesamtbetrag Grundlast:</td>
                    <td className="p-2 text-green-600 font-semibold">{zusammenfassung.grundlast} €</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Gesamtbetrag Dynamische Verbraucher:</td>
                    <td className="p-2 text-green-600 font-semibold">{zusammenfassung.dynamisch} €</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">Gesamtkosten pro Jahr:</td>
                    <td className="p-2 text-green-600 font-bold text-lg">{zusammenfassung.gesamt} €</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700">Gesamte Eingabedaten</h3>
              <table className="w-full border-collapse bg-white rounded shadow">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left">Verbraucher</th>
                    <th className="p-2 text-left">Watt</th>
                    <th className="p-2 text-left">Kosten/Jahr (€)</th>
                    <th className="p-2 text-left">Nutzung</th>
                    <th className="p-2 text-left">Startzeit</th>
                    <th className="p-2 text-left">Endzeit</th>
                    <th className="p-2 text-left">Dauer</th>
                    <th className="p-2 text-left">E-Auto Details</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(standardVerbraucher).map((verbraucher) => (
                    <tr key={verbraucher} className="border-b">
                      <td className="p-2">{verbraucher.charAt(0).toUpperCase() + verbraucher.slice(1)}</td>
                      <td className="p-2">{verbraucherDaten[verbraucher].watt || 0} W</td>
                      <td className="p-2">{verbraucherDaten[verbraucher].kosten} €</td>
                      <td className="p-2">
                        {['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher)
                          ? '24 h/Tag'
                          : `${erweiterteEinstellungen[verbraucher].nutzung || 0} ${['herd', 'multimedia', 'licht'].includes(verbraucher) ? 'h/Tag' : 'h/Woche'}`
                        }
                      </td>
                      <td className="p-2">
                        {erweiterteEinstellungen[verbraucher].zeitraeume.map(zeitraum => (
                          <div key={zeitraum.id}>{zeitraum.startzeit || '-'}</div>
                        ))}
                      </td>
                      <td className="p-2">
                        {erweiterteEinstellungen[verbraucher].zeitraeume.map(zeitraum => (
                          <div key={zeitraum.id}>{zeitraum.endzeit || '-'}</div>
                        ))}
                      </td>
                      <td className="p-2">
                        {erweiterteEinstellungen[verbraucher].zeitraeume.map(zeitraum => (
                          <div key={zeitraum.id}>{zeitraum.dauer || 0} h</div>
                        ))}
                      </td>
                      <td className="p-2">
                        {verbraucher === 'eauto' ? (
                          <div>
                            <p>Batterie: {eAutoDaten.batterieKW || 0} kWh</p>
                            <p>Wallbox: {eAutoDaten.wallboxKW || 0} kW</p>
                            <p>Ladefrequenz: {eAutoDaten.ladefrequenz || 0} pro Woche</p>
                            <p>Standardladung: {eAutoDaten.standardLadung ? 'Ja' : 'Nein'}</p>
                            {ladezyklen.length > 0 && (
                              <div>
                                <p>Ladezyklen:</p>
                                {ladezyklen.map((zyklus) => (
                                  <p key={zyklus.id}>
                                    {zyklus.von || '-'} bis {zyklus.bis || '-'}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700">Stündlicher Verbrauch</h3>
              <div className="bg-white p-4 rounded shadow">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        );

      case 'speicher':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Speicher</h2>
            <table className="w-full border-collapse bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Speicher</th>
                  <th className="p-2 text-left">kW</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Batteriespeicher</td>
                  <td className="p-2">
                    <input
                      type="number"
                      name="batteriespeicher"
                      step="0.1"
                      min="0"
                      className="p-2 border rounded w-24"
                      aria-label="Batteriespeicher in kW"
                    />
                    <span className="ml-2">kW</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Sonstige Energiespeicher</td>
                  <td className="p-2">
                    <input
                      type="number"
                      name="sonstigeSpeicher"
                      step="0.1"
                      min="0"
                      className="p-2 border rounded w-24"
                      aria-label="Sonstige Energiespeicher in kW"
                    />
                    <span className="ml-2">kW</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'erzeuger':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Erzeuger</h2>
            <table className="w-full border-collapse bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Stromerzeugung</th>
                  <th className="p-2 text-left">kW</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Photovoltaik</td>
                  <td className="p-2">
                    <input
                      type="number"
                      name="photovoltaik"
                      step="0.1"
                      min="0"
                      className="p-2 border rounded w-24"
                      aria-label="Photovoltaik in kW"
                    />
                    <span className="ml-2">kW</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">BHKW</td>
                  <td className="p-2">
                    <input
                      type="number"
                      name="bhkw"
                      step="0.1"
                      min="0"
                      className="p-2 border rounded w-24"
                      aria-label="BHKW in kW"
                    />
                    <span className="ml-2">kW</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Wind</td>
                  <td className="p-2">
                    <input
                      type="number"
                      name="wind"
                      step="0.1"
                      min="0"
                      className="p-2 border rounded w-24"
                      aria-label="Wind in kW"
                    />
                    <span className="ml-2">kW</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Sonstige Erzeugung</td>
                  <td className="p-2">
                    <input
                      type="number"
                      name="sonstige"
                      step="0.1"
                      min="0"
                      className="p-2 border rounded w-24"
                      aria-label="Sonstige Erzeugung in kW"
                    />
                    <span className="ml-2">kW</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      default:
        return <div className="text-gray-600">Kein Inhalt ausgewählt</div>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Stromverbrauch Rechner</h1>
      <div className="navigation sticky top-0 bg-white shadow p-4 rounded flex justify-center gap-2 mb-6 z-10">
        <button
          onClick={ladeAllgemein}
          className={`px-4 py-2 rounded ${mode === 'allgemein' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Allgemein
        </button>
        <button
          onClick={ladeDetails}
          className={`px-4 py-2 rounded ${mode === 'details' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Details
        </button>
        <button
          onClick={ladeSpeicher}
          className={`px-4 py-2 rounded ${mode === 'speicher' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Speicher
        </button>
        <button
          onClick={ladeErzeuger}
          className={`px-4 py-2 rounded ${mode === 'erzeuger' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Erzeuger
        </button>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}

export default App;