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
};

const timePeriods = [
  { label: 'Früh', startzeit: '06:00', endzeit: '08:00' },
  { label: 'Vormittag', startzeit: '08:00', endzeit: '12:00' },
  { label: 'Mittag', startzeit: '12:00', endzeit: '14:00' },
  { label: 'Nachmittag', startzeit: '14:00', endzeit: '18:00' },
  { label: 'Abend', startzeit: '18:00', endzeit: '22:00' },
  { label: 'Nacht', startzeit: '22:00', endzeit: '06:00' },
];

// Functions (same as provided)
const getStrompreis = (strompreis) => strompreis;

const updateKosten = (watt, verbraucher, strompreis, setVerbraucherDaten, erweiterteEinstellungen) => {
  let kosten = 0;
  const einstellung = erweiterteEinstellungen[verbraucher];
  const totalDauer = einstellung?.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  const nutzung = einstellung?.nutzung || 0;

  switch (verbraucher.toLowerCase()) {
    case 'waschmaschine':
    case 'geschirrspüler':
    case 'trockner':
      kosten = (watt * totalDauer * nutzung * 52) / 1000 * strompreis;
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
  if (['waschmaschine', 'geschirrspüler', 'trockner'].includes(verbraucher.toLowerCase())) {
    kosten = (watt * totalDauer * einstellung.nutzung * 52) / 1000 * strompreis;
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
    const watt = verbraucherDaten[verbraucher]?.watt || 0;
    if (watt <= 0) return;
    const isGrundlast = ['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher.toLowerCase());
    const einstellung = erweiterteEinstellungen[verbraucher];
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
      let startzeit, endzeit, dauer, nutzung;
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
    batterie: false,
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
      id: 'Strompeicher',
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
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase());
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
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase());
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
    const parsedValue = field === 'nutzung' || field === 'dauer' ? parseFloat(value) || 0 : value;
    if ((field === 'nutzung' || field === 'dauer') && parsedValue < 0) {
      setError(`Nutzung oder Dauer für ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: {
        ...prev[verbraucher],
        [field === 'nutzung' ? 'nutzung' : 'zeitraeume']: field === 'nutzung' ? parsedValue : prev[verbraucher].zeitraeume.map(zeitraum =>
          zeitraum.id === zeitraumId ? { ...zeitraum, [field]: parsedValue } : zeitraum
        ),
      },
    }));
    setError('');
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase());
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
      const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase());
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
          dauer: prev[verbraucher].zeitraeume[0]?.dauer || 0,
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
    const isDynamisch = ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase());
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

  const isDynamisch = (verbraucher) => ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase());

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
      if (menuId === 'grundlastverbraucher' || menuId === 'dynamischeverbraucher') {
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
    if (menuId === 'grundlastverbraucher' || menuId === 'dynamischeverbraucher') {
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
        borderColor: '#4372b7',
        backgroundColor: '#4372b7',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: `Dynamischer Preis am ${selectedDate || 'N/A'} (€/kWh)`,
        data: chartConvertedValues,
        fill: false,
        borderColor: '#905fa4',
        backgroundColor: '#905fa4',
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
        borderColor: '#905fa4',
        backgroundColor: '#905fa4',
        tension: 0.1,
      },
      {
        label: `Kosten (Fester Tarif) am ${selectedDate || 'N/A'} (€)`,
        data: hourlyData.map((d) => (d.total * strompreis).toFixed(2)),
        fill: false,
        borderColor: '#4372b7',
        backgroundColor: '#4372b7',
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
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background-color: #f3f4f6;
        }

        .app-container {
          min-height: 100vh;
          padding: 20px 4cm; /* 4cm Rand links und rechts */
          box-sizing: border-box;
        }

        .container {
          display: flex;
          gap: 28px; /* Reduced from 40px by 30% */
          justify-content: center; /* Zentriert den Inhalt */
          flex-wrap: nowrap;
        }

        .calculation-report {
          width: 560px; /* Reduced from 800px by 30% */
          background-color: white;
          padding: 16.8px; /* Reduced from 24px by 30% */
          border-radius: 5.6px; /* Reduced from 8px by 30% */
          box-shadow: 0 0.7px 2.1px rgba(0, 0, 0, 0.1), 0 0.7px 1.4px rgba(0, 0, 0, 0.06);
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .report-title {
          font-size: 1.05rem; /* Reduced from 1.5rem by 30% */
          font-weight: 700;
          margin-bottom: 11.2px; /* Reduced from 16px by 30% */
          color: #4372b7;
        }

        .report-content p {
          color: #4b5563;
        }

        .diagrams-container {
          width: 560px; /* Reduced from 800px by 30% */
          display: flex;
          flex-direction: column;
          gap: 14px; /* Reduced from 20px by 30% */
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .diagram {
          background-color: white;
          padding: 16.8px; /* Reduced from 24px by 30% */
          border-radius: 5.6px; /* Reduced from 8px by 30% */
          box-shadow: 0 0.7px 2.1px rgba(0, 0, 0, 0.1), 0 0.7px 1.4px rgba(0, 0, 0, 0.06);
          box-sizing: border-box;
        }

        .diagram-title {
          font-size: 0.875rem; /* Reduced from 1.25rem by 30% */
          font-weight: 600;
          margin-bottom: 11.2px; /* Reduced from 16px by 30% */
          color: #4372b7;
        }

        .chart-container {
          width: 526px; /* Reduced from 752px by 30% */
          height: 420px; /* Reduced from 600px by 30% */
          margin: 0 auto;
        }

        .input-container-html {
          margin-bottom: 14px; /* Reduced from 20px by 30% */
        }

        .input-container-html label {
          display: block;
          margin-bottom: 5.6px; /* Reduced from 8px by 30% */
          font-weight: bold;
          color: #333;
        }

        .input-container-html input,
        .input-container-html select {
          padding: 8.4px; /* Reduced from 12px by 30% */
          width: 100%;
          max-width: 154px; /* Reduced from 220px by 30% */
          border: 0.7px solid #ddd; /* Reduced from 1px by 30% */
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          font-size: 11.2px; /* Reduced from 16px by 30% */
        }

        .input-container-html input:focus,
        .input-container-html select:focus {
          border-color: #4372b7;
          box-shadow: 0 0 3.5px rgba(67, 114, 183, 0.3); /* Reduced from 5px by 30% */
          outline: none;
        }

        .menu {
          margin-bottom: 10.5px; /* Reduced from 15px by 30% */
          background-color: #fff;
          border-radius: 5.6px; /* Reduced from 8px by 30% */
          overflow: hidden;
          box-shadow: 0 1.4px 5.6px rgba(0, 0, 0, 0.08); /* Reduced from 2px and 8px by 30% */
        }

        .menu-header {
          background-color: #4372b7;
          color: white;
          padding: 10.5px; /* Reduced from 15px by 30% */
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.6px; /* Reduced from 18px by 30% */
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .menu-header:hover {
          background-color: #5a8cd0;
        }

        .menu-content {
          padding: 14px; /* Reduced from 20px by 30% */
          background-color: #f9f9f9;
        }

        .triangle {
          transition: transform 0.3s;
          font-size: 9.8px; /* Reduced from 14px by 30% */
        }

        .triangle.open {
          transform: rotate(180deg);
        }

        .triangle.closed {
          transform: rotate(90deg);
        }

        .checkbox-group {
          margin-bottom: 10.5px; /* Reduced from 15px by 30% */
          list-style: none;
          padding: 0;
        }

        .checkbox-group-header {
          display: flex;
          align-items: center;
          font-weight: bold;
          color: #333;
          padding: 7px; /* Reduced from 10px by 30% */
          background-color: #f0f0f0;
          border-bottom: 0.7px solid #ddd; /* Reduced from 1px by 30% */
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
          padding: 7px; /* Reduced from 10px by 30% */
          border-bottom: 0.7px solid #eee; /* Reduced from 1px by 30% */
          transition: background-color 0.2s;
        }

        .checkbox-group li:hover {
          background-color: #f0f0f0;
        }

        .checkbox-group-label {
          display: flex;
          align-items: center;
          font-size: 11.2px; /* Reduced from 16px by 30% */
          color: #333;
          cursor: pointer;
          flex: 1;
          min-width: 105px; /* Reduced from 150px by 30% */
        }

        .checkbox-group input[type="checkbox"] {
          appearance: none;
          width: 12.6px; /* Reduced from 18px by 30% */
          height: 12.6px; /* Reduced from 18px by 30% */
          border: 1.4px solid #4372b7; /* Reduced from 2px by 30% */
          border-radius: 2.8px; /* Reduced from 4px by 30% */
          margin-right: 7px; /* Reduced from 10px by 30% */
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s, border-color 0.2s;
        }

        .checkbox-group input[type="checkbox"]:checked {
          background-color: #4372b7;
          border-color: #4372b7;
        }

        .checkbox-group input[type="checkbox"]:checked::after {
          content: '✔';
          color: white;
          font-size: 8.4px; /* Reduced from 12px by 30% */
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .checkbox-group input[type="checkbox"]:hover {
          border-color: #5a8cd0;
        }

        .info-field {
          width: 56px; /* Reduced from 80px by 30% */
          font-size: 9.8px; /* Reduced from 14px by 30% */
          text-align: center;
          flex: 1;
          position: relative;
          cursor: pointer;
        }

        .info-field::before {
          content: 'ℹ';
          display: inline-block;
          width: 14px; /* Reduced from 20px by 30% */
          height: 14px; /* Reduced from 20px by 30% */
          line-height: 14px; /* Reduced from 20px by 30% */
          background-color: #4372b7;
          color: white;
          border-radius: 50%;
          font-size: 8.4px; /* Reduced from 12px by 30% */
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
          padding: 7px; /* Reduced from 10px by 30% */
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          position: absolute;
          z-index: 1;
          top: -7px; /* Reduced from -10px by 30% */
          left: 100%;
          transform: translateY(-50%);
          width: 140px; /* Reduced from 200px by 30% */
          font-size: 8.4px; /* Reduced from 12px by 30% */
          transition: opacity 0.3s;
        }

        .info-field .tooltip::before {
          content: '';
          position: absolute;
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          border: 4.2px solid transparent; /* Reduced from 6px by 30% */
          border-right-color: #333;
        }

        .settings-field {
          width: 56px; /* Reduced from 80px by 30% */
          font-size: 9.8px; /* Reduced from 14px by 30% */
          text-align: center;
          flex: 0.8;
          cursor: pointer;
          padding: 4.2px 8.4px; /* Reduced from 6px and 12px by 30% */
          background-color: #4372b7;
          color: white;
          border: none;
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          transition: background-color 0.3s;
        }

        .settings-field:hover {
          background-color: #5a8cd0;
        }

        .settings-field::before {
          content: '⚙️';
          display: inline-block;
          width: 14px; /* Reduced from 20px by 30% */
          height: 14px; /* Reduced from 20px by 30% */
          line-height: 14px; /* Reduced from 20px by 30% */
          font-size: 11.2px; /* Reduced from 16px by 30% */
          text-align: center;
          vertical-align: middle;
        }

        .input-group {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .watt-input {
          padding: 5.6px; /* Reduced from 8px by 30% */
          width: 56px; /* Reduced from 80px by 30% */
          border: 0.7px solid #ddd; /* Reduced from 1px by 30% */
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          font-size: 9.8px; /* Reduced from 14px by 30% */
          text-align: center;
          transition: border-color 0.3s;
        }

        .watt-input:focus {
          border-color: #4372b7;
          outline: none;
        }

        .settings-container {
          margin-top: 7px; /* Reduced from 10px by 30% */
          padding: 10.5px; /* Reduced from 15px by 30% */
          background-color: #e6f3e6;
          border: 0.7px solid #4372b7; /* Reduced from 1px by 30% */
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          display: flex;
          flex-direction: column;
          gap: 10.5px; /* Reduced from 15px by 30% */
          width: 100%;
        }

        .settings-input {
          padding: 5.6px; /* Reduced from 8px by 30% */
          width: 70px; /* Reduced from 100px by 30% */
          border: 0.7px solid #ddd; /* Reduced from 1px by 30% */
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          font-size: 9.8px; /* Reduced from 14px by 30% */
          text-align: center;
          transition: border-color 0.3s;
        }

        .settings-input:focus {
          border-color: #4372b7;
          outline: none;
        }

        .radio-group-settings {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px; /* Reduced from 10px by 30% */
        }

        .radio-group-settings label {
          display: flex;
          align-items: center;
          font-size: 9.8px; /* Reduced from 14px by 30% */
          color: #333;
          cursor: pointer;
        }

        .radio-group-settings input[type="radio"] {
          appearance: none;
          width: 11.2px; /* Reduced from 16px by 30% */
          height: 11.2px; /* Reduced from 16px by 30% */
          border: 1.4px solid #4372b7; /* Reduced from 2px by 30% */
          border-radius: 50%;
          margin-right: 5.6px; /* Reduced from 8px by 30% */
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s, border-color 0.2s;
        }

        .radio-group-settings input[type="radio"]:checked {
          background-color: #4372b7;
          border-color: #4372b7;
        }

        .radio-group-settings input[type="radio"]:checked::after {
          content: '';
          width: 5.6px; /* Reduced from 8px by 30% */
          height: 5.6px; /* Reduced from 8px by 30% */
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .radio-group-settings input[type="radio"]:hover {
          border-color: #5a8cd0;
        }

        .price-display {
          width: 56px; /* Reduced from 80px by 30% */
          font-size: 9.8px; /* Reduced from 14px by 30% */
          color: #333;
          text-align: center;
          flex: 1;
        }

        .delete-option-button {
          padding: 4.2px 8.4px; /* Reduced from 6px and 12px by 30% */
          background-color: #a00;
          color: white;
          border: none;
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          cursor: pointer;
          font-size: 9.8px; /* Reduced from 14px by 30% */
          flex: 1;
          text-align: center;
          max-width: 56px; /* Reduced from 80px by 30% */
        }

        .delete-option-button:hover {
          background-color: #c00;
        }

        .new-option-container {
          margin-top: 10.5px; /* Reduced from 15px by 30% */
          padding-top: 10.5px; /* Reduced from 15px by 30% */
          border-top: 0.7px solid #eee; /* Reduced from 1px by 30% */
          display: flex;
          flex-wrap: wrap;
          gap: 7px; /* Reduced from 10px by 30% */
          align-items: center;
        }

        .new-option-input {
          padding: 5.6px; /* Reduced from 8px by 30% */
          width: 140px; /* Reduced from 200px by 30% */
          border: 0.7px solid #ddd; /* Reduced from 1px by 30% */
          border-radius: 2.8px; /* Reduced from 4px by 30% */
          font-size: 9.8px; /* Reduced from 14px by 30% */
        }

        .new-option-input:focus {
          border-color: #4372b7;
          outline: none;
        }

        .new-option-watt {
          padding: 5.6px; /* Reduced from 8px by 30% */
          width: 70px; /* Reduced from 100px by 30% */
          border: 0.7px solid #ddd; /* Reduced from 1px by 30% */
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          font-size: 9.8px; /* Reduced from 14px by 30% */
          text-align: center;
        }

        .new-option-watt:focus {
          border-color: #4372b7;
          outline: none;
        }

        .add-option-button,
        .save-option-button {
          padding: 7px 14px; /* Reduced from 10px and 20px by 30% */
          background-color: #4372b7;
          color: white;
          border: none;
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          cursor: pointer;
          font-size: 9.8px; /* Reduced from 14px by 30% */
          transition: background-color 0.3s;
        }

        .add-option-button:hover,
        .save-option-button:hover {
          background-color: #5a8cd0;
        }

        .confirm-dialog {
          margin-top: 7px; /* Reduced from 10px by 30% */
          padding: 10.5px; /* Reduced from 15px by 30% */
          background-color: #ffe6e6;
          border: 0.7px solid #a00; /* Reduced from 1px by 30% */
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          display: flex;
          align-items: center;
          gap: 7px; /* Reduced from 10px by 30% */
          flex-wrap: wrap;
        }

        .confirm-button {
          padding: 4.2px 8.4px; /* Reduced from 6px and 12px by 30% */
          background-color: #a00;
          color: white;
          border: none;
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          cursor: pointer;
        }

        .confirm-button:hover {
          background-color: #c00;
        }

        .cancel-button {
          padding: 4.2px 8.4px; /* Reduced from 6px and 12px by 30% */
          background-color: #666;
          color: white;
          border: none;
          border-radius: 2.8px; /* Reduced from 4px by 30% */
          cursor: pointer;
        }

        .cancel-button:hover {
          background-color: #777;
        }

        .date-picker-container {
          display: flex;
          align-items: center;
          gap: 0.35rem; /* Reduced from 0.5rem by 30% */
        }

        .date-picker-label {
          font-size: 0.63rem; /* Reduced from 0.9rem by 30% */
          font-weight: 500;
          color: #34495e;
        }

        .date-picker {
          padding: 0.35rem; /* Reduced from 0.5rem by 30% */
          border: 0.7px solid #dfe6e9; /* Reduced from 1px by 30% */
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          font-size: 0.63rem; /* Reduced from 0.9rem by 30% */
          background-color: #fff;
          box-shadow: inset 0 0.7px 2.1px rgba(0,0,0,0.05); /* Reduced from 1px and 3px by 30% */
          cursor: pointer;
        }

        .loading {
          font-size: 0.7rem; /* Reduced from 1rem by 30% */
          color: #7f8c8d;
          text-align: center;
          padding: 0.7rem; /* Reduced from 1rem by 30% */
        }

        .no-data {
          font-size: 0.7rem; /* Reduced from 1rem by 30% */
          color: #e74c3c;
          text-align: center;
          padding: 0.7rem; /* Reduced from 1rem by 30% */
        }

        .summary-container {
          margin-top: 14px; /* Reduced from 20px by 30% */
          padding: 10.5px; /* Reduced from 15px by 30% */
          background-color: #f9f9f9;
          border-radius: 4.2px; /* Reduced from 6px by 30% */
          border: 0.7px solid #ddd; /* Reduced from 1px by 30% */
        }

        .summary-title {
          font-size: 0.84rem; /* Reduced from 1.2rem by 30% */
          font-weight: 600;
          margin-bottom: 7px; /* Reduced from 10px by 30% */
          color: #4372b7;
        }

        .summary-item {
          margin-bottom: 5.6px; /* Reduced from 8px by 30% */
          font-size: 0.7rem; /* Reduced from 1rem by 30% */
          color: #333;
        }
      `}} />
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
                          {menu.id === 'dynamischeverbraucher' && <span className="dynamischeverbraucher-extra">Einstellungen</span>}
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
                            {menu.id === 'dynamischeverbraucher' && (
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
                            {showErweiterteOptionen[menu.id]?.[option.name] && menu.id === 'dynamischeverbraucher' && (
                              <div className="settings-container">
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