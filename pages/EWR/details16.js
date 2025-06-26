'use client';

import { useState, useEffect } from 'react';
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Default consumer data and descriptions
const standardVerbrauch = {
  Kühlschrank: 120,
  Gefrierschrank: 200,
  Aquarium: 50,
  Waschmaschine: 1200,
  Geschirrspüler: 600,
  Trockner: 3500,
  Herd: 700,
  Multimedia: 350,
  Licht: 175,
  EAuto: 11000, // 11 kW (typische Ladeleistung einer Wallbox)
  ZweitesEAuto: 7400, // 7.4 kW (z.B. langsamere Wallbox oder anderes Fahrzeug)
};

const verbraucherBeschreibungen = {
  Kühlschrank: 'Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W.',
  Gefrierschrank: 'Der Gefrierschrank benötigt etwa 200 W für Langzeitlagerung.',
  Aquarium: 'Ein Aquarium verbraucht ca. 50 W, abhängig von Größe und Ausstattung.',
  Waschmaschine: 'Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (1,37h/Woche).',
  Geschirrspüler: 'Der Geschirrspüler benötigt ca. 600 W pro Spülgang (1,27h/Woche).',
  Trockner: 'Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (1,37h/Woche).',
  Herd: 'Der Herd benötigt etwa 700 W bei 1 Stunde täglicher Nutzung.',
  Multimedia: 'Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.',
  Licht: 'Beleuchtung verbraucht etwa 175 W bei 5 Stunden täglicher Nutzung.',
  EAuto: 'Das E-Auto verbraucht ca. 11 kW pro Ladevorgang (z.B. 4h/Woche).',
  ZweitesEAuto: 'Das zweite E-Auto verbraucht ca. 7.4 kW pro Ladevorgang (z.B. 3h/Woche).',
};

const timePeriods = [
  { label: 'Früh', startzeit: '06:00', endzeit: '08:00' },
  { label: 'Vormittag', startzeit: '08:00', endzeit: '12:00' },
  { label: 'Mittag', startzeit: '12:00', endzeit: '14:00' },
  { label: 'Nachmittag', startzeit: '14:00', endzeit: '18:00' },
  { label: 'Abend', startzeit: '18:00', endzeit: '22:00' },
  { label: 'Nacht', startzeit: '22:00', endzeit: '06:00' },
];

// Functions
const getStrompreis = (strompreis) => strompreis;

