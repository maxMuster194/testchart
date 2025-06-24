
import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registriere Chart.js-Komponenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Standardverbraucher und Beschreibungen
const standardVerbraucher = {
  Kühlschrank: 120,
  Gefrierschrank: 200,
  Aquarium: 50,
  Waschmaschine: 1200,
  Geschirrspüler: 600,
  Trockner: 3500,
  Herd: 2000,
  Multimedia: 350,
  Licht: 60,
  Batterie: 3000,
};

const verbraucherBeschreibungen = {
  Kühlschrank: "Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W.",
  Gefrierschrank: "Der Gefrierschrank benötigt etwa 200 W für Langzeitlagerung.",
  Aquarium: "Ein Aquarium verbraucht ca. 50 W, abhängig von Größe und Ausstattung.",
  Waschmaschine: "Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (1,37h/Woche).",
  Geschirrspüler: "Der Geschirrspüler benötigt ca. 600 W pro Spülgang (1,27h/Woche).",
  Trockner: "Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (1,37h/Woche).",
  Herd: "Der Herd benötigt etwa 2000 W bei 1 Stunde täglicher Nutzung.",
  Multimedia: "Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.",
  Licht: "Beleuchtung verbraucht etwa 60 W bei 5 Stunden täglicher Nutzung.",
  Batterie: "E-Auto-Ladung verbraucht ca. 3000 W, abhängig von Batterie und Wallbox.",
};

// Zeitoptionen für Dropdowns
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
});

