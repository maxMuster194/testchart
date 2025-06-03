import React, { useState, useEffect } from 'react';

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
  waschmaschine: "Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (2h/Woche).",
  geschirrspüler: "Der Geschirrspüler benötigt ca. 600 W pro Spülgang (7h/Woche).",
  wäschetrockner: "Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (2h/Woche).",
  herd: "Der Herd benötigt etwa 2000 W bei 2 Stunden täglicher Nutzung.",
  multimedia: "Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.",
  licht: "Beleuchtung verbraucht etwa 60 W bei 3 Stunden täglicher Nutzung.",
  eauto: "E-Auto-Ladung verbraucht ca. 3000 W, abhängig von Batterie und Wallbox.",
};

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
    Object.keys(standardVerbraucher).reduce((acc, key) => ({
      ...acc,
      [key]: { nutzung: 0, startzeit: '06:00', endzeit: '08:00' },
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
      [verbraucher]: { ...prev[verbraucher], watt, checked, kosten: 0 },
    }));
    if (checked) {
      updateKosten(watt, verbraucher);
    }
    updateZusammenfassung();
  };

  const berechneDynamischenVerbrauch = (watt, verbraucher) => {
    const strompreis = getStrompreis();
    const einstellung = erweiterteEinstellungen[verbraucher];

    if (!einstellung || einstellung.nutzung === 0) return 0;

    let kosten = 0;
    if (['waschmaschine', 'geschirrspüler', 'wäschetrockner'].includes(verbraucher)) {
      kosten = (watt * einstellung.nutzung * 52) / 1000 * strompreis;
    } else if (['herd', 'multimedia', 'licht'].includes(verbraucher)) {
      kosten = (watt * einstellung.nutzung * 365) / 1000 * strompreis;
    } else if (verbraucher === 'eauto') {
      kosten = (watt * einstellung.nutzung) / 1000 * strompreis;
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
    if (verbraucherDaten[verbraucher].checked) {
      updateKosten(watt, verbraucher);
    } else if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(watt, verbraucher);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
      updateZusammenfassung();
    } else {
      updateKosten(watt, verbraucher);
    }
  };

  const handleErweiterteEinstellungChange = (verbraucher, field, value) => {
    const parsedValue = field === 'nutzung' ? parseInt(value) || 0 : value;
    if (field === 'nutzung' && parsedValue < 0) {
      setError(`Nutzung für ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], [field]: parsedValue },
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
                      <th className="p-2 text-left">Startzeit</th>
                      <th className="p-2 text-left">Endzeit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht', 'eauto'].map(
                      (verbraucher) => (
                        <tr key={verbraucher} className="border-b">
                          <td className="p-2">{verbraucher.charAt(0).toUpperCase() + verbraucher.slice(1)}</td>
                          <td className="p-2">
                            <label className="block text-sm">
                              Nutzung pro {['herd', 'multimedia', 'licht'].includes(verbraucher) ? 'Tag' : 'Woche'}:
                              <input
                                type="number"
                                value={erweiterteEinstellungen[verbraucher].nutzung}
                                placeholder="0"
                                onChange={(e) =>
                                  handleErweiterteEinstellungChange(verbraucher, 'nutzung', e.target.value)
                                }
                                className="p-2 border rounded w-24 mt-1"
                                aria-label={`Nutzung für ${verbraucher}`}
                              />
                            </label>
                          </td>
                          <td className="p-2">
                            <input
                              type="time"
                              value={erweiterteEinstellungen[verbraucher].startzeit}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(verbraucher, 'startzeit', e.target.value)
                              }
                              className="p-2 border rounded"
                              aria-label={`Startzeit für ${verbraucher}`}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="time"
                              value={erweiterteEinstellungen[verbraucher].endzeit}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(verbraucher, 'endzeit', e.target.value)
                              }
                              className="p-2 border rounded"
                              aria-label={`Endzeit für ${verbraucher}`}
                            />
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
                        {erweiterteEinstellungen[verbraucher].nutzung || 0}{' '}
                        {['herd', 'multimedia', 'licht'].includes(verbraucher) ? 'h/Tag' : 'h/Woche'}
                      </td>
                      <td className="p-2">{erweiterteEinstellungen[verbraucher].startzeit || '-'}</td>
                      <td className="p-2">{erweiterteEinstellungen[verbraucher].endzeit || '-'}</td>
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