const updateKosten = (watt, verbraucher, strompreis, setVerbraucherDaten, erweiterteEinstellungen) => {
  let kosten = 0;
  const einstellung = erweiterteEinstellungen[verbraucher];
  const totalDauer = einstellung?.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  const nutzung = einstellung?.nutzung || 0;
  const batterieKapazitaet = einstellung?.batterieKapazitaet || 0;
  const wallboxLeistung = einstellung?.wallboxLeistung || watt;
  const standardLadung = einstellung?.standardLadung || false;

  switch (verbraucher.toLowerCase()) {
    case 'waschmaschine':
    case 'geschirrspüler':
    case 'trockner':
      kosten = (watt * totalDauer * nutzung * 52) / 1000 * strompreis;
      break;
    case 'eauto':
    case 'zweiteseauto':
      if (standardLadung) {
        kosten = (batterieKapazitaet * nutzung * 52) / 1000 * strompreis;
      } else {
        kosten = (wallboxLeistung * totalDauer * nutzung * 52) / 1000 * strompreis;
      }
      break;
    case 'herd':
    case 'multimedia':
    case 'licht':
      kosten = (watt * totalDauer * nutzung * 365) / 1000 * strompreis;
      break;
    default:
      kosten = (watt * strompreis * 24 * 365) / 1000;
  }
  setVerbraucherDaten((prev) => ({
    ...prev,
    [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
  }));
};

const berechneDynamischenVerbrauch = (watt, verbraucher, strompreis, erweiterteEinstellungen) => {
  const einstellung = erweiterteEinstellungen[verbraucher];
  if (!einstellung || einstellung.zeitraeume.length === 0 || watt === 0) return 0;
  let totalDauer = 0;
  einstellung.zeitraeume.forEach(zeitraum => {
    const dauer = parseFloat(zeitraum.dauer) || 0;
    totalDauer += dauer;
  });
  if (totalDauer === 0) return 0;
  let kosten = 0;
  const batterieKapazitaet = einstellung?.batterieKapazitaet || 0;
  const wallboxLeistung = einstellung?.wallboxLeistung || watt;
  const standardLadung = einstellung?.standardLadung || false;

  if (['waschmaschine', 'geschirrspüler', 'trockner'].includes(verbraucher.toLowerCase())) {
    kosten = (watt * totalDauer * einstellung.nutzung * 52) / 1000 * strompreis;
  } else if (['eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase())) {
    if (standardLadung) {
      kosten = (batterieKapazitaet * einstellung.nutzung * 52) / 1000 * strompreis;
    } else {
      kosten = (wallboxLeistung * totalDauer * einstellung.nutzung * 52) / 1000 * strompreis;
    }
  } else if (['herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase())) {
    kosten = (watt * totalDauer * einstellung.nutzung * 365) / 1000 * strompreis;
  }
  return kosten;
};

const calculateTotalWattage = (verbraucherDaten) => {
  return Object.keys(verbraucherDaten).reduce((total, verbraucher) => {
    const watt = parseFloat(verbraucherDaten[verbraucher].watt) || 0;
    return total + watt;
  }, 0).toFixed(2);
};

const updateZusammenfassung = (verbraucherDaten, setZusammenfassung) => {
  let grundlast = 0;
  let dynamisch = 0;
  Object.keys(standardVerbrauch).forEach((key) => {
    const kosten = parseFloat(verbraucherDaten[key]?.kosten) || 0;
    if (['kühlschrank', 'gefrierschrank', 'aquarium'].includes(key.toLowerCase())) {
      grundlast += kosten;
    } else {
      dynamisch += kosten;
    }
  });
  const totalWattage = calculateTotalWattage(verbraucherDaten);
  setZusammenfassung({
    grundlast: grundlast.toFixed(2),
    dynamisch: dynamisch.toFixed(2),
    gesamt: (grundlast + dynamisch).toFixed(2),
    totalWattage,
  });
};

const berechneStundenVerbrauch = (verbraucherDaten, erweiterteEinstellungen) => {
  const stunden = Array(24).fill(0).map(() => ({ total: 0, verbraucher: [] }));
  Object.keys(standardVerbrauch).forEach((verbraucher) => {
    const einstellung = erweiterteEinstellungen[verbraucher];
    const watt = einstellung?.standardLadung && ['eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase())
      ? einstellung.batterieKapazitaet / einstellung.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0)
      : verbraucherDaten[verbraucher]?.watt || 0;
    if (watt <= 0) return;
    const isGrundlast = ['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher.toLowerCase());
    if (isGrundlast) {
      for (let i = 0; i < 24; i++) {
        stunden[i].total += watt / 1000;
        stunden[i].verbraucher.push(verbraucher);
      }
    } else {
      einstellung?.zeitraeume.forEach(zeitraum => {
        const startzeit = zeitraum.startzeit;
        const endzeit = zeitraum.endzeit;
        if (startzeit && endzeit) {
          let startStunde = parseInt(startzeit.split(':')[0]);
          let endStunde = parseInt(endzeit.split(':')[0]);
          if (endStunde < startStunde) endStunde += 24;
          for (let i = startStunde; i < endStunde && i < 24; i++) {
            stunden[i % 24].total += watt / 1000;
            stunden[i % 24].verbraucher.push(verbraucher);
          }
        }
      });
    }
  });
  return stunden;
};

// Home Component
export default function Home() {
  const [strompreis, setStrompreis] = useState(0.30);
  const [plz, setPlz] = useState('');
  const [verbraucherDaten, setVerbraucherDaten] = useState(
    Object.keys(standardVerbrauch).reduce((acc, key) => ({
      ...acc,
      [key]: { watt: 0, checked: false, kosten: 0 },
    }), {})
  );
  const [erweiterteEinstellungen, setErweiterteEinstellungen] = useState(
    Object.keys(standardVerbrauch).reduce((acc, key) => {
      let startzeit, endzeit, dauer, nutzung, batterieKapazitaet, wallboxLeistung, standardLadung;
      switch (key.toLowerCase()) {
        case 'waschmaschine':
          startzeit = '10:00';
          endzeit = '11:30';
          dauer = 1;
          nutzung = 2;
          break;
        case 'trockner':
          startzeit = '14:00';
          endzeit = '15:30';
          dauer = 1;
          nutzung = 2;
          break;
        case 'geschirrspüler':
          startzeit = '18:40';
          endzeit = '19:50';
          dauer = 1;
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
          endzeit = '21:00';
          dauer = 3.0;
          nutzung = 3;
          break;
        case 'licht':
          startzeit = '18:00';
          endzeit = '23:00';
          dauer = 5.0;
          nutzung = 3;
          break;
        case 'eauto':
          startzeit = '22:00';
          endzeit = '02:00';
          dauer = 4.0;
          nutzung = 3;
          batterieKapazitaet = 60; // kWh
          wallboxLeistung = 11000; // W
          standardLadung = false;
          break;
        case 'zweiteseauto':
          startzeit = '23:00';
          endzeit = '02:00';
          dauer = 3.0;
          nutzung = 2;
          batterieKapazitaet = 40; // kWh
          wallboxLeistung = 7400; // W
          standardLadung = false;
          break;
        default:
          startzeit = '06:00';
          endzeit = '08:00';
          dauer = 0;
          nutzung = 0;
      }
      return {
        ...acc,
        [key]: {
          nutzung,
          zeitraeume: [{ id: Date.now() + Math.random(), startzeit, endzeit, dauer }],
          ...(key.toLowerCase() === 'eauto' || key.toLowerCase() === 'zweiteseauto'
            ? { batterieKapazitaet, wallboxLeistung, standardLadung }
            : {}),
        },
      };
    }, {})
  );
  const [showErweiterteOptionen, setShowErweiterteOptionen] = useState({});
  const [zusammenfassung, setZusammenfassung] = useState({
    grundlast: 0,
    dynamisch: 0,
    gesamt: 0,
    totalWattage: 0,
  });
  const [error, setError] = useState('');
  const [openMenus, setOpenMenus] = useState({
    stromerzeuger: false,
    grundlastverbraucher: false,
    dynamischeverbraucher: false,
    eauto: false,
    strompeicher: false,
  });
  const [newOptionNames, setNewOptionNames] = useState({});
  const [newOptionWatt, setNewOptionWatt] = useState({});
  const [showNewOptionForm, setShowNewOptionForm] = useState({});
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

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
        { name: 'Herd', specifications: 'Leistung: 0.7 kW, Betrieb: variabel, Typ: Induktion/Elektro' },
        { name: 'Geschirrspüler', specifications: 'Leistung: 1-2 kW, Betrieb: 1-3h pro Zyklus, Energieeffizienz: A+++' },
        { name: 'Multimedia', specifications: 'Leistung: 0.1-1 kW, Betrieb: variabel, z.B. TV, Computer' },
        { name: 'Licht', specifications: 'Leistung: 0.01-0.1 kW, Typ: LED, Betrieb: variabel' },
      ],
    },
    {
      id: 'eauto',
      label: 'E-Auto',
      options: [
        { name: 'EAuto', specifications: 'Leistung: 11 kW, Betrieb: variabel, z.B. Laden über Wallbox' },
        { name: 'ZweitesEAuto', specifications: 'Leistung: 7.4 kW, Betrieb: variabel, z.B. langsamere Wallbox' },
      ],
    },
    {
      id: 'strompeicher',
      label: 'Strompeicher',
      options: [
        { name: 'Lithium-Ionen', specifications: 'Leistung: 500 W, Kapazität: 5 kWh' },
        { name: 'Blei-Säure', specifications: 'Leistung: 300 W, Kapazität: 3 kWh' },
      ],
    },
  ]);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toInputDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const fromInputDate = (inputDate) => {
    const [year, month, day] = inputDate.split('-');
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
          setApiData([]);
          setApiLoading(false);
          return;
        }

        setApiData(germanyData);
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
        setError('Fehler beim Laden der dynamischen Strompreise.');
      } finally {
        setApiLoading(false);
      }
    };

    fetchData();
  }, []);

  const onCheckboxChange = (verbraucher, checked, menuId) => {
    const watt = checked ? standardVerbrauch[verbraucher] || 0 : 0;
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], watt, checked },
    }));
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
    if (checked) {
      if (isDynamisch) {
        const kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, erweiterteEinstellungen);
        setVerbraucherDaten((prev) => ({
          ...prev,
          [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
        }));
      } else {
        updateKosten(watt, verbraucher, strompreis, setVerbraucherDaten, erweiterteEinstellungen);
      }
    } else {
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: 0 },
      }));
    }
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
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
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
    if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(watt, verbraucher, strompreis, erweiterteEinstellungen);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
    } else {
      updateKosten(watt, verbraucher, strompreis, setVerbraucherDaten, erweiterteEinstellungen);
    }
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const handleErweiterteEinstellungChange = (verbraucher, field, value, zeitraumId) => {
    const parsedValue = field === 'nutzung' || field === 'dauer' || field === 'batterieKapazitaet' || field === 'wallboxLeistung'
      ? parseFloat(value) || 0
      : field === 'standardLadung'
      ? value === 'true'
      : value;
    if ((field === 'nutzung' || field === 'dauer' || field === 'batterieKapazitaet' || field === 'wallboxLeistung') && parsedValue < 0) {
      setError(`Wert für ${field} bei ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: {
        ...prev[verbraucher],
        [field === 'nutzung' || field === 'batterieKapazitaet' || field === 'wallboxLeistung' || field === 'standardLadung'
          ? field
          : 'zeitraeume']: field === 'nutzung' || field === 'batterieKapazitaet' || field === 'wallboxLeistung' || field === 'standardLadung'
          ? parsedValue
          : prev[verbraucher].zeitraeume.map(zeitraum =>
              zeitraum.id === zeitraumId ? { ...zeitraum, [field]: parsedValue } : zeitraum
            ),
      },
    }));
    setError('');
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
    if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, erweiterteEinstellungen);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
      updateZusammenfassung(verbraucherDaten, setZusammenfassung);
    }
  };

  const handleTimePeriodChange = (verbraucher, periodLabel, zeitraumId) => {
    const period = timePeriods.find(p => p.label === periodLabel);
    if (period) {
      setErweiterteEinstellungen((prev) => ({
        ...prev,
        [verbraucher]: {
          ...prev[verbraucher],
          zeitraeume: prev[verbraucher].zeitraeume.map(zeitraum =>
            zeitraum.id === zeitraumId ? { ...zeitraum, startzeit: period.startzeit, endzeit: period.endzeit } : zeitraum
          ),
        },
      }));
      const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
      if (isDynamisch) {
        const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, erweiterteEinstellungen);
        setVerbraucherDaten((prev) => ({
          ...prev,
          [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
        }));
        updateZusammenfassung(verbraucherDaten, setZusammenfassung);
      }
    }
  };

  const addZeitraum = (verbraucher) => {
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: {
        ...prev[verbraucher],
        zeitraeume: [...prev[verbraucher].zeitraeume, {
          id: Date.now() + Math.random(),
          startzeit: '06:00',
          endzeit: '08:00',
          dauer: prev[verbraucher].zeitraeume[0].dauer || 0,
        }],
      },
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
          zeitraeume: zeitraeume.filter((zeitraum) => zeitraum.id !== zeitraumId),
        },
      };
    });
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());
    if (isDynamisch) {
      const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, erweiterteEinstellungen);
      setVerbraucherDaten((prev) => ({
        ...prev,
        [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
      }));
      updateZusammenfassung(verbraucherDaten, setZusammenfassung);
    }
  };

  const handleStrompreisChange = (value) => {
    const newStrompreis = parseFloat(value) || 0;
    if (newStrompreis < 0) {
      setError('Strompreis darf nicht negativ sein.');
      return;
    }
    setStrompreis(newStrompreis);
    setError('');
    Object.keys(verbraucherDaten).forEach((verbraucher) => {
      const { watt, checked } = verbraucherDaten[verbraucher];
      if (checked || watt > 0) {
        if (isDynamisch(verbraucher)) {
          const kosten = berechneDynamischenVerbrauch(watt, verbraucher, newStrompreis, erweiterteEinstellungen);
          setVerbraucherDaten((prev) => ({
            ...prev,
            [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
          }));
        } else {
          updateKosten(watt, verbraucher, newStrompreis, setVerbraucherDaten, erweiterteEinstellungen);
        }
      }
    });
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const isDynamisch = (verbraucher) => ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht', 'eauto', 'zweiteseauto'].includes(verbraucher.toLowerCase());

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
      if (menuId === 'grundlastverbraucher' || menuId === 'dynamischeverbraucher' || menuId === 'eauto') {
        standardVerbrauch[name] = watt;
        setVerbraucherDaten((prev) => ({
          ...prev,
          [name]: { watt: 0, checked: false, kosten: 0 },
        }));
        setErweiterteEinstellungen((prev) => ({
          ...prev,
          [name]: {
            nutzung: 0,
            zeitraeume: [{ id: Date.now() + Math.random(), startzeit: '06:00', endzeit: '08:00', dauer: 0 }],
            ...(menuId === 'eauto' ? { batterieKapazitaet: 40, wallboxLeistung: watt, standardLadung: false } : {}),
          },
        }));
        verbraucherBeschreibungen[name] = `Benutzerdefinierter Verbraucher mit ${watt} W.`;
      }
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
    if (menuId === 'grundlastverbraucher' || menuId === 'dynamischeverbraucher' || menuId === 'eauto') {
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
      delete standardVerbrauch[optionName];
      delete verbraucherBeschreibungen[optionName];
    }
    setDeleteConfirmOption(null);
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
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
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  }, [verbraucherDaten, erweiterteEinstellungen]);

  // Chart data for hourly consumption (kW) and dynamic price
  const hourlyData = berechneStundenVerbrauch(verbraucherDaten, erweiterteEinstellungen);
  const selectedIndex = apiData.findIndex((entry) => {
    const dateKey = Object.keys(entry).find((key) => key.includes('Prices - EPEX'));
    return dateKey && entry[dateKey] === selectedDate;
  });
  const labelsAll = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const rawValuesAll = selectedIndex !== -1 ? apiData[selectedIndex]?.__parsed_extra?.slice(0, 24) : [];
  const chartDataApi = labelsAll
    .map((label, i) => ({ label: label, value: rawValuesAll[i], index: i }))
    .filter((entry) => entry.value != null);
  const chartConvertedValues = chartDataApi.map((entry) => 
    typeof entry.value === 'number' ? entry.value * 0.1 / 100 : parseFloat(entry.value) * 0.1 / 100 || strompreis
  );

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Stromverbrauch (kW)',
        data: hourlyData.map(d => d.total),
        fill: false,
        borderColor: '#05A696',
        backgroundColor: '#05A696',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: `Dynamischer Preis am ${selectedDate || 'N/A'} (€/kWh)`,
        data: chartConvertedValues,
        fill: false,
        borderColor: '#D9043D',
        backgroundColor: '#D9043D',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#333' } },
      title: { display: true, text: 'Stündlicher Stromverbrauch und Preis', color: '#333', font: { size: 11.2 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            if (context.dataset.label.includes('Dynamischer Preis')) {
              return `Preis: ${context.raw.toFixed(2)} €/kWh`;
            }
            const verbraucherList = hourlyData[index].verbraucher.join(', ');
            return `Verbrauch: ${context.raw} kW\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Verbrauch (kW)', color: '#333' },
        ticks: { color: '#333' },
        position: 'left',
      },
      y1: {
        beginAtZero: true,
        title: { display: true, text: 'Preis (€/kWh)', color: '#333' },
        ticks: { color: '#333' },
        position: 'right',
        grid: { drawOnChartArea: false },
      },
      x: { title: { display: true, text: 'Uhrzeit', color: '#333' }, ticks: { color: '#333' } },
    },
  };

  const chartDataKosten = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: `Kosten (Dynamischer Tarif) am ${selectedDate || 'N/A'} (€)`,
        data: hourlyData.map((d, i) => {
          const price = chartConvertedValues[i] != null ? chartConvertedValues[i] : strompreis;
          return (d.total * price).toFixed(2);
        }),
        fill: false,
        borderColor: '#D9043D',
        backgroundColor: '#D9043D',
        tension: 0.1,
      },
      {
        label: `Kosten (Fester Tarif) am ${selectedDate || 'N/A'} (€)`,
        data: hourlyData.map((d) => (d.total * strompreis).toFixed(2)),
        fill: false,
        borderColor: '#05A696',
        backgroundColor: '#05A696',
        tension: 0.1,
      },
    ],
  };

  const chartOptionsKosten = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#333' } },
      title: { 
        display: true, 
        text: `Stündliche Stromkosten (${selectedDate || 'Fallback-Preis'})`, 
        color: '#333', 
        font: { size: 11.2 } 
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const datasetLabel = context.dataset.label;
            const isDynamic = datasetLabel.includes('Dynamischer Tarif');
            const price = isDynamic ? (chartConvertedValues[index] != null ? chartConvertedValues[index] : strompreis) : strompreis;
            const verbraucherList = hourlyData[index].verbraucher.join(', ');
            return `${datasetLabel.split(' am')[0]}: ${context.raw} €\nPreis: ${(price * 100).toFixed(2)} ct/kWh\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
          },
        },
      },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'Kosten (€)', color: '#333' }, 
        ticks: { color: '#333' } 
      },
      x: { 
        title: { display: true, text: 'Uhrzeit', color: '#333' }, 
        ticks: { color: '#333' } 
      },
    },
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background-color: #f3f4f6;
        }

        .app-container {
          min-height: 100vh;
          padding: 20px 4cm;
          box-sizing: border-box;
        }

        .container {
          display: flex;
          gap: 28px;
          justify-content: center;
          flex-wrap: nowrap;
        }

        .calculation-report {
          width: 560px;
          background-color: white;
          padding: 16.8px;
          border-radius: 5.6px;
          box-shadow: 0 0.7px 2.1px rgba(0, 0, 0, 0.1), 0 0.7px 1.4px rgba(0, 0, 0, 0.06);
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .report-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 11.2px;
          color: #05A696;
        }

        .report-content p {
          color: #4b5563;
        }

        .diagrams-container {
          width: 560px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .diagram {
          background-color: white;
          padding: 16.8px;
          border-radius: 5.6px;
          box-shadow: 0 0.7px 2.1px rgba(0, 0, 0, 0.1), 0 0.7px 1.4px rgba(0, 0, 0, 0.06);
          box-sizing: border-box;
        }

        .diagram-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 11.2px;
          color: #05A696;
        }

        .chart-container {
          width: 526px;
          height: 420px;
          margin: 0 auto;
        }

        .input-container-html {
          margin-bottom: 14px;
        }

        .input-container-html label {
          display: block;
          margin-bottom: 5.6px;
          font-weight: bold;
          color: #333;
        }

        .input-container-html input,
        .input-container-html select {
          padding: 8.4px;
          width: 100%;
          max-width: 154px;
          border: 0.7px solid #ddd;
          border-radius: 4.2px;
          font-size: 11.2px;
        }

        .input-container-html input:focus,
        .input-container-html select:focus {
          border-color: #05A696;
          box-shadow: 0 0 3.5px rgba(67, 114, 183, 0.3);
          outline: none;
        }

        .menu {
          margin-bottom: 10.5px;
          background-color: #fff;
          border-radius: 5.6px;
          overflow: hidden;
          box-shadow: 0 1.4px 5.6px rgba(0, 0, 0, 0.08);
        }

        .menu-header {
          background-color: #05A696;
          color: white;
          padding: 10.5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.6px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .menu-header:hover {
          background-color: #05A696;
        }

        .menu-content {
          padding: 14px;
          background-color: #f9f9f9;
        }

        .triangle {
          transition: transform 0.3s;
          font-size: 9.8px;
        }

        .triangle.open {
          transform: rotate(180deg);
        }

        .triangle.closed {
          transform: rotate(90deg);
        }

        .checkbox-group {
          margin-bottom: 10.5px;
          list-style: none;
          padding: 0;
        }

        .checkbox-group-header {
          display: flex;
          align-items: center;
          font-weight: bold;
          color: #333;
          padding: 7px;
          background-color: #f0f0f0;
          border-bottom: 0.7px solid #ddd;
        }

        .checkbox-group-header span {
          flex: 1;
          text-align: center;
        }

        .checkbox-group-header span.dynamischeverbraucher-extra {
          flex: 0.8;
        }

        .checkbox-group li {
          display: flex;
          align-items: center;
          padding: 7px;
          border-bottom: 0.7px solid #eee;
          transition: background-color 0.2s;
        }

        .checkbox-group li:hover {
          background-color: #f0f0f0;
        }

        .checkbox-group-label {
          display: flex;
          align-items: center;
          font-size: 11.2px;
          color: #333;
          cursor: pointer;
          flex: 1;
          min-width: 105px;
        }

        .checkbox-group input[type="checkbox"] {
          appearance: none;
          width: 12.6px;
          height: 12.6px;
          border: 1.4px solid #05A696;
          border-radius: 2.8px;
          margin-right: 7px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s, border-color 0.2s;
        }

        .checkbox-group input[type="checkbox"]:checked {
          background-color: #05A696;
          border-color: #05A696;
        }

        .checkbox-group input[type="checkbox"]:checked::after {
          content: '✔';
          color: white;
          font-size: 8.4px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .checkbox-group input[type="checkbox"]:hover {
          border-color: #05A696;
        }

        .info-field {
          width: 56px;
          font-size: 9.8px;
          text-align: center;
          flex: 1;
          position: relative;
          cursor: pointer;
        }

        .info-field::before {
          content: 'ℹ';
          display: inline-block;
          width: 14px;
          height: 14px;
          line-height: 14px;
          background-color: #05A696;
          color: white;
          border-radius: 50%;
          font-size: 8.4px;
          text-align: center;
          vertical-align: middle;
        }

        .info-field:hover .tooltip {
          visibility: visible;
          opacity: 1;
        }

        .info-field .tooltip {
          visibility: hidden;
          opacity: 0;
          background-color: #333;
          color: white;
          text-align: left;
          padding: 7px;
          border-radius: 4.2px;
          position: absolute;
          z-index: 1;
          top: -7px;
          left: 100%;
          transform: translateY(-50%);
          width: 140px;
          font-size: 8.4px;
          transition: opacity 0.3s;
        }

        .info-field .tooltip::before {
          content: '';
          position: absolute;
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          border: 4.2px solid transparent;
          border-right-color: #333;
        }

        .settings-field {
          width: 56px;
          font-size: 9.8px;
          text-align: center;
          flex: 0.8;
          cursor: pointer;
          padding: 4.2px 8.4px;
          background-color: #05A696;
          color: white;
          border: none;
          border-radius: 4.2px;
          transition: background-color 0.3s;
        }

        .settings-field:hover {
          background-color: #05A696;
        }

        .settings-field::before {
          content: '⚙️';
          display: inline-block;
          width: 14px;
          height: 14px;
          line-height: 14px;
          font-size: 11.2px;
          text-align: center;
          vertical-align: middle;
        }

        .input-group {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .watt-input {
          padding: 5.6px;
          width: 56px;
          border: 0.7px solid #ddd;
          border-radius: 4.2px;
          font-size: 9.8px;
          text-align: center;
          transition: border-color 0.3s;
        }

        .watt-input:focus {
          border-color: #05A696;
          outline: none;
        }

        .settings-container {
          margin-top: 7px;
          padding: 10.5px;
          background-color: #e6f3e6;
          border: 0.7px solid #05A696;
          border-radius: 4.2px;
          display: flex;
          flex-direction: column;
          gap: 10.5px;
          width: 100%;
        }

        .settings-input {
          padding: 5.6px;
          width: 70px;
          border: 0.7px solid #ddd;
          border-radius: 4.2px;
          font-size: 9.8px;
          text-align: center;
          transition: border-color 0.3s;
        }

        .settings-input:focus {
          border-color: #05A696;
          outline: none;
        }

        .radio-group-settings {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
        }

        .radio-group-settings label {
          display: flex;
          align-items: center;
          font-size: 9.8px;
          color: #333;
          cursor: pointer;
        }

        .radio-group-settings input[type="radio"] {
          appearance: none;
          width: 11.2px;
          height: 11.2px;
          border: 1.4px solid #05A696;
          border-radius: 50%;
          margin-right: 5.6px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s, border-color 0.2s;
        }

        .radio-group-settings input[type="radio"]:checked {
          background-color: #05A696;
          border-color: #05A696;
        }

        .radio-group-settings input[type="radio"]:checked::after {
          content: '';
          width: 5.6px;
          height: 5.6px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .radio-group-settings input[type="radio"]:hover {
          border-color: #05A696;
        }

        .price-display {
          width: 56px;
          font-size: 9.8px;
          color: #333;
          text-align: center;
          flex: 1;
        }

        .delete-option-button {
          padding: 4.2px 8.4px;
          background-color: #a00;
          color: white;
          border: none;
          border-radius: 4.2px;
          cursor: pointer;
          font-size: 9.8px;
          flex: 1;
          text-align: center;
          max-width: 56px;
        }

        .delete-option-button:hover {
          background-color: #c00;
        }

        .new-option-container {
          margin-top: 10.5px;
          padding-top: 10.5px;
          border-top: 0.7px solid #eee;
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          align-items: center;
        }

        .new-option-input {
          padding: 5.6px;
          width: 140px;
          border: 0.7px solid #ddd;
          border-radius: 2.8px;
          font-size: 9.8px;
        }

        .new-option-input:focus {
          border-color: #05A696;
          outline: none;
        }

        .new-option-watt {
          padding: 5.6px;
          width: 70px;
          border: 0.7px solid #ddd;
          border-radius: 4.2px;
          font-size: 9.8px;
          text-align: center;
        }

        .new-option-watt:focus {
          border-color: #05A696;
          outline: none;
        }

        .add-option-button,
        .save-option-button {
          padding: 7px 14px;
          background-color: #05A696;
          color: white;
          border: none;
          border-radius: 4.2px;
          cursor: pointer;
          font-size: 9.8px;
          transition: background-color 0.3s;
        }

        .add-option-button:hover,
        .save-option-button:hover {
          background-color: #05A696;
        }

        .confirm-dialog {
          margin-top: 7px;
          padding: 10.5px;
          background-color: #ffe6e6;
          border: 0.7px solid #a00;
          border-radius: 4.2px;
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .confirm-button {
          padding: 4.2px 8.4px;
          background-color: #a00;
          color: white;
          border: none;
          border-radius: 4.2px;
          cursor: pointer;
        }

        .confirm-button:hover {
          background-color: #c00;
        }

        .cancel-button {
          padding: 4.2px 8.4px;
          background-color: #666;
          color: white;
          border: none;
          border-radius: 2.8px;
          cursor: pointer;
        }

        .cancel-button:hover {
          background-color: #777;
        }

        .date-picker-container {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .date-picker-label {
          font-size: 0.63rem;
          font-weight: 500;
          color: #05A696;
        }

        .date-picker {
          padding: 0.35rem;
          border: 0.7px solid #dfe6e9;
          border-radius: 4.2px;
          font-size: 0.63rem;
          background-color: #fff;
          box-shadow: inset 0 0.7px 2.1px rgba(0,0,0,0.05);
          cursor: pointer;
        }

        .loading {
          font-size: 0.7rem;
          color: #7f8c8d;
          text-align: center;
          padding: 0.7rem;
        }

        .no-data {
          font-size: 0.7rem;
          color: #e74c3c;
          text-align: center;
          padding: 0.7rem;
        }

        .summary-container {
          margin-top: 14px;
          padding: 10.5px;
          background-color: #f9f9f9;
          border-radius: 4.2px;
          border: 0.7px solid #ddd;
        }

        .summary-title {
          font-size: 0.84rem;
          font-weight: 600;
          margin-bottom: 7px;
          color: #05A696;
        }

        .summary-item {
          margin-bottom: 5.6px;
          font-size: 0.7rem;
          color: #333;
        }
      `}</style>
      <div className="app-container">
        <div className="container">
          {/* Linker Bereich: Rechenbericht */}
          <div className="calculation-report">
            <h2 className="report-title">Rechenbericht</h2>
            <div className="report-content">
              <div className="input-container-html">
                <label htmlFor="strompreis">Strompreis (€/kWh):</label>
                <input
                  type="number"
                  id="strompreis"
                  value={strompreis}
                  onChange={(e) => handleStrompreisChange(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="input-container-html">
                <label htmlFor="plz">Postleitzahl:</label>
                <input
                  type="text"
                  id="plz"
                  value={plz}
                  onChange={(e) => setPlz(e.target.value)}
                  placeholder="z.B. 10115"
                />
              </div>
              <div className="input-container-html date-picker-container">
                <label className="date-picker-label" htmlFor="date-picker">Datum für dynamischen Preis:</label>
                <select
                  id="date-picker"
                  className="date-picker"
                  value={selectedDate ? toInputDate(selectedDate) : ''}
                  onChange={(e) => setSelectedDate(fromInputDate(e.target.value))}
                >
                  {availableDates.length === 0 ? (
                    <option value="">Kein Datum verfügbar</option>
                  ) : (
                    availableDates.map((date) => (
                      <option key={date} value={toInputDate(date)}>
                        {date}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {apiLoading && <div className="loading">Lade dynamische Strompreise...</div>}
              {!apiLoading && availableDates.length === 0 && (
                <div className="no-data">Keine Daten für dynamische Strompreise verfügbar.</div>
              )}
              {error && <div className="no-data">{error}</div>}

              {menus.map((menu) => (
                <div key={menu.id} className="menu">
                  <div className="menu-header" onClick={() => toggleMenu(menu.id)}>
                    <span>{menu.label}</span>
                    <span className={`triangle ${openMenus[menu.id] ? 'open' : 'closed'}`}>▼</span>
                  </div>
                  {openMenus[menu.id] && (
                    <div className="menu-content">
                      <ul className="checkbox-group">
                        <li className="checkbox-group-header">
                          <span>Verbraucher</span>
                          <span>Info</span>
                          <span>Wattleistung</span>
                          <span>Kosten</span>
                          {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && <span className="dynamischeverbraucher-extra">Einstellungen</span>}
                          <span>Löschen</span>
                        </li>
                        {menu.options.map((option) => (
                          <li key={option.name}>
                            <label className="checkbox-group-label">
                              <input
                                type="checkbox"
                                checked={verbraucherDaten[option.name]?.checked || false}
                                onChange={(e) => onCheckboxChange(option.name, e.target.checked, menu.id)}
                              />
                              {option.name}
                            </label>
                            <div className="info-field">
                              <span className="tooltip">{verbraucherBeschreibungen[option.name] || option.specifications}</span>
                            </div>
                            <div className="input-group">
                              <input
                                type="number"
                                className="watt-input"
                                value={verbraucherDaten[option.name]?.watt || ''}
                                onChange={(e) => handleWattChange(option.name, e.target.value)}
                                min="0"
                                placeholder="Watt"
                              />
                            </div>
                            <div className="price-display">
                              {verbraucherDaten[option.name]?.kosten || '0.00'} €
                            </div>
                            {(menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && (
                              <button
                                className="settings-field"
                                onClick={() => toggleErweiterteOptionen(menu.id, option.name)}
                              >
                                Einstellungen
                              </button>
                            )}
                            <button
                              className="delete-option-button"
                              onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                            >
                              Löschen
                            </button>
                            {deleteConfirmOption?.menuId === menu.id && deleteConfirmOption?.optionName === option.name && (
                              <div className="confirm-dialog">
                                <span>{`Möchten Sie "${option.name}" wirklich löschen?`}</span>
                                <button className="confirm-button" onClick={() => confirmDeleteOption(menu.id, option.name)}>
                                  Ja
                                </button>
                                <button className="cancel-button" onClick={cancelDeleteOption}>
                                  Nein
                                </button>
                              </div>
                            )}
                            {showErweiterteOptionen[menu.id]?.[option.name] && (menu.id === 'dynamischeverbraucher' || menu.id === 'eauto') && (
                              <div className="settings-container">
                                {menu.id === 'eauto' ? (
                                  <>
                                    <label>
                                      Batteriekapazität (kWh):
                                      <input
                                        type="number"
                                        className="settings-input"
                                        value={erweiterteEinstellungen[option.name].batterieKapazitaet}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'batterieKapazitaet', e.target.value, null)}
                                        min="0"
                                        step="0.1"
                                      />
                                    </label>
                                    <label>
                                      Wallbox-Leistung (W):
                                      <input
                                        type="number"
                                        className="settings-input"
                                        value={erweiterteEinstellungen[option.name].wallboxLeistung}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'wallboxLeistung', e.target.value, null)}
                                        min="0"
                                        step="100"
                                      />
                                    </label>
                                    <label>
                                      Standardladung:
                                      <div className="radio-group-settings">
                                        <label>
                                          <input
                                            type="radio"
                                            name={`standardLadung-${option.name}`}
                                            value={true}
                                            checked={erweiterteEinstellungen[option.name].standardLadung === true}
                                            onChange={(e) => handleErweiterteEinstellungChange(option.name, 'standardLadung', e.target.value, null)}
                                          />
                                          Ja
                                        </label>
                                        <label>
                                          <input
                                            type="radio"
                                            name={`standardLadung-${option.name}`}
                                            value={false}
                                            checked={erweiterteEinstellungen[option.name].standardLadung === false}
                                            onChange={(e) => handleErweiterteEinstellungChange(option.name, 'standardLadung', e.target.value, null)}
                                          />
                                          Nein
                                        </label>
                                      </div>
                                    </label>
                                    <label>
                                      Ladehäufigkeit (pro Woche):
                                      <input
                                        type="number"
                                        className="settings-input"
                                        value={erweiterteEinstellungen[option.name].nutzung}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, null)}
                                        min="0"
                                        step="1"
                                      />
                                    </label>
                                    {!erweiterteEinstellungen[option.name].standardLadung && (
                                      erweiterteEinstellungen[option.name].zeitraeume.map((zeitraum, index) => (
                                        <div key={zeitraum.id} style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '7px' }}>
                                          <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                                            <label>
                                              Zeitraum:
                                              <select
                                                value={timePeriods.find(p => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit)?.label || ''}
                                                onChange={(e) => handleTimePeriodChange(option.name, e.target.value, zeitraum.id)}
                                              >
                                                {timePeriods.map((period) => (
                                                  <option key={period.label} value={period.label}>
                                                    {period.label}
                                                  </option>
                                                ))}
                                              </select>
                                            </label>
                                            <label>
                                              Dauer (h):
                                              <input
                                                type="number"
                                                className="settings-input"
                                                value={zeitraum.dauer}
                                                onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                                min="0"
                                                step="0.1"
                                              />
                                            </label>
                                            {index > 0 && (
                                              <button
                                                className="delete-option-button"
                                                onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                              >
                                                Zeitraum löschen
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                    {!erweiterteEinstellungen[option.name].standardLadung && (
                                      <button
                                        className="add-option-button"
                                        onClick={() => addZeitraum(option.name)}
                                      >
                                        Zeitraum hinzufügen
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {erweiterteEinstellungen[option.name].zeitraeume.map((zeitraum, index) => (
                                      <div key={zeitraum.id} style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '7px' }}>
                                        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                                          <label>
                                            Zeitraum:
                                            <select
                                              value={timePeriods.find(p => p.startzeit === zeitraum.startzeit && p.endzeit === zeitraum.endzeit)?.label || ''}
                                              onChange={(e) => handleTimePeriodChange(option.name, e.target.value, zeitraum.id)}
                                            >
                                              {timePeriods.map((period) => (
                                                <option key={period.label} value={period.label}>
                                                  {period.label}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                          <label>
                                            Dauer (h):
                                            <input
                                              type="number"
                                              className="settings-input"
                                              value={zeitraum.dauer}
                                              onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                              min="0"
                                              step="0.1"
                                            />
                                          </label>
                                          {index > 0 && (
                                            <button
                                              className="delete-option-button"
                                              onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                            >
                                              Zeitraum löschen
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      className="add-option-button"
                                      onClick={() => addZeitraum(option.name)}
                                    >
                                      Zeitraum hinzufügen
                                    </button>
                                    <label>
                                      Nutzung (pro Woche):
                                      <input
                                        type="number"
                                        className="settings-input"
                                        value={erweiterteEinstellungen[option.name].nutzung}
                                        onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, null)}
                                        min="0"
                                      />
                                    </label>
                                  </>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      <button
                        className="add-option-button"
                        onClick={() => toggleNewOptionForm(menu.id)}
                      >
                        Neue Option hinzufügen
                      </button>
                      {showNewOptionForm[menu.id] && (
                        <div className="new-option-container">
                          <input
                            type="text"
                            className="new-option-input"
                            placeholder="Name der neuen Option"
                            value={newOptionNames[menu.id] || ''}
                            onChange={(e) => handleNewOptionName(menu.id, e.target.value)}
                          />
                          <input
                            type="number"
                            className="new-option-watt"
                            placeholder="Wattleistung"
                            value={newOptionWatt[menu.id] || ''}
                            onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                            min="0"
                          />
                          <button
                            className="save-option-button"
                            onClick={() => addNewOption(menu.id)}
                          >
                            Speichern
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="summary-container">
                <h3 className="summary-title">Zusammenfassung</h3>
                <div className="summary-item">Grundlast Kosten: {zusammenfassung.grundlast} €</div>
                <div className="summary-item">Dynamische Kosten: {zusammenfassung.dynamisch} €</div>
                <div className="summary-item">Gesamtkosten: {zusammenfassung.gesamt} €</div>
                <div className="summary-item">Gesamtwattage: {zusammenfassung.totalWattage} W</div>
              </div>
            </div>
          </div>

          {/* Rechter Bereich: Diagramme */}
          <div className="diagrams-container">
            <div className="diagram">
              <h3 className="diagram-title">Stromverbrauch pro Stunde</h3>
              <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
            <div className="diagram">
              <h3 className="diagram-title">Stromkosten pro Stunde</h3>
              <div className="chart-container">
                <Line data={chartDataKosten} options={chartOptionsKosten} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}