export default function Home() {
  const [strompreis, setStrompreis] = useState(0.30);
  const [plz, setPlz] = useState('');
  const [verbraucherDaten, setVerbraucherDaten] = useState(
    Object.keys(standardVerbraucher).reduce((acc, key) => ({
      ...acc,
      [key]: { watt: 0, checked: false, kosten: 0 },
    }), {})
  );
  const [erweiterteEinstellungen, setErweiterteEinstellungen] = useState(
    Object.keys(standardVerbraucher).reduce((acc, key) => {
      let startzeit, endzeit, dauer, nutzung;
      switch (key.toLowerCase()) {
        case 'waschmaschine':
          startzeit = '10:00';
          endzeit = '11:30';
          dauer = 1.37;
          nutzung = 2;
          break;
        case 'trockner':
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
        default:
          startzeit = '08:00';
          endzeit = '10:00';
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
  const [showErweiterteOptionen, setShowErweiterteOptionen] = useState({});
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
  const [openMenus, setOpenMenus] = useState({
    stromerzeuger: true,
    stromspeicher: true,
    grundlastverbraucher: true,
    dynamischeverbraucher: true,
    elektroauto: true,
  });
  const [newOptionNames, setNewOptionNames] = useState({});
  const [newOptionWatt, setNewOptionWatt] = useState({});
  const [showNewOptionForm, setShowNewOptionForm] = useState({});
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);
  const [menus, setMenus] = useState([
    {
      id: 'stromerzeuger',
      label: 'Stromerzeuger',
      options: [
        { name: 'Photovoltaik', specifications: 'Leistung: 5-20 kWp, Effizienz: ~20%, Lebensdauer: ~25 Jahre' },
        { name: 'Windrad', specifications: 'Leistung: 2-10 kW, Windgeschwindigkeit: 3-25 m/s' },
        { name: 'Sonstige', specifications: 'Individuelle Stromerzeugung, z.B. Wasserkraft' },
      ],
    },
    {
      id: 'stromspeicher',
      label: 'Stromspeicher',
      options: [
        { name: 'Batterie', specifications: 'Kapazität: 2-10 kWh, Typ: Lithium-Ionen, Zyklen: ~6000' },
        { name: 'Sonstige', specifications: 'Individuelle Speicherlösungen, z.B. Redox-Flow' },
      ],
    },
    {
      id: 'grundlastverbraucher',
      label: 'Grundlastverbraucher',
      options: [
        { name: 'Kühlschrank', specifications: 'Leistung: 100-200 W, Energieeffizienz: A+++, Betrieb: 24/7' },
        { name: 'Gefrierschrank', specifications: 'Leistung: 150-300 W, Energieeffizienz: A++, Betrieb: 24/7' },
        { name: 'Aquarium', specifications: 'Leistung: 50 W, Betrieb: 24/7' },
      ],
    },
    {
      id: 'dynamischeverbraucher',
      label: 'Dynamische Verbraucher',
      options: [
        { name: 'Waschmaschine', specifications: 'Leistung: 2-3 kW, Betrieb: 1-2h pro Zyklus, Energieeffizienz: A+++' },
        { name: 'Trockner', specifications: 'Leistung: 2-4 kW, Betrieb: 1-3h pro Zyklus, Energieeffizienz: A++' },
        { name: 'Herd', specifications: 'Leistung: 3-7 kW, Betrieb: variabel, Typ: Induktion/Elektro' },
        { name: 'Geschirrspüler', specifications: 'Leistung: 1-2 kW, Betrieb: 1-3h pro Zyklus, Energieeffizienz: A+++' },
        { name: 'Multimedia', specifications: 'Leistung: 0.1-1 kW, Betrieb: variabel, z.B. TV, Computer' },
        { name: 'Licht', specifications: 'Leistung: 0.01-0.1 kW, Typ: LED, Betrieb: variabel' },
      ],
    },
    {
      id: 'elektroauto',
      label: 'Elektroauto',
      options: [
        { name: 'Batterie', specifications: 'Kapazität: 40-100 kWh, Typ: Lithium-Ionen, Reichweite: 200-500 km' },
      ],
    },
  ]);

  const getStrompreis = () => strompreis;

  const updateKosten = (watt, verbraucher) => {
    const strompreis = getStrompreis();
    let kosten = 0;
    switch (verbraucher.toLowerCase()) {
      case 'waschmaschine':
        kosten = (watt * 2 * 52) / 1000 * strompreis;
        break;
      case 'geschirrspüler':
        kosten = (watt * 7 * 52) / 1000 * strompreis;
        break;
      case 'trockner':
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
      case 'batterie':
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

  const onCheckboxChange = (verbraucher, checked, menuId) => {
    const watt = checked ? standardVerbraucher[verbraucher] || 0 : 0;
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], watt, checked },
    }));
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'batterie'].includes(verbraucher.toLowerCase());
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
    if (['waschmaschine', 'geschirrspüler', 'trockner'].includes(verbraucher.toLowerCase())) {
      kosten = (watt * totalDauer * 52) / 1000 * strompreis;
    } else if (['herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase())) {
      kosten = (watt * totalDauer * 365) / 1000 * strompreis;
    } else if (verbraucher.toLowerCase() === 'batterie') {
      kosten = (watt * totalDauer) / 1000 * strompreis;
    }
    return kosten;
  };

  const updateZusammenfassung = () => {
    let grundlast = 0;
    let dynamisch = 0;
    Object.keys(standardVerbraucher).forEach((key) => {
      if (key.toLowerCase() === 'batterie') return;
      const kosten = parseFloat(verbraucherDaten[key]?.kosten) || 0;
      if (['kühlschrank', 'gefrierschrank', 'aquarium'].includes(key.toLowerCase())) {
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
      isNaN(batterieKW) || batterieKW <= 0 ||
      isNaN(wallboxKW) || wallboxKW <= 0 ||
      isNaN(ladefrequenz) || ladefrequenz <= 0 ||
      isNaN(strompreis) || strompreis <= 0
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
      Batterie: {
        ...prev.Batterie,
        kosten: jahreskosten !== '–' ? parseFloat(jahreskosten).toFixed(2) : '0.00',
      },
    }));
  };

  const toggleLadezyklen = () => setShowLadezyklen((prev) => !prev);

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
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'batterie'].includes(verbraucher.toLowerCase());
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
      }
    }));
    setError('');
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase());
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
          id: Date.now() + Math.random(),
          startzeit: '08:00',
          endzeit: '10:00',
          dauer: prev[verbraucher].zeitraeume[0]?.dauer || 0
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
          zeitraeume: zeitraeume.filter((zeitraum) => zeitraum.id !== zeitraumId)
        }
      };
    });
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase());
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
    const newStrompreis = parseFloat(value) || 0.30;
    if (newStrompreis < 0) {
      setError('Strompreis darf nicht negativ sein.');
      return;
    }
    setStrompreis(newStrompreis);
    setError('');
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        if (verbraucher.toLowerCase() === 'batterie') {
          eAutoKosten();
        } else if (['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase())) {
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
      const watt = verbraucherDaten[verbraucher]?.watt || 0;
      if (watt <= 0) return;
      const isGrundlast = ['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher.toLowerCase());
      const einstellung = erweiterteEinstellungen[verbraucher];
      if (isGrundlast) {
        for (let i = 0; i < 24; i++) {
          stunden[i] += watt / 1000;
        }
      } else if (verbraucher.toLowerCase() === 'batterie') {
        ladezyklen.forEach(zyklus => {
          const startzeit = zyklus.von;
          const endzeit = zyklus.bis;
          if (startzeit && endzeit) {
            let startStunde = parseInt(startzeit.split(':')[0]);
            let endStunde = parseInt(endzeit.split(':')[0]);
            if (endStunde < startStunde) endStunde += 24;
            for (let i = startStunde; i <= endStunde && i < 24; i++) {
              stunden[i % 24] += watt / 1000;
            }
          }
        });
      } else {
        einstellung?.zeitraeume.forEach(zeitraum => {
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

  const berechneWattVerbraucher = () => {
    const labels = [];
    const grundlastData = [];
    const dynamischData = [];
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked && watt > 0) {
        labels.push(verbraucher);
        if (['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher.toLowerCase())) {
          grundlastData.push(watt / 1000);
          dynamischData.push(0);
        } else {
          grundlastData.push(0);
          dynamischData.push(watt / 1000);
        }
      }
    });
    return { labels, grundlastData, dynamischData };
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
      legend: { position: 'top' },
      title: { display: true, text: 'Stündlicher Stromverbrauch (kW)' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Verbrauch (kW)' } },
      x: { title: { display: true, text: 'Uhrzeit' } },
    },
  };

  const wattChartData = {
    labels: berechneWattVerbraucher().labels,
    datasets: [
      {
        label: 'Grundlastverbraucher (kW)',
        data: berechneWattVerbraucher().grundlastData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Dynamische Verbraucher (kW)',
        data: berechneWattVerbraucher().dynamischData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const wattChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Wattleistung der Verbraucher (kW)' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Leistung (kW)' } },
      x: { title: { display: true, text: 'Verbraucher' } },
    },
  };

  const handleNewOptionName = (menuId, value) => {
    setNewOptionNames((prev) => ({ ...prev, [menuId]: value }));
  };

  const handleNewOptionWatt = (menuId, value) => {
    setNewOptionWatt((prev) => ({ ...prev, [menuId]: value }));
  };

  const toggleNewOptionForm = (menuId) => {
    setShowNewOptionForm((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const addNewOption = (menuId) => {
    const name = newOptionNames[menuId]?.trim();
    const watt = parseFloat(newOptionWatt[menuId]) || 100;
    if (name && !isNaN(watt) && watt > 0) {
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === menuId
            ? { ...menu, options: [...menu.options, { name, specifications: `Leistung: ${watt} W` }] }
            : menu
        )
      );
      standardVerbraucher[name] = watt;
      setVerbraucherDaten((prev) => ({
        ...prev,
        [name]: { watt: 0, checked: false, kosten: 0 },
      }));
      setErweiterteEinstellungen((prev) => ({
        ...prev,
        [name]: {
          nutzung: 0,
          zeitraeume: [{ id: Date.now() + Math.random(), startzeit: '08:00', endzeit: '10:00', dauer: 0 }],
        },
      }));
      verbraucherBeschreibungen[name] = `Benutzerdefinierter Verbraucher mit ${watt} W.`;
      setNewOptionNames((prev) => ({ ...prev, [menuId]: '' }));
      setNewOptionWatt((prev) => ({ ...prev, [menuId]: '' }));
      setShowNewOptionForm((prev) => ({ ...prev, [menuId]: false }));
    } else {
      setError('Bitte geben Sie einen gültigen Namen und Wattleistung ein.');
    }
  };

  const handleDeleteOptionClick = (menuId, optionName) => {
    setDeleteConfirmOption({ menuId, optionName });
  };

  const confirmDeleteOption = (menuId, optionName) => {
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId
          ? { ...menu, options: menu.options.filter((opt) => opt.name !== optionName) }
          : menu
      )
    );
    setVerbraucherDaten((prev) => {
      const newData = { ...prev };
      delete newData[optionName];
      return newData;
    });
    setErweiterteEinstellungen((prev) => {
      const newSettings = { ...prev };
      delete newSettings[optionName];
      return newSettings;
    });
    delete standardVerbraucher[optionName];
    delete verbraucherBeschreibungen[optionName];
    setDeleteConfirmOption(null);
    updateZusammenfassung();
  };

  const cancelDeleteOption = () => {
    setDeleteConfirmOption(null);
  };

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const toggleErweiterteOptionen = (menuId, option) => {
    setShowErweiterteOptionen((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: !prev[menuId]?.[option] },
    }));
  };

  useEffect(() => {
    updateZusammenfassung();
    eAutoKosten();
  }, [verbraucherDaten, erweiterteEinstellungen, eAutoDaten]);

  return (
    <div className="container mx-auto p-6 max-w-5xl bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Stromverbrauch Rechner</h1>
      {error && <div className="text-red-500 p-4 bg-red-100 rounded mb-4">{error}</div>}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label htmlFor="strompreis" className="block text-sm font-medium text-gray-700">Strompreis (€/kWh)</label>
            <input
              type="number"
              id="strompreis"
              value={strompreis}
              step="0.01"
              min="0"
              onChange={(e) => handleStrompreisChange(e.target.value)}
              className="mt-1 p-2 border rounded w-full max-w-xs focus:ring-2 focus:ring-green-600"
              aria-label="Strompreis in € pro kWh"
            />
          </div>
          <div>
            <label htmlFor="plz" className="block text-sm font-medium text-gray-700">Postleitzahl (PLZ)</label>
            <input
              type="text"
              id="plz"
              placeholder="z.B. 80331"
              value={plz}
              onChange={(e) => setPlz(e.target.value)}
              className="mt-1 p-2 border rounded w-full max-w-xs focus:ring-2 focus:ring-green-600"
              aria-label="Postleitzahl"
            />
          </div>
        </div>

        {menus.map((menu) => (
          <div key={menu.id} className="bg-white rounded-lg shadow">
            <div
              className="bg-green-800 text-white p-4 flex justify-between items-center cursor-pointer rounded-t-lg hover:bg-green-900"
              onClick={() => toggleMenu(menu.id)}
            >
              <span className="text-lg font-semibold">{menu.label}</span>
              <span className={`transform transition-transform ${openMenus[menu.id] ? 'rotate-180' : ''}`}>▼</span>
            </div>
            {openMenus[menu.id] && (
              <div className="p-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Auswahl</th>
                      <th className="p-2 text-left">Info</th>
                      <th className="p-2 text-left">Watt</th>
                      {menu.id === 'elektroauto' && <th className="p-2 text-left">Ladefrequenz/Woche</th>}
                      {menu.id === 'elektroauto' && <th className="p-2 text-left">Standardladung</th>}
                      {menu.id === 'dynamischeverbraucher' && <th className="p-2 text-left">Einstellungen</th>}
                      <th className="p-2 text-left">Kosten/Jahr</th>
                      <th className="p-2 text-left">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.options.map((option) => (
                      <tr key={option.name} className="border-b">
                        <td className="p-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={verbraucherDaten[option.name]?.checked || false}
                              onChange={(e) => onCheckboxChange(option.name, e.target.checked, menu.id)}
                              className="h-4 w-4 text-green-600 focus:ring-green-600"
                              aria-label={`Standardwert für ${option.name} aktivieren`}
                            />
                            <span className="ml-2">{option.name}</span>
                          </label>
                        </td>
                        <td className="p-2">
                          <span className="relative group">
                            <span className="inline-block w-5 h-5 bg-green-600 text-white rounded-full text-center text-xs cursor-pointer">ℹ</span>
                            <span className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity w-48">
                              {option.specifications}
                            </span>
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={verbraucherDaten[option.name]?.watt || ''}
                            placeholder="Watt"
                            onChange={(e) => handleWattChange(option.name, e.target.value)}
                            className="p-2 border rounded w-20 focus:ring-2 focus:ring-green-600"
                            aria-label={`Wattleistung für ${option.name}`}
                          />
                        </td>
                        {menu.id === 'elektroauto' && (
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="z.B. 3"
                              min="1"
                              value={eAutoDaten.ladefrequenz || ''}
                              onChange={(e) => handleEAutoChange('ladefrequenz', e.target.value)}
                              className="p-2 border rounded w-20 focus:ring-2 focus:ring-green-600"
                              aria-label="Ladefrequenz pro Woche"
                            />
                          </td>
                        )}
                        {menu.id === 'elektroauto' && (
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={eAutoDaten.standardLadung}
                              onChange={(e) => handleEAutoChange('standardLadung', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-600"
                              aria-label="Standardladung für E-Auto"
                            />
                          </td>
                        )}
                        {menu.id === 'dynamischeverbraucher' && (
                          <td className="p-2">
                            <button
                              onClick={() => toggleErweiterteOptionen(menu.id, option.name)}
                              className="w-5 h-5 bg-green-600 text-white rounded-full text-center text-xs"
                            >
                              ⚙
                            </button>
                          </td>
                        )}
                        <td className="p-2">{verbraucherDaten[option.name]?.kosten || '0.00'} €</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Löschen
                          </button>
                        </td>
                      </tr>
                    ))}
                    {menu.options.map((option) => (
                      showErweiterteOptionen[menu.id]?.[option.name] && menu.id === 'dynamischeverbraucher' && (
                        <tr key={`${option.name}-einstellungen`} className="border-b">
                          <td colSpan="8" className="p-4">
                            <div className="mt-4 p-4 bg-green-50 border border-green-600 rounded">
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    <th className="p-2 text-left">Nutzung</th>
                                    <th className="p-2 text-left">Startzeit</th>
                                    <th className="p-2 text-left">Endzeit</th>
                                    <th className="p-2 text-left">Dauer (h)</th>
                                    <th className="p-2 text-left">Aktion</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {erweiterteEinstellungen[option.name]?.zeitraeume.map(zeitraum => (
                                    <tr key={zeitraum.id}>
                                      <td className="p-2">
                                        <input
                                          type="number"
                                          value={erweiterteEinstellungen[option.name].nutzung || 0}
                                          onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, zeitraum.id)}
                                          className="p-2 border rounded w-20 focus:ring-2 focus:ring-green-600"
                                          aria-label={`Nutzung für ${option.name}`}
                                        />
                                      </td>
                                      <td className="p-2">
                                        <select
                                          value={zeitraum.startzeit}
                                          onChange={(e) => handleErweiterteEinstellungChange(option.name, 'startzeit', e.target.value, zeitraum.id)}
                                          className="p-2 border rounded focus:ring-2 focus:ring-green-600"
                                          aria-label={`Startzeit für ${option.name}`}
                                        >
                                          <option value="">Startzeit wählen</option>
                                          {timeOptions.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="p-2">
                                        <select
                                          value={zeitraum.endzeit}
                                          onChange={(e) => handleErweiterteEinstellungChange(option.name, 'endzeit', e.target.value, zeitraum.id)}
                                          className="p-2 border rounded focus:ring-2 focus:ring-green-600"
                                          aria-label={`Endzeit für ${option.name}`}
                                        >
                                          <option value="">Endzeit wählen</option>
                                          {timeOptions.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="p-2">
                                        <input
                                          type="number"
                                          value={zeitraum.dauer || 0}
                                          onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                          className="p-2 border rounded w-20 focus:ring-2 focus:ring-green-600"
                                          aria-label={`Dauer für ${option.name}`}
                                        />
                                      </td>
                                      <td className="p-2 flex gap-2">
                                        <button
                                          onClick={() => addZeitraum(option.name)}
                                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                          +
                                        </button>
                                        {erweiterteEinstellungen[option.name].zeitraeume.length > 1 && (
                                          <button
                                            onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                          >
                                            –
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                    {deleteConfirmOption?.menuId === menu.id && (
                      <tr>
                        <td colSpan="8" className="p-4">
                          <div className="mt-4 p-4 bg-red-100 border border-red-600 rounded flex items-center gap-4">
                            <span>Option "{deleteConfirmOption.optionName}" wirklich löschen?</span>
                            <button
                              onClick={() => confirmDeleteOption(menu.id, deleteConfirmOption.optionName)}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Ja
                            </button>
                            <button
                              onClick={cancelDeleteOption}
                              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Nein
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {showNewOptionForm[menu.id] && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    <input
                      type="text"
                      placeholder="Neuer Option Name"
                      value={newOptionNames[menu.id] || ''}
                      onChange={(e) => handleNewOptionName(menu.id, e.target.value)}
                      className="p-2 border rounded w-48 focus:ring-2 focus:ring-green-600"
                    />
                    <input
                      type="number"
                      placeholder="Standard W"
                      step="1"
                      value={newOptionWatt[menu.id] || ''}
                      onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                      className="p-2 border rounded w-24 focus:ring-2 focus:ring-green-600"
                    />
                    <button
                      onClick={() => addNewOption(menu.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Speichern
                    </button>
                  </div>
                )}
                <button
                  onClick={() => toggleNewOptionForm(menu.id)}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {showNewOptionForm[menu.id] ? 'Abbrechen' : 'Neue Option hinzufügen'}
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="bg-white rounded-lg shadow">
          <h3 className="bg-green-800 text-white p-4 text-lg font-semibold rounded-t-lg">E-Auto Einstellungen</h3>
          <div className="p-4">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Batterie (kWh)</td>
                  <td className="p-2">
                    <input
                      type="number"
                      placeholder="z.B. 30"
                      value={eAutoDaten.batterieKW || ''}
                      onChange={(e) => handleEAutoChange('batterieKW', e.target.value)}
                      className="p-2 border rounded w-24 focus:ring-2 focus:ring-green-600"
                      aria-label="Batteriekapazität"
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Wallbox Leistung (kW)</td>
                  <td className="p-2">
                    <input
                      type="number"
                      placeholder="z.B. 11"
                      value={eAutoDaten.wallboxKW || ''}
                      onChange={(e) => handleEAutoChange('wallboxKW', e.target.value)}
                      className="p-2 border rounded w-24 focus:ring-2 focus:ring-green-600"
                      aria-label="Wallbox-Leistung"
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Jährliche Ladekosten (€)</td>
                  <td className="p-2 text-green-600 font-semibold">{eAutoDaten.jahreskosten} €</td>
                </tr>
                <tr>
                  <td colSpan="2" className="p-2">
                    <button
                      onClick={toggleLadezyklen}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
                              className="p-2 border rounded focus:ring-2 focus:ring-green-600"
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
                              className="p-2 border rounded focus:ring-2 focus:ring-green-600"
                              aria-label="Endzeit des Ladezyklus"
                            >
                              <option value="">Endzeit wählen</option>
                              {timeOptions.map((time) => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                            <button
                              onClick={addLadezyklus}
                              className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeLadezyklus(zyklus.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <h3 className="bg-green-800 text-white p-4 text-lg font-semibold rounded-t-lg">Zusammenfassung Verbraucher</h3>
          <div className="p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Grundlastverbraucher</h4>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Verbraucher</th>
                  <th className="p-2 text-left">Watt</th>
                  <th className="p-2 text-left">Kosten/Jahr (€)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(verbraucherDaten)
                  .filter((key) => ['kühlschrank', 'gefrierschrank', 'aquarium'].includes(key.toLowerCase()))
                  .map((verbraucher) => (
                    <tr key={verbraucher} className="border-b">
                      <td className="p-2">{verbraucher}</td>
                      <td className="p-2">{verbraucherDaten[verbraucher].watt || 0} W</td>
                      <td className="p-2">{verbraucherDaten[verbraucher].kosten || '0.00'} €</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Dynamische Verbraucher</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Verbraucher</th>
                  <th className="p-2 text-left">Watt</th>
                  <th className="p-2 text-left">Kosten/Jahr (€)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(verbraucherDaten)
                  .filter((key) => !['kühlschrank', 'gefrierschrank', 'aquarium'].includes(key.toLowerCase()))
                  .map((verbraucher) => (
                    <tr key={verbraucher} className="border-b">
                      <td className="p-2">{verbraucher}</td>
                      <td className="p-2">{verbraucherDaten[verbraucher].watt || 0} W</td>
                      <td className="p-2">{verbraucherDaten[verbraucher].kosten || '0.00'} €</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <h3 className="bg-green-800 text-white p-4 text-lg font-semibold rounded-t-lg">Zusammenfassung Kosten</h3>
          <div className="p-4">
            <table className="w-full border-collapse">
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
        </div>

        <div className="bg-white rounded-lg shadow">
          <h3 className="bg-green-800 text-white p-4 text-lg font-semibold rounded-t-lg">Gesamte Eingabedaten</h3>
          <div className="p-4">
            <table className="w-full border-collapse">
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
                {Object.keys(verbraucherDaten).map((verbraucher) => (
                  <tr key={verbraucher} className="border-b">
                    <td className="p-2">{verbraucher}</td>
                    <td className="p-2">{verbraucherDaten[verbraucher].watt || 0} W</td>
                    <td className="p-2">{verbraucherDaten[verbraucher].kosten || '0.00'} €</td>
                    <td className="p-2">
                      {['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher.toLowerCase())
                        ? '24 h/Tag'
                        : `${erweiterteEinstellungen[verbraucher]?.nutzung || 0} ${['herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase()) ? 'h/Tag' : 'h/Woche'}`
                      }
                    </td>
                    <td className="p-2">
                      {verbraucher.toLowerCase() === 'batterie'
                        ? ladezyklen.map(zyklus => (
                            <div key={zyklus.id}>{zyklus.von || '-'}</div>
                          ))
                        : erweiterteEinstellungen[verbraucher]?.zeitraeume.map(zeitraum => (
                            <div key={zeitraum.id}>{zeitraum.startzeit || '-'}</div>
                          ))
                      }
                    </td>
                    <td className="p-2">
                      {verbraucher.toLowerCase() === 'batterie'
                        ? ladezyklen.map(zyklus => (
                            <div key={zyklus.id}>{zyklus.bis || '-'}</div>
                          ))
                        : erweiterteEinstellungen[verbraucher]?.zeitraeume.map(zeitraum => (
                            <div key={zeitraum.id}>{zeitraum.endzeit || '-'}</div>
                          ))
                      }
                    </td>
                    <td className="p-2">
                      {verbraucher.toLowerCase() === 'batterie'
                        ? ladezyklen.map(zyklus => (
                            <div key={zyklus.id}>-</div>
                          ))
                        : erweiterteEinstellungen[verbraucher]?.zeitraeume.map(zeitraum => (
                            <div key={zeitraum.id}>{zeitraum.dauer || '0'} h</div>
                          ))
                      }
                    </td>
                    <td className="p-2">
                      {verbraucher.toLowerCase() === 'batterie'
                        ? `Batterie: ${eAutoDaten.batterieKW || 0} kWh, Wallbox: ${eAutoDaten.wallboxKW || 0} kW, Frequenz: ${eAutoDaten.ladefrequenz || 0}/Woche`
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <h3 className="bg-green-800 text-white p-4 text-lg font-semibold rounded-t-lg">Wattleistung der Verbraucher</h3>
          <div className="p-4">
            <Bar data={wattChartData} options={wattChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <h3 className="bg-green-800 text-white p-4 text-lg font-semibold rounded-t-lg">Stündlicher Stromverbrauch</h3>
          <div className="p-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
