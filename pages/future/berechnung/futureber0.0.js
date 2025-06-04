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

function App() {
  const [mode, setMode] = useState('allgemein');
  const [strompreis, setStrompreis] = useState(0.32);
  const [verbraucherListe, setVerbraucherListe] = useState([
    { id: 'kühlschrank', name: 'Kühlschrank', watt: 120, isGrundlast: true, beschreibung: 'Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W.' },
    { id: 'gefrierschrank', name: 'Gefrierschrank', watt: 200, isGrundlast: true, beschreibung: 'Der Gefrierschrank benötigt etwa 200 W für Langzeitlagerung.' },
    { id: 'aquarium', name: 'Aquarium', watt: 50, isGrundlast: true, beschreibung: 'Ein Aquarium verbraucht ca. 50 W, abhängig von Größe und Ausstattung.' },
    { id: 'waschmaschine', name: 'Waschmaschine', watt: 1200, isGrundlast: false, nutzung: 2, nutzungTyp: 'weekly', beschreibung: 'Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (2h/Woche).' },
    { id: 'geschirrspüler', name: 'Geschirrspüler', watt: 600, isGrundlast: false, nutzung: 7, nutzungTyp: 'weekly', beschreibung: 'Der Geschirrspüler benötigt ca. 600 W pro Spülgang (7h/Woche).' },
    { id: 'wäschetrockner', name: 'Wäschetrockner', watt: 3500, isGrundlast: false, nutzung: 2, nutzungTyp: 'weekly', beschreibung: 'Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (2h/Woche).' },
    { id: 'herd', name: 'Herd', watt: 2000, isGrundlast: false, nutzung: 2, nutzungTyp: 'daily', beschreibung: 'Der Herd benötigt etwa 2000 W bei 2 Stunden täglicher Nutzung.' },
    { id: 'multimedia', name: 'Multimedia', watt: 350, isGrundlast: false, nutzung: 3, nutzungTyp: 'daily', beschreibung: 'Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.' },
    { id: 'licht', name: 'Licht', watt: 60, isGrundlast: false, nutzung: 3, nutzungTyp: 'daily', beschreibung: 'Beleuchtung verbraucht etwa 60 W bei 3 Stunden täglicher Nutzung.' },
    { id: 'eauto', name: 'E-Auto', watt: 3000, isGrundlast: false, nutzung: 0, nutzungTyp: 'yearly', beschreibung: 'E-Auto-Ladung verbraucht ca. 3000 W, abhängig von Batterie und Wallbox.' },
  ]);
  const [verbraucherDaten, setVerbraucherDaten] = useState(
    verbraucherListe.reduce((acc, v) => ({
      ...acc,
      [v.id]: { watt: 0, checked: false, kosten: 0 },
    }), {})
  );
  const [erweiterteEinstellungen, setErweiterteEinstellungen] = useState(
    verbraucherListe.reduce((acc, v) => ({
      ...acc,
      [v.id]: { nutzung: v.nutzung || 0, nutzungTyp: v.nutzungTyp || 'weekly', startzeit: '06:00', endzeit: '08:00' },
    }), {})
  );
  const [showErweiterteOptionen, setShowErweiterteOptionen] = useState(false);
  const [zusammenfassung, setZusammenfassung] = useState({
    grundlast: 0,
    dynamisch: 0,
    gesamt: 0,
  });
  const [ladezyklen, setLadezyklen] = useState([{ id: Date.now(), von: '', bis: '' }]);
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
  const [neuerVerbraucher, setNeuerVerbraucher] = useState({
    name: '',
    watt: '',
    isGrundlast: true,
    nutzung: '',
    nutzungTyp: 'weekly',
    beschreibung: '',
  });

  const getStrompreis = () => strompreis;

  const updateKosten = (watt, verbraucherId) => {
    const strompreis = getStrompreis();
    const verbraucher = verbraucherListe.find(v => v.id === verbraucherId);
    if (!verbraucher) return;

    let kosten = 0;
    if (verbraucher.isGrundlast) {
      kosten = (watt * strompreis * 24 * 365) / 1000;
    } else {
      const einstellung = erweiterteEinstellungen[verbraucherId];
      const nutzung = einstellung.nutzung || 0;
      switch (einstellung.nutzungTyp) {
        case 'daily':
          kosten = (watt * nutzung * 365) / 1000 * strompreis;
          break;
        case 'weekly':
          kosten = (watt * nutzung * 52) / 1000 * strompreis;
          break;
        case 'yearly':
          kosten = (watt * nutzung) / 1000 * strompreis;
          break;
        default:
          kosten = 0;
      }
    }

    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucherId]: { ...prev[verbraucherId], kosten: kosten.toFixed(2) },
    }));
  };

  const onCheckboxChange = (verbraucherId, checked) => {
    const verbraucher = verbraucherListe.find(v => v.id === verbraucherId);
    const watt = checked ? verbraucher.watt || 0 : 0;
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucherId]: { ...prev[verbraucherId], watt, checked, kosten: 0 },
    }));
    if (checked) {
      updateKosten(watt, verbraucherId);
    }
    updateZusammenfassung();
  };

  const berechneDynamischenVerbrauch = (watt, verbraucherId) => {
    const strompreis = getStrompreis();
    const einstellung = erweiterteEinstellungen[verbraucherId];

    if (!einstellung || einstellung.nutzung === 0) return 0;

    let kosten = 0;
    switch (einstellung.nutzungTyp) {
      case 'daily':
        kosten = (watt * einstellung.nutzung * 365) / 1000 * strompreis;
        break;
      case 'weekly':
        kosten = (watt * einstellung.nutzung * 52) / 1000 * strompreis;
        break;
      case 'yearly':
        kosten = (watt * einstellung.nutzung) / 1000 * strompreis;
        break;
      default:
        kosten = 0;
    }

    return kosten;
  };

  const updateZusammenfassung = () => {
    let grundlast = 0;
    let dynamisch = 0;

    verbraucherListe.forEach((verbraucher) => {
      if (verbraucher.id === 'eauto') return;

      const kosten = parseFloat(verbraucherDaten[verbraucher.id]?.kosten) || 0;
      if (verbraucher.isGrundlast) {
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
    const { batterieKW, ladefrequenz } = eAutoDaten;
    const strompreis = getStrompreis();

    if (
      isNaN(batterieKW) ||
      batterieKW <= 0 ||
      isNaN(ladefrequenz) ||
      ladefrequenz <= 0 ||
      isNaN(strompreis) ||
      strompreis <= 0
    ) {
      setEAutoDaten((prev) => ({ ...prev, jahreskosten: '–' }));
      setError('Bitte geben Sie gültige Werte für Batterie und Ladefrequenz ein.');
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
    setLadezyklen((prev) => [...prev, { id: Date.now(), von: '', bis: '' }]);
  };

  const removeLadezyklus = (id) => {
    setLadezyklen((prev) => prev.filter((zyklus) => zyklus.id !== id));
  };

  const handleLadezyklusChange = (id, field, value) => {
    setLadezyklen((prev) =>
      prev.map((zyklus) => (zyklus.id === id ? { ...zyklus, [field]: value } : zyklus))
    );
  };

  const handleWattChange = (verbraucherId, value) => {
    const watt = parseFloat(value) || 0;
    if (watt < 0) {
      setError(`Wattleistung für ${verbraucherId} darf nicht negativ sein.`);
      return;
    }
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucherId]: { ...prev[verbraucherId], watt },
    }));
    setError('');

    const verbraucher = verbraucherListe.find(v => v.id === verbraucherId);
    if (verbraucherDaten[verbraucherId].checked) {
      updateKosten(watt, verbraucherId);
    } else if (!verbraucher.isGrundlast) {
      const kosten = berechneDynamischenVerbrauch(watt, verbraucherId);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucherId]: { ...prev[verbraucherId], kosten: kosten.toFixed(2) },
      }));
      updateZusammenfassung();
    } else {
      updateKosten(watt, verbraucherId);
    }
  };

  const handleErweiterteEinstellungChange = (verbraucherId, field, value) => {
    const parsedValue = field === 'nutzung' ? parseInt(value) || 0 : value;
    if (field === 'nutzung' && parsedValue < 0) {
      setError(`Nutzung für ${verbraucherId} darf nicht negativ sein.`);
      return;
    }
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucherId]: { ...prev[verbraucherId], [field]: parsedValue },
    }));
    setError('');

    const verbraucher = verbraucherListe.find(v => v.id === verbraucherId);
    if (!verbraucher.isGrundlast) {
      const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucherId].watt, verbraucherId);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucherId]: { ...prev[verbraucherId], kosten: kosten.toFixed(2) },
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

    verbraucherListe.forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher.id] || { watt: 0, checked: false };
      if (checked || watt > 0) {
        if (verbraucher.id === 'eauto') {
          eAutoKosten();
        } else if (!verbraucher.isGrundlast) {
          const kosten = berechneDynamischenVerbrauch(watt, verbraucher.id);
          setVerbraucherDaten((prev) => ({
            ...prev,
            [verbraucher.id]: { ...prev[verbraucher.id], kosten: kosten.toFixed(2) },
          }));
        } else {
          updateKosten(watt, verbraucher.id);
        }
      }
    });
    updateZusammenfassung();
  };

  const handleNeuerVerbraucherChange = (field, value) => {
    setNeuerVerbraucher((prev) => ({
      ...prev,
      [field]: field === 'isGrundlast' ? value === 'true' : value,
    }));
  };

  const addVerbraucher = () => {
    const { name, watt, isGrundlast, nutzung, nutzungTyp, beschreibung } = neuerVerbraucher;
    if (!name || !watt || parseFloat(watt) <= 0 || (!isGrundlast && !nutzung)) {
      setError('Bitte geben Sie einen gültigen Namen, Wattleistung und (für dynamische Verbraucher) Nutzung ein.');
      return;
    }
    if (verbraucherListe.some(v => v.name.toLowerCase() === name.toLowerCase())) {
      setError('Ein Verbraucher mit diesem Namen existiert bereits.');
      return;
    }

    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const newVerbraucher = { 
      id, 
      name, 
      watt: parseFloat(watt), 
      isGrundlast, 
      nutzung: isGrundlast ? 0 : parseFloat(nutzung) || 0, 
      nutzungTyp: isGrundlast ? 'yearly' : nutzungTyp, 
      beschreibung 
    };

    setVerbraucherListe((prev) => [...prev, newVerbraucher]);
    setVerbraucherDaten((prev) => ({
      ...prev,
      [id]: { watt: 0, checked: false, kosten: 0 },
    }));
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [id]: { nutzung: newVerbraucher.nutzung, nutzungTyp: newVerbraucher.nutzungTyp, startzeit: '06:00', endzeit: '08:00' },
    }));
    setNeuerVerbraucher({ name: '', watt: '', isGrundlast: true, nutzung: '', nutzungTyp: 'weekly', beschreibung: '' });
    setError('');
  };

  const removeVerbraucher = (id) => {
    if (id === 'eauto') {
      setError('E-Auto kann nicht gelöscht werden.');
      return;
    }
    setVerbraucherListe((prev) => prev.filter(v => v.id !== id));
    setVerbraucherDaten((prev) => {
      const newDaten = { ...prev };
      delete newDaten[id];
      return newDaten;
    });
    setErweiterteEinstellungen((prev) => {
      const newEinstellungen = { ...prev };
      delete newEinstellungen[id];
      return newEinstellungen;
    });
    updateZusammenfassung();
  };

  const berechneStundenVerbrauch = () => {
    const stunden = Array(24).fill(0);

    verbraucherListe.forEach((verbraucher) => {
      const watt = verbraucherDaten[verbraucher.id]?.watt || 0;
      if (watt <= 0) return;

      const einstellung = erweiterteEinstellungen[verbraucher.id];

      if (verbraucher.isGrundlast) {
        for (let i = 0; i < 24; i++) {
          stunden[i] += watt / 1000;
        }
      } else {
        const startzeit = einstellung.startzeit;
        const endzeit = einstellung.endzeit;
        if (startzeit && endzeit) {
          let startStunde = parseInt(startzeit.split(':')[0]);
          let endStunde = parseInt(endzeit.split(':')[0]);
          if (endStunde < startStunde) endStunde += 24;
          for (let i = startStunde; i <= endStunde && i < 24; i++) {
            stunden[i % 24] += watt / 1000;
          }
        }
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
              <h3 className="text-lg font-semibold text-gray-700">Neuen Verbraucher hinzufügen</h3>
              <div className="flex flex-col gap-2 mt-2 bg-white p-4 rounded shadow">
                <input
                  type="text"
                  placeholder="Name des Verbrauchers"
                  value={neuerVerbraucher.name}
                  onChange={(e) => handleNeuerVerbraucherChange('name', e.target.value)}
                  className="p-2 border rounded"
                  aria-label="Name des neuen Verbrauchers"
                />
                <input
                  type="number"
                  placeholder="Wattleistung"
                  value={neuerVerbraucher.watt}
                  onChange={(e) => handleNeuerVerbraucherChange('watt', e.target.value)}
                  className="p-2 border rounded"
                  aria-label="Wattleistung des neuen Verbrauchers"
                />
                <select
                  value={neuerVerbraucher.isGrundlast}
                  onChange={(e) => handleNeuerVerbraucherChange('isGrundlast', e.target.value)}
                  className="p-2 border rounded"
                  aria-label="Typ des Verbrauchers"
                >
                  <option value="true">Grundlast</option>
                  <option value="false">Dynamisch</option>
                </select>
                {!neuerVerbraucher.isGrundlast && (
                  <>
                    <input
                      type="number"
                      placeholder="Nutzungszeit (Stunden)"
                      value={neuerVerbraucher.nutzung}
                      onChange={(e) => handleNeuerVerbraucherChange('nutzung', e.target.value)}
                      className="p-2 border rounded"
                      aria-label="Nutzungszeit des neuen Verbrauchers"
                    />
                    <select
                      value={neuerVerbraucher.nutzungTyp}
                      onChange={(e) => handleNeuerVerbraucherChange('nutzungTyp', e.target.value)}
                      className="p-2 border rounded"
                      aria-label="Nutzungstyp des Verbrauchers"
                    >
                      <option value="daily">Täglich</option>
                      <option value="weekly">Wöchentlich</option>
                      <option value="yearly">Jährlich</option>
                    </select>
                  </>
                )}
                <textarea
                  placeholder="Beschreibung (optional)"
                  value={neuerVerbraucher.beschreibung}
                  onChange={(e) => handleNeuerVerbraucherChange('beschreibung', e.target.value)}
                  className="p-2 border rounded"
                  aria-label="Beschreibung des neuen Verbrauchers"
                />
                <button
                  onClick={addVerbraucher}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Verbraucher hinzufügen
                </button>
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
                      <th className="p-2 text-left">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verbraucherListe.filter(v => v.isGrundlast).map((verbraucher) => (
                      <tr key={verbraucher.id} className="border-b">
                        <td className="p-2">{verbraucher.name}</td>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={verbraucherDaten[verbraucher.id]?.checked || false}
                            onChange={(e) => onCheckboxChange(verbraucher.id, e.target.checked)}
                            aria-label={`Standardwert für ${verbraucher.name} aktivieren`}
                          />
                        </td>
                        <td className="p-2">
                          <span className="tooltip" aria-label={`Beschreibung für ${verbraucher.name}`}>
                            ℹ️
                            <span className="tooltiptext">{verbraucher.beschreibung}</span>
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            id={`watt-${verbraucher.id}`}
                            value={verbraucherDaten[verbraucher.id]?.watt || ''}
                            placeholder="Watt eingeben"
                            onChange={(e) => handleWattChange(verbraucher.id, e.target.value)}
                            className="p-2 border rounded w-24"
                            aria-label={`Wattleistung für ${verbraucher.name} eingeben`}
                          />
                        </td>
                        <td className="p-2">{verbraucherDaten[verbraucher.id]?.kosten || '0.00'} €</td>
                        <td className="p-2">
                          <button
                            onClick={() => removeVerbraucher(verbraucher.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Löschen
                          </button>
                        </td>
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
                      <th className="p-2 text-left">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verbraucherListe.filter(v => !v.isGrundlast && v.id !== 'eauto').map((verbraucher) => (
                      <tr key={verbraucher.id} className="border-b">
                        <td className="p-2">{verbraucher.name}</td>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={verbraucherDaten[verbraucher.id]?.checked || false}
                            onChange={(e) => onCheckboxChange(verbraucher.id, e.target.checked)}
                            aria-label={`Standardwert für ${verbraucher.name} aktivieren`}
                          />
                        </td>
                        <td className="p-2">
                          <span className="tooltip" aria-label={`Beschreibung für ${verbraucher.name}`}>
                            ℹ️
                            <span className="tooltiptext">{verbraucher.beschreibung}</span>
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            id={`watt-${verbraucher.id}`}
                            value={verbraucherDaten[verbraucher.id]?.watt || ''}
                            placeholder="Watt eingeben"
                            onChange={(e) => handleWattChange(verbraucher.id, e.target.value)}
                            className="p-2 border rounded w-24"
                            aria-label={`Wattleistung für ${verbraucher.name} eingeben`}
                          />
                        </td>
                        <td className="p-2">{verbraucherDaten[verbraucher.id]?.kosten || '0.00'} €</td>
                        <td className="p-2">
                          <button
                            onClick={() => removeVerbraucher(verbraucher.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Löschen
                          </button>
                        </td>
                      </tr>
                    ))}
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
                                <input
                                  type="time"
                                  value={zyklus.von}
                                  onChange={(e) => handleLadezyklusChange(zyklus.id, 'von', e.target.value)}
                                  className="p-2 border rounded"
                                  aria-label="Startzeit des Ladezyklus"
                                />
                                <span>bis</span>
                                <input
                                  type="time"
                                  value={zyklus.bis}
                                  onChange={(e) => handleLadezyklusChange(zyklus.id, 'bis', e.target.value)}
                                  className="p-2 border rounded"
                                  aria-label="Endzeit des Ladezyklus"
                                />
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
                      <th className="p-2 text-left">Nutzungstyp</th>
                      <th className="p-2 text-left">Startzeit</th>
                      <th className="p-2 text-left">Endzeit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verbraucherListe.filter(v => !v.isGrundlast).map((verbraucher) => (
                      <tr key={verbraucher.id} className="border-b">
                        <td className="p-2">{verbraucher.name}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={erweiterteEinstellungen[verbraucher.id]?.nutzung || 0}
                            placeholder="0"
                            onChange={(e) =>
                              handleErweiterteEinstellungChange(verbraucher.id, 'nutzung', e.target.value)
                            }
                            className="p-2 border rounded w-24"
                            aria-label={`Nutzung für ${verbraucher.name}`}
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={erweiterteEinstellungen[verbraucher.id]?.nutzungTyp || 'weekly'}
                            onChange={(e) =>
                              handleErweiterteEinstellungChange(verbraucher.id, 'nutzungTyp', e.target.value)
                            }
                            className="p-2 border rounded"
                            aria-label={`Nutzungstyp für ${verbraucher.name}`}
                          >
                            <option value="daily">Täglich</option>
                            <option value="weekly">Wöchentlich</option>
                            <option value="yearly">Jährlich</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="time"
                            value={erweiterteEinstellungen[verbraucher.id]?.startzeit || '06:00'}
                            onChange={(e) =>
                              handleErweiterteEinstellungChange(verbraucher.id, 'startzeit', e.target.value)
                            }
                            className="p-2 border rounded"
                            aria-label={`Startzeit für ${verbraucher.name}`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="time"
                            value={erweiterteEinstellungen[verbraucher.id]?.endzeit || '08:00'}
                            onChange={(e) =>
                              handleErweiterteEinstellungChange(verbraucher.id, 'endzeit', e.target.value)
                            }
                            className="p-2 border rounded"
                            aria-label={`Endzeit für ${verbraucher.name}`}
                          />
                        </td>
                      </tr>
                    ))}
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
                    <th className="p-2 text-left">Nutzungstyp</th>
                    <th className="p-2 text-left">Startzeit</th>
                    <th className="p-2 text-left">Endzeit</th>
                    <th className="p-2 text-left">E-Auto Details</th>
                  </tr>
                </thead>
                <tbody>
                  {verbraucherListe.map((verbraucher) => (
                    <tr key={verbraucher.id} className="border-b">
                      <td className="p-2">{verbraucher.name}</td>
                      <td className="p-2">{verbraucherDaten[verbraucher.id]?.watt || 0} W</td>
                      <td className="p-2">{verbraucherDaten[verbraucher.id]?.kosten || '0.00'} €</td>
                      <td className="p-2">
                        {erweiterteEinstellungen[verbraucher.id]?.nutzung || 0}{' '}
                        {erweiterteEinstellungen[verbraucher.id]?.nutzungTyp === 'daily' ? 'h/Tag' : 
                         erweiterteEinstellungen[verbraucher.id]?.nutzungTyp === 'weekly' ? 'h/Woche' : 
                         erweiterteEinstellungen[verbraucher.id]?.nutzungTyp === 'yearly' ? 'h/Jahr' : '-'}
                      </td>
                      <td className="p-2">
                        {erweiterteEinstellungen[verbraucher.id]?.nutzungTyp === 'daily' ? 'Täglich' : 
                         erweiterteEinstellungen[verbraucher.id]?.nutzungTyp === 'weekly' ? 'Wöchentlich' : 
                         erweiterteEinstellungen[verbraucher.id]?.nutzungTyp === 'yearly' ? 'Jährlich' : '-'}
                      </td>
                      <td className="p-2">{erweiterteEinstellungen[verbraucher.id]?.startzeit || '-'}</td>
                      <td className="p-2">{erweiterteEinstellungen[verbraucher.id]?.endzeit || '-'}</td>
                      <td className="p-2">
                        {verbraucher.id === 'eauto' ? (
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