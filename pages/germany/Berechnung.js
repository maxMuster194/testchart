import React, { useState, useEffect } from 'react';


// Standardverbraucher-Objekt (unverändert)
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
  kühlschrank: "Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W. Ideal für die Kühlung von Lebensmitteln.",
  gefrierschrank: "Der Gefrierschrank benötigt etwa 200 W und sorgt für die Langzeitlagerung von gefrorenen Produkten.",
  aquarium: "Ein Aquarium mit Pumpe und Beleuchtung verbraucht ca. 50 W, abhängig von Größe und Ausstattung.",
  waschmaschine: "Die Waschmaschine verbraucht ca. 1200 W pro Waschgang, typischerweise 2 Stunden pro Woche.",
  geschirrspüler: "Der Geschirrspüler benötigt etwa 600 W pro Spülgang, üblicherweise 7 Stunden pro Woche.",
  wäschetrockner: "Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung, etwa 2 Stunden pro Woche.",
  herd: "Der Herd benötigt etwa 2000 W und wird täglich für ca. 2 Stunden genutzt.",
  multimedia: "Multimedia-Geräte (TV, Computer) verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.",
  licht: "Beleuchtung im Haushalt verbraucht etwa 60 W bei 3 Stunden täglicher Nutzung.",
};

export default function OtherComponent() {
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
    updateZusammenfassung();
  };

  const onCheckboxChange = (verbraucher, checked) => {
    const watt = checked ? standardVerbraucher[verbraucher] || 0 : 0;
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], watt, checked, kosten: 0 },
    }));
    if (checked) {
      updateKosten(watt, verbraucher);
    } else {
      updateZusammenfassung();
    }
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

  const getErweiterteEinstellungen = () => {
    return Object.entries(erweiterteEinstellungen).map(([gerät, { nutzung, startzeit, endzeit }]) => ({
      gerät,
      nutzung,
      startzeit,
      endzeit,
    }));
  };

  const standardEAutoKosten = () => {
    const { batterieKW } = eAutoDaten;
    const strompreis = getStrompreis();

    if (isNaN(batterieKW) || batterieKW <= 0 || isNaN(strompreis) || strompreis <= 0) {
      setEAutoDaten((prev) => ({ ...prev, jahreskosten: '–' }));
      return '–';
    }

    const batterieKWh = batterieKW;
    const ladungenProJahr = 4 * 52;
    const jahreskosten = batterieKWh * ladungenProJahr * strompreis;

    setEAutoDaten((prev) => ({ ...prev, jahreskosten: jahreskosten.toFixed(2) }));
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
      return '–';
    }

    const batterieKWh = batterieKW;
    const ladungenProJahr = ladefrequenz * 52;
    const jahreskosten = batterieKWh * ladungenProJahr * strompreis;

    setEAutoDaten((prev) => ({ ...prev, jahreskosten: jahreskosten.toFixed(2) }));
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
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], watt },
    }));

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
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], [field]: value },
    }));

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
  };

  useEffect(() => {
    updateZusammenfassung();
    eAutoKosten();
  }, [strompreis, verbraucherDaten, erweiterteEinstellungen, eAutoDaten]);

  const ladeAllgemein = () => setMode('allgemein');
  const ladeDetails = () => setMode('details');
  const ladeSpeicher = () => setMode('speicher');
  const ladeErzeuger = () => setMode('erzeuger');

  const toggleErweiterteOptionen = () => setShowErweiterteOptionen(!showErweiterteOptionen);

  const renderContent = () => {
    switch (mode) {
      case 'allgemein':
        return (
          <div>
            <h2>Allgemein</h2>
            <h3>Haushalt – Standard Personen</h3>
            <div className="personen-buttons">
              {[1, 2, 3, 4, '5+'].map((anzahl) => (
                <button key={anzahl} onClick={() => console.log(`${anzahl} Person(en)`)}>
                  {anzahl} Person{anzahl === '5+' ? 'en' : ''}
                </button>
              ))}
            </div>
            <h3>Weitere Optionen</h3>
            <div className="optionen">
              {['PV-Vergleich'].map((option) => (
                <button key={option} onClick={() => console.log(option)}>
                  {option}
                </button>
              ))}
            </div>
            <h3>Lastprofile</h3>
            <div className="optionen">
              {['H0-Profil', 'H0 mit PV'].map((option) => (
                <button key={option} onClick={() => console.log(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'details':
        return (
          <div>
            <h2>Details</h2>
            <h3>Strompreis (€/kWh):</h3>
            <input
              type="number"
              id="strompreis"
              value={strompreis}
              step="0.01"
              min="0"
              onChange={(e) => setStrompreis(parseFloat(e.target.value) || 0.32)}
              aria-label="Strompreis in € pro kWh"
            />
            <span> €/kWh (Standardwert: 32 Cent)</span>

            <h3>Grundlast Verbraucher</h3>
            <table>
              <thead>
                <tr>
                  <th>Stromverbraucher</th>
                  <th>Standard</th>
                  <th>Info</th>
                  <th>Watt (eigene Eingabe möglich)</th>
                  <th>Kosten/Jahr</th>
                </tr>
              </thead>
              <tbody>
                {['kühlschrank', 'gefrierschrank', 'aquarium'].map((verbraucher) => (
                  <tr key={verbraucher}>
                    <td>{verbraucher.charAt(0).toUpperCase() + verbraucher.slice(1)}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={verbraucherDaten[verbraucher].checked}
                        onChange={(e) => onCheckboxChange(verbraucher, e.target.checked)}
                        aria-label={`Standardwert für ${verbraucher} aktivieren`}
                      />
                    </td>
                    <td>
                      <span
                        className="tooltip"
                        aria-label={`Beschreibung für ${verbraucher}`}
                      >
                        ℹ️
                        <span className="tooltiptext">{verbraucherBeschreibungen[verbraucher] || "Keine Beschreibung verfügbar"}</span>
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        id={`watt-${verbraucher}`}
                        value={verbraucherDaten[verbraucher].watt || ''}
                        placeholder="Watt eingeben"
                        onChange={(e) => handleWattChange(verbraucher, e.target.value)}
                        aria-label={`Wattleistung für ${verbraucher} eingeben`}
                      />
                    </td>
                    <td id={`kosten-${verbraucher}`}>
                      {verbraucherDaten[verbraucher].kosten} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Dynamisch Verbraucher</h3>
            <table>
              <thead>
                <tr>
                  <th>Stromverbraucher</th>
                  <th>Standard</th>
                  <th>Info</th>
                  <th>Watt (eigene Eingabe möglich)</th>
                  <th>Kosten/Jahr</th>
                </tr>
              </thead>
              <tbody>
                {['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht'].map(
                  (verbraucher) => (
                    <tr key={verbraucher}>
                      <td>{verbraucher.charAt(0).toUpperCase() + verbraucher.slice(1)}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={verbraucherDaten[verbraucher].checked}
                          onChange={(e) => onCheckboxChange(verbraucher, e.target.checked)}
                          aria-label={`Standardwert für ${verbraucher} aktivieren`}
                        />
                      </td>
                      <td>
                        <span
                          className="tooltip"
                          aria-label={`Beschreibung für ${verbraucher}`}
                        >
                          ℹ️
                          <span className="tooltiptext">{verbraucherBeschreibungen[verbraucher] || "Keine Beschreibung verfügbar"}</span>
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          id={`watt-${verbraucher}`}
                          value={verbraucherDaten[verbraucher].watt || ''}
                          placeholder="Watt eingeben"
                          onChange={(e) => handleWattChange(verbraucher, e.target.value)}
                          aria-label={`Wattleistung für ${verbraucher} eingeben`}
                        />
                      </td>
                      <td id={`kosten-${verbraucher}`}>
                        {verbraucherDaten[verbraucher].kosten} €
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <table>
              <tbody>
                <tr>
                  <td>E-Auto Batterie (kW)</td>
                  <td>
                    <input
                      type="number"
                      id="batterie-kwh"
                      placeholder="z. B. 30"
                      value={eAutoDaten.batterieKW || ''}
                      onChange={(e) => handleEAutoChange('batterieKW', e.target.value)}
                      aria-label="Batteriekapazität des E-Autos in kW"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Wallbox Leistung (kW)</td>
                  <td>
                    <input
                      type="number"
                      id="wallbox-kw"
                      placeholder="z. B. 11"
                      value={eAutoDaten.wallboxKW || ''}
                      onChange={(e) => handleEAutoChange('wallboxKW', e.target.value)}
                      aria-label="Wallbox-Leistung in kW"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Wie oft pro Woche laden?</td>
                  <td>
                    <input
                      type="number"
                      id="ladefrequenz"
                      placeholder="z. B. 3"
                      min="1"
                      value={eAutoDaten.ladefrequenz || ''}
                      onChange={(e) => handleEAutoChange('ladefrequenz', e.target.value)}
                      aria-label="Ladefrequenz pro Woche"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Standard Full</td>
                  <td>
                    <input
                      type="checkbox"
                      id="standard-full"
                      checked={eAutoDaten.standardLadung}
                      onChange={(e) => handleEAutoChange('standardLadung', e.target.checked)}
                      aria-label="Standardladung für E-Auto verwenden"
                    />
                    <label htmlFor="standard-full">Standardladung verwenden</label>
                  </td>
                </tr>
                <tr>
                  <td><strong>Jährliche Ladekosten (€)</strong></td>
                  <td>
                    <span id="jahreskosten-anzeige" className="kosten-anzeige">
                      {eAutoDaten.jahreskosten} €
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <button onClick={toggleLadezyklen}>Ladezyklen</button>
                  </td>
                </tr>
                {showLadezyklen && (
                  <tr id="ladezyklen-container">
                    <td colSpan="2">
                      <div id="ladezyklen-list">
                        {ladezyklen.map((zyklus) => (
                          <div key={zyklus.id} className="ladezyklus">
                            <input
                              type="time"
                              placeholder="Von"
                              value={zyklus.von}
                              onChange={(e) => handleLadezyklusChange(zyklus.id, 'von', e.target.value)}
                              aria-label="Startzeit des Ladezyklus"
                            />
                            <span>bis</span>
                            <input
                              type="time"
                              placeholder="Bis"
                              value={zyklus.bis}
                              onChange={(e) => handleLadezyklusChange(zyklus.id, 'bis', e.target.value)}
                              aria-label="Endzeit des Ladezyklus"
                            />
                            <button type="button" onClick={addLadezyklus}>
                              +
                            </button>
                            <button type="button" onClick={() => removeLadezyklus(zyklus.id)}>
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

            <h3>Erweiterte Einstellungen</h3>
            <button id="erweiterteOptionenButton" onClick={toggleErweiterteOptionen}>
              Erweiterte Optionen {showErweiterteOptionen ? 'ausblenden' : 'anzeigen'}
            </button>
            {showErweiterteOptionen && (
              <div id="erweiterteOptionen">
                <h3>Erweiterte Optionen</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Stromverbraucher</th>
                      <th>Nutzung</th>
                      <th>Startzeit</th>
                      <th>Endzeit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['waschmaschine', 'geschirrspüler', 'wäschetrockner', 'herd', 'multimedia', 'licht', 'eauto'].map(
                      (verbraucher) => (
                        <tr key={verbraucher} data-gerät={verbraucher}>
                          <td>{verbraucher.charAt(0).toUpperCase() + verbraucher.slice(1)}</td>
                          <td>
                            Nutzung pro {['herd', 'multimedia', 'licht'].includes(verbraucher) ? 'Tag' : 'Woche'}:
                            <input
                              type="number"
                              value={erweiterteEinstellungen[verbraucher].nutzung}
                              className="nutzung-input"
                              placeholder="0"
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(verbraucher, 'nutzung', parseInt(e.target.value) || 0)
                              }
                              aria-label={`Nutzung für ${verbraucher}`}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={erweiterteEinstellungen[verbraucher].startzeit}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(verbraucher, 'startzeit', e.target.value)
                              }
                              aria-label={`Startzeit für ${verbraucher}`}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              value={erweiterteEinstellungen[verbraucher].endzeit}
                              onChange={(e) =>
                                handleErweiterteEinstellungChange(verbraucher, 'endzeit', e.target.value)
                              }
                              aria-label={`Endzeit für ${verbraucher}`}
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <h3>Zusammenfassung</h3>
            <table>
              <tbody>
                <tr>
                  <td>Gesamtbetrag Grundlast:</td>
                  <td id="gesamtbetragGrundlast">{zusammenfassung.grundlast} €</td>
                </tr>
                <tr>
                  <td>Gesamtbetrag Dynamische Verbraucher:</td>
                  <td id="gesamtbetragDynamisch">{zusammenfassung.dynamisch} €</td>
                </tr>
                <tr>
                  <td>Gesamtkosten pro Jahr:</td>
                  <td id="gesamtKostenJahr">{zusammenfassung.gesamt} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'speicher':
        return (
          <div>
            <table border="1">
              <thead>
                <tr>
                  <th>Speicher</th>
                  <th>kW</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Batteriespeicher</td>
                  <td>
                    <input type="number" name="batteriespeicher" step="0.1" /> kW
                  </td>
                </tr>
                <tr>
                  <td>Sonstige Energiespeicher</td>
                  <td>
                    <input type="number" name="sonstigeSpeicher" step="0.1" /> kW
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'erzeuger':
        return (
          <div>
            <table border="1">
              <thead>
                <tr>
                  <th>Stromerzeugung</th>
                  <th>kW</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Photovoltaik</td>
                  <td>
                    <input type="number" name="photovoltaik" step="0.1" /> kW
                  </td>
                </tr>
                <tr>
                  <td>BHKW</td>
                  <td>
                    <input type="number" name="bhkw" step="0.1" /> kW
                  </td>
                </tr>
                <tr>
                  <td>Wind</td>
                  <td>
                    <input type="number" name="wind" step="0.1" /> kW
                  </td>
                </tr>
                <tr>
                  <td>Sonstige Erzeugung</td>
                  <td>
                    <input type="number" name="sonstige" step="0.1" /> kW
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      default:
        return <div>Kein Inhalt ausgewählt</div>;
    }
  };

  return (
    <div>
      <div className="navigation">
        <button onClick={ladeAllgemein}>Allgemein</button>
        <button onClick={ladeDetails}>Details</button>
        <button onClick={ladeSpeicher}>Speicher</button>
        <button onClick={ladeErzeuger}>Erzeuger</button>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}