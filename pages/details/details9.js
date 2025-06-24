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

// Time period options with hardcoded times
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

  switch (verbraucher.toLowerCase()) {
    case 'waschmaschine':
    case 'geschirrspüler':
    case 'trockner':
      kosten = (watt * totalDauer * nutzung * 52) / 1000 * strompreis; // Weekly usage
      break;
    case 'herd':
    case 'multimedia':
    case 'licht':
      kosten = (watt * totalDauer * nutzung * 365) / 1000 * strompreis; // Daily usage
      break;
    default:
      kosten = (watt * strompreis * 24 * 365) / 1000; // Grundlast: 24/7 operation
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

// Exportable wattage data
export const getWattageData = (verbraucherDaten, erweiterteEinstellungen) => {
  const totalWattage = calculateTotalWattage(verbraucherDaten);
  const hourlyData = berechneStundenVerbrauch(verbraucherDaten, erweiterteEinstellungen);
  return {
    totalWattage: parseFloat(totalWattage),
    hourlyKWConsumption: hourlyData.map(d => d.total),
    consumers: Object.keys(verbraucherDaten).map(verbraucher => ({
      name: verbraucher,
      watt: parseFloat(verbraucherDaten[verbraucher].watt) || 0,
    })),
  };
};

// Component
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
          startzeit = '18:40';
          endzeit = '19:50';
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

  // Define menus as state
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
      id: 'batterie',
      label: 'Batterie',
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
        zeitraeume: prev[verbraucher].zeitraeume.map(zeitraum =>
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
          zeitraeume: zeitraume.filter((zeitraum) => zeitraum.id !== zeitraumId),
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

  // Chart data for hourly consumption (kW)
  const hourlyData = berechneStundenVerbrauch(verbraucherDaten, erweiterteEinstellungen);
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Stromverbrauch (kW)',
        data: hourlyData.map(d => d.total),
        fill: false,
        borderColor: '#2e4d2e',
        backgroundColor: '#2e4d2e',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#333' } },
      title: { display: true, text: 'Stündlicher Stromverbrauch (kW)', color: '#333', font: { size: 20 } },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const verbraucherList = hourlyData[index].verbraucher.join(', ');
            return `Verbrauch: ${context.raw} kW\nAktive Verbraucher: ${verbraucherList || 'Keine'}`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Verbrauch modelled by- Grok (kW)', color: '#333' }, ticks: { color: '#333' } },
      x: { title: { display: true, text: 'Uhrzeit', color: '#333' }, ticks: { color: '#333' } },
    },
  };

  // Chart data for hourly costs with dynamic and fixed prices
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
    typeof entry.value === 'number' ? entry.value * 0.1 / 100 : parseFloat(entry.value) * 0.1 / 100 || null
  );

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
        borderColor: '#ff0000', // Red for dynamic tariff
        backgroundColor: '#ff0000',
        tension: 0.1,
      },
      {
        label: `Kosten (Fester Tarif) am ${selectedDate || 'N/A'} (€)`,
        data: hourlyData.map((d) => (d.total * strompreis).toFixed(2)),
        fill: false,
        borderColor: '#0000ff', // Blue for fixed tariff
        backgroundColor: '#0000ff',
        tension: 0.1,
      },
    ],
  };

  const chartOptionsKosten = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#333' } },
      title: { 
        display: true, 
        text: `Stündliche Stromkosten (${selectedDate || 'Fallback-Preis'})`, 
        color: '#333', 
        font: { size: 20 } 
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
      <style jsx>{`
   .container {
  max-width: 2000%; /* Ändert die maximale Breite auf 100% der verfügbaren Breite */
  width: 100%; /* Stellt sicher, dass der Container die volle Breite einnimmt */
  margin: 0 auto; /* Entfernt den vertikalen Margin (optional) oder setzt ihn auf 0 */
  padding: 20px; /* Behält den Innenabstand bei */
  font-family: 'Arial', sans-serif;
  background-color: #f7f7f7;
  border-radius: 0; /* Optional: Entfernt abgerundete Ecken für ein "vollbildiges" Design */
  box-shadow: none; /* Optional: Entfernt den Schatten, da er bei voller Breite weniger sinnvoll ist */
}
.input-container-html {
  margin-bottom: 20px; /* Fügt 20px Abstand unterhalb des Eingabecontainers hinzu */
}
.input-container-html label {
  display: block; /* Macht das Label zu einem Block-Element, sodass es die volle Breite einnimmt */
  margin-bottom: 8px; /* Fügt 8px Abstand unterhalb des Labels hinzu */
  font-weight: bold; /* Setzt die Schrift des Labels auf fett */
  color: #333; /* Setzt die Textfarbe des Labels auf ein dunkles Grau */
}
.input-container-html input {
  padding: 12px; /* Fügt 12px Innenabstand in Eingabefeldern hinzu */
  width: 150%; /* Setzt die Breite des Inputs auf 100% des Containers */
  max-width: 220px; /* Begrenzt die maximale Breite des Inputs auf 220px */
  border: 1px solid #ddd; /* Fügt einen 1px dicken, grauen Rand hinzu */
  border-radius: 6px; /* Rundet die Ecken des Inputs mit einem Radius von 6px ab */
  font-size: 16px; /* Setzt die Schriftgröße auf 16px */
}
.input-container-html input:focus {
  border-color: #2e4d2e /* Ändert die Randfarbe bei Fokus auf ein dunkles Grün */
  box-shadow: 0 0 5px rgba(46, 77, 46, 0.3); /* Fügt einen leichten grünen Schatten bei Fokus hinzu */
  outline: none; /* Entfernt den Standard-Browser-Fokusrahmen */
}
.menu {
  margin-bottom: 15px; /* Fügt 15px Abstand unterhalb des Menüs hinzu */
  background-color: #fff; /* Setzt die Hintergrundfarbe auf Weiß */
  border-radius: 8px; /* Rundet die Ecken des Menüs mit einem Radius von 8px ab */
  overflow: hidden; /* Verhindert, dass Inhalte über die abgerundeten Ecken hinausgehen */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Fügt einen subtilen Schatten für Tiefe hinzu */
}
.menu-header {
  background-color: #2e4d2e; /* Setzt die Hintergrundfarbe des Menü-Headers auf dunkles Grün */
  color: white; /* Setzt die Textfarbe auf Weiß */
  padding: 15px; /* Fügt 15px Innenabstand hinzu */
  display: flex; /* Aktiviert Flexbox für die Anordnung der Inhalte */
  justify-content: space-between; /* Platziert die Inhalte mit gleichmäßigem Abstand dazwischen */
  align-items: center; /* Zentriert die Inhalte vertikal */
  font-size: 18px; /* Setzt die Schriftgröße auf 18px */
  font-weight: bold; /* Setzt die Schrift auf fett */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger, um Klickbarkeit anzuzeigen */
  transition: background-color 0.3s; /* Animierter Übergang für die Hintergrundfarbe bei Hover */
}
.menu-header:hover {
  background-color: #3a613a; /* Ändert die Hintergrundfarbe bei Hover auf ein helleres Grün */
}
.menu-content {
  padding: 20px; /* Fügt 20px Innenabstand hinzu */
  background-color: #f9f9f9; /* Setzt die Hintergrundfarbe auf ein sehr helles Grau */
}
.triangle {
  transition: transform 0.3s; /* Animierter Übergang für die Drehung des Dreiecks */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px (für das Dreieck-Symbol) */
}
.triangle.open {
  transform: rotate(180deg); /* Dreht das Dreieck um 180 Grad, wenn es geöffnet ist */
}
.triangle.closed {
  transform: rotate(90deg); /* Dreht das Dreieck um 90 Grad, wenn es geschlossen ist */
}
.checkbox-group {
  margin-bottom: 15px; /* Fügt 15px Abstand unterhalb der Checkbox-Gruppe hinzu */
  list-style: none; /* Entfernt die Standard-Aufzählungszeichen der Liste */
  padding: 0; /* Entfernt den Innenabstand der Liste */
}
.checkbox-group-header {
  display: flex; /* Aktiviert Flexbox für die Anordnung der Header-Inhalte */
  align-items: center; /* Zentriert die Inhalte vertikal */
  font-weight: bold; /* Setzt die Schrift auf fett */
  color: #333; /* Setzt die Textfarbe auf ein dunkles Grau */
  padding: 10px; /* Fügt 10px Innenabstand hinzu */
  background-color: #f0f0f0; /* Setzt die Hintergrundfarbe auf ein helles Grau */
  border-bottom: 1px solid #ddd; /* Fügt eine 1px dicke untere Linie hinzu */
}
.checkbox-group-header span {
  flex: 1; /* Lässt den Span die verfügbare Breite gleichmäßig aufteilen */
  text-align: center; /* Zentriert den Text horizontal */
}
.checkbox-group-header span.dynamischeverbraucher-extra {
  flex: 0.8; /* Begrenzt die Breite dieses Spans auf 80% im Vergleich zu anderen */
}
.checkbox-group li {
  display: flex; /* Aktiviert Flexbox für die Anordnung der Listenelemente */
  align-items: center; /* Zentriert die Inhalte vertikal */
  padding: 10px; /* Fügt 10px Innenabstand hinzu */
  border-bottom: 1px solid #eee; /* Fügt eine 1px dicke untere Linie hinzu */
  transition: background-color 0.2s; /* Animierter Übergang für die Hintergrundfarbe bei Hover */
}
.checkbox-group li:hover {
  background-color: #f0f0f0; /* Ändert die Hintergrundfarbe bei Hover auf ein helles Grau */
}
.checkbox-group-label {
  display: flex; /* Aktiviert Flexbox für die Anordnung des Labels */
  align-items: center; /* Zentriert die Inhalte vertikal */
  font-size: 16px; /* Setzt die Schriftgröße auf 16px */
  color: #333; /* Setzt die Textfarbe auf ein dunkles Grau */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger, um Klickbarkeit anzuzeigen */
  flex: 1; /* Lässt das Label die verfügbare Breite einnehmen */
  min-width: 150px; /* Setzt eine minimale Breite von 150px für das Label */
}
.checkbox-group input[type="checkbox"] {
  appearance: none; /* Entfernt das Standard-Browser-Design der Checkbox */
  width: 18px; /* Setzt die Breite der Checkbox auf 18px */
  height: 18px; /* Setzt die Höhe der Checkbox auf 18px */
  border: 2px solid #2e4d2e; /* Fügt einen 2px dicken grünen Rand hinzu */
  border-radius: 4px; /* Rundet die Ecken der Checkbox mit einem Radius von 4px ab */
  margin-right: 10px; /* Fügt 10px Abstand rechts von der Checkbox hinzu */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
  position: relative; /* Ermöglicht die Positionierung des Häkchens */
  transition: background-color 0.2s, border-color 0.2s; /* Animierter Übergang für Hintergrund und Randfarbe */
}
.checkbox-group input[type="checkbox"]:checked {
  background-color: #2e4d2e; /* Setzt die Hintergrundfarbe auf Grün, wenn die Checkbox aktiviert ist */
  border-color: #2e4d2e; /* Setzt die Randfarbe auf Grün */
}
.checkbox-group input[type="checkbox"]:checked::after {
  content: '✔'; /* Fügt ein Häkchen-Symbol hinzu, wenn die Checkbox aktiviert ist */
  color: white; /* Setzt die Farbe des Häkchens auf Weiß */
  font-size: 12px; /* Setzt die Schriftgröße des Häkchens auf 12px */
  position: absolute; /* Positioniert das Häkchen absolut innerhalb der Checkbox */
  top: 50%; /* Zentriert das Häkchen vertikal */
  left: 50%; /* Zentriert das Häkchen horizontal */
  transform: translate(-50%, -50%); /* Verschiebt das Häkchen genau in die Mitte */
}
.checkbox-group input[type="checkbox"]:hover {
  border-color: #3a613a; /* Ändert die Randfarbe bei Hover auf ein helleres Grün */
}
.info-field {
  width: 80px; /* Setzt die Breite des Info-Feldes auf 80px */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  text-align: center; /* Zentriert den Text horizontal */
  flex: 1; /* Lässt das Info-Feld die verfügbare Breite einnehmen */
  position: relative; /* Ermöglicht die Positionierung des Tooltips */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
}
.info-field::before {
  content: 'ℹ'; /* Fügt ein Info-Symbol vor dem Text hinzu */
  display: inline-block; /* Macht das Symbol zu einem Inline-Block-Element */
  width: 20px; /* Setzt die Breite des Symbols auf 20px */
  height: 20px; /* Setzt die Höhe des Symbols auf 20px */
  line-height: 20px; /* Zentriert den Text vertikal innerhalb des Symbols */
  background-color: #2e4d2e; /* Setzt die Hintergrundfarbe des Symbols auf Grün */
  color: white; /* Setzt die Textfarbe des Symbols auf Weiß */
  border-radius: 50%; /* Macht das Symbol zu einem Kreis */
  font-size: 12px; /* Setzt die Schriftgröße des Symbols auf 12px */
  text-align: center; /* Zentriert den Text horizontal */
  vertical-align: middle; /* Zentriert das Symbol vertikal relativ zum Text */
}
.info-field:hover .tooltip {
  visibility: visible; /* Macht den Tooltip sichtbar bei Hover */
  opacity: 1; /* Setzt die Deckkraft des Tooltips auf 100% */
}
.info-field .tooltip {
  visibility: hidden; /* Versteckt den Tooltip standardmäßig */
  opacity: 0; /* Setzt die Deckkraft des Tooltips auf 0 */
  background-color: #333; /* Setzt die Hintergrundfarbe des Tooltips auf ein dunkles Grau */
  color: white; /* Setzt die Textfarbe des Tooltips auf Weiß */
  text-align: left; /* Richtet den Text im Tooltip links aus */
  padding: 10px; /* Fügt 10px Innenabstand hinzu */
  border-radius: 6px; /* Rundet die Ecken des Tooltips mit einem Radius von 6px ab */
  position: absolute; /* Positioniert den Tooltip absolut */
  z-index: 1; /* Stellt sicher, dass der Tooltip über anderen Elementen liegt */
  top: -10px; /* Positioniert den Tooltip 10px über dem Info-Feld */
  left: 100%; /* Positioniert den Tooltip rechts vom Info-Feld */
  transform: translateY(-50%); /* Zentriert den Tooltip vertikal */
  width: 200px; /* Setzt die Breite des Tooltips auf 200px */
  font-size: 12px; /* Setzt die Schriftgröße des Tooltips auf 12px */
  transition: opacity 0.3s; /* Animierter Übergang für die Deckkraft */
}
.info-field .tooltip::before {
  content: ''; /* Fügt ein leeres Pseudo-Element hinzu (für den Pfeil des Tooltips) */
  position: absolute; /* Positioniert den Pfeil absolut */
  top: 50%; /* Zentriert den Pfeil vertikal */
  right: 100%; /* Positioniert den Pfeil links vom Tooltip */
  transform: translateY(-50%); /* Zentriert den Pfeil vertikal */
  border: 6px solid transparent; /* Erstellt einen transparenten Rand für den Pfeil */
  border-right-color: #333; /* Setzt die Farbe des rechten Randes (Pfeilspitze) auf die Farbe des Tooltips */
}
.settings-field {
  width: 80px; /* Setzt die Breite des Einstellungs-Feldes auf 80px */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  text-align: center; /* Zentriert den Text horizontal */
  flex: 0.8; /* Begrenzt die Breite auf 80% im Vergleich zu anderen Flex-Elementen */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
}
.settings-field::before {
  content: '⚙️'; /* Fügt ein Zahnrad-Symbol vor dem Text hinzu */
  display: inline-block; /* Macht das Symbol zu einem Inline-Block-Element */
  width: 20px; /* Setzt die Breite des Symbols auf 20px */
  height: 20px; /* Setzt die Höhe des Symbols auf 20px */
  line-height: 20px; /* Zentriert den Text vertikal innerhalb des Symbols */
  color: rgb(222, 82, 17); /* Setzt die Farbe des Symbols auf Orange */
  font-size: 16px; /* Setzt die Schriftgröße des Symbols auf 16px */
  text-align: center; /* Zentriert den Text horizontal */
  vertical-align: middle; /* Zentriert das Symbol vertikal relativ zum Text */
}
.input-group {
  flex: 1; /* Lässt die Eingabegruppe die verfügbare Breite einnehmen */
  display: flex; /* Aktiviert Flexbox für die Anordnung der Inhalte */
  justify-content: center; /* Zentriert die Inhalte horizontal */
}
.watt-input {
  padding: 8px; /* Fügt 8px Innenabstand hinzu */
  width: 80px; /* Setzt die Breite des Eingabefeldes auf 80px */
  border: 1px solid #ddd; /* Fügt einen 1px dicken grauen Rand hinzu */
  border-radius: 6px; /* Rundet die Ecken mit einem Radius von 6px ab */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  text-align: center; /* Zentriert den Text horizontal */
  transition: border-color 0.3s; /* Animierter Übergang für die Randfarbe */
}
.watt-input:focus {
  border-color: #2e4d2e; /* Ändert die Randfarbe bei Fokus auf Grün */
  outline: none; /* Entfernt den Standard-Browser-Fokusrahmen */
}
.settings-container {
  margin-top: 10px; /* Fügt 10px Abstand oberhalb des Containers hinzu */
  padding: 15px; /* Fügt 15px Innenabstand hinzu */
  background-color: #e6f3e6; /* Setzt die Hintergrundfarbe auf ein helles Grün */
  border: 1px solid rgb(15, 25, 223); /* Fügt einen 1px dicken blauen Rand hinzu */
  border-radius: 6px; /* Rundet die Ecken mit einem Radius von 6px ab */
  display: flex; /* Aktiviert Flexbox für die Anordnung der Inhalte */
  flex-direction: column; /* Stapelt die Inhalte vertikal */
  gap: 15px; /* Fügt 15px Abstand zwischen den Kind-Elementen hinzu */
  width: 100%; /* Setzt die Breite auf 100% */
}
.settings-input {
  padding: 8px; /* Fügt 8px Innenabstand hinzu */
  width: 100px; /* Setzt die Breite des Eingabefeldes auf 100px */
  border: 1px solid #ddd; /* Fügt einen 1px dicken grauen Rand hinzu */
  border-radius: 6px; /* Rundet die Ecken mit einem Radius von 6px ab */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  text-align: center; /* Zentriert den Text horizontal */
  transition: border-color 0.3s; /* Animierter Übergang für die Randfarbe */
}
.settings-input:focus {
  border-color: #2e4d2e; /* Ändert die Randfarbe bei Fokus auf Grün */
  outline: none; /* Entfernt den Standard-Browser-Fokusrahmen */
}
.radio-group-settings {
  display: grid; /* Aktiviert ein Grid-Layout für die Radio-Buttons */
  grid-template-columns: repeat(3, 1fr); /* Erstellt 3 gleich breite Spalten */
  gap: 10px; /* Fügt 10px Abstand zwischen den Grid-Elementen hinzu */
}
.radio-group-settings label {
  display: flex; /* Aktiviert Flexbox für die Anordnung des Labels */
  align-items: center; /* Zentriert die Inhalte vertikal */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  color: #333; /* Setzt die Textfarbe auf ein dunkles Grau */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
}
.radio-group-settings input[type="radio"] {
  appearance: none; /* Entfernt das Standard-Browser-Design des Radio-Buttons */
  width: 16px; /* Setzt die Breite des Radio-Buttons auf 16px */
  height: 16px; /* Setzt die Höhe des Radio-Buttons auf 16px */
  border: 2px solid #2e4d2e; /* Fügt einen 2px dicken grünen Rand hinzu */
  border-radius: 50%; /* Macht den Radio-Button rund */
  margin-right: 8px; /* Fügt 8px Abstand rechts vom Radio-Button hinzu */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
  position: relative; /* Ermöglicht die Positionierung des inneren Kreises */
  transition: background-color 0.2s, border-color 0.2s; /* Animierter Übergang für Hintergrund und Randfarbe */
}
.radio-group-settings input[type="radio"]:checked {
  background-color: #2e4d2e; /* Setzt die Hintergrundfarbe auf Grün, wenn der Radio-Button aktiviert ist */
  border-color: #2e4d2e; /* Setzt die Randfarbe auf Grün */
}
.radio-group-settings input[type="radio"]:checked::after {
  content: ''; /* Fügt ein leeres Pseudo-Element hinzu (für den inneren Kreis) */
  width: 8px; /* Setzt die Breite des inneren Kreises auf 8px */
  height: 8px; /* Setzt die Höhe des inneren Kreises auf 8px */
  background-color: white; /* Setzt die Farbe des inneren Kreises auf Weiß */
  border-radius: 50%; /* Macht den inneren Kreis rund */
  position: absolute; /* Positioniert den Kreis absolut innerhalb des Radio-Buttons */
  top: 50%; /* Zentriert den Kreis vertikal */
  left: 50%; /* Zentriert den Kreis horizontal */
  transform: translate(-50%, -50%); /* Verschiebt den Kreis genau in die Mitte */
}
.radio-group-settings input[type="radio"]:hover {
  border-color: #3a613a; /* Ändert die Randfarbe bei Hover auf ein helleres Grün */
}
.price-display {
  width: 80px; /* Setzt die Breite des Preisanzeige-Feldes auf 80px */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  color: #333; /* Setzt die Textfarbe auf ein dunkles Grau */
  text-align: center; /* Zentriert den Text horizontal */
  flex: 1; /* Lässt das Feld die verfügbare Breite einnehmen */
}
.delete-option-button {
  padding: 6px 12px; /* Fügt 6px vertikalen und 12px horizontalen Innenabstand hinzu */
  background-color: #a00; /* Setzt die Hintergrundfarbe auf Rot */
  color: white; /* Setzt die Textfarbe auf Weiß */
  border: none; /* Entfernt den Rand */
  border-radius: 6px; /* Rundet die Ecken mit einem Radius von 6px ab */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  flex: 1; /* Lässt den Button die verfügbare Breite einnehmen */
  text-align: center; /* Zentriert den Text horizontal */
  max-width: 80px; /* Begrenzt die maximale Breite auf 80px */
}
.delete-option-button:hover {
  background-color: #c00; /* Ändert die Hintergrundfarbe bei Hover auf ein helleres Rot */
}
.new-option-container {
  margin-top: 15px; /* Fügt 15px Abstand über dem Container hinzu */
  padding-top: 15px; /* Fügt 15px Innenabstand oben hinzu */
  */
  border-top: 1px solid #eee; /* Fügt eine 1px dicke obere Linie hinzu */
  display: flex; /* Aktiviert Flexbox für die Anordnung der Inhalte */
  flex-wrap: wrap; /* Ermöglicht das Umbrechen der Inhalte auf kleineren Bildschirmen */
  gap: 10px; /* Fügt 10px Abstand zwischen den Kind-Elementen hinzu */
  align-items: center; /* Zentriert die Inhalte vertikal */
}
.new-option-input {
  padding: 8px; /* Fügt 8px Innenabstand hinzu */
  width: 200px; /* Setzt die Breite des Eingabefeldes auf 200px */
  border: 1px solid #ddd; /* Fügt einen 2px solid #1px dicken grauen Rand hinzu */
  border-radius: 4px; /* Rundet die Ecken ab 5px ab 6px; */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
}
.new-option-input:focus {
  border-color: #2px solid #2e4d2e; /* Ändert die Randfarbe auf Grün bei Fokus */
  outline: none; /* Entfernt den Standard-Browser-Fokusrahmen */
}
.new-option-watt {
  padding: 8px; /* Fügt 8px Innenabstand hinzu */
  width: 100px; /* Setzt die Breite des Eingabefeldes auf 100px */
  border: 1px solid #d; /* Fügt 1px dicken grauen Randd hinzu */
  border-radius: 6px solid #ddd; /* Rundet die Ecken mit 4px ab 6px ab */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  text-align: center; /* Zentriert den Text horizontal */
}
.new-option-watt:focus {
  border-color: #2e4d2e; /* Ändert die Randfarbe bei Fokus auf Grün */
  outline: none; /* Entfernt den Standard-Browser-Fokusrahmen */
}
.add-option-button,
.save-option-button {
  padding: 10px 20px; /* Fügt 10px vertikalen und 20px horizontalen Innenabstand hinzu */
  background-color: #2e4d2e; /* Setzt die Hintergrundfarbe auf Grün */
  color: white; /* Setzt die Textfarbe auf Weiß */
  border: none; /* Entfernt den Rand */
  border-radius: 6px; /* Rundet die Ecken mit einem Radius von 4px ab 6px ab */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
  font-size: 14px; /* Setzt die Schriftgröße auf 14px */
  transition: background-color 0.3s; /* Animierter Übergang für die Hintergrundfarbe */
}
.add-option-button:hover,
.save-option-button:hover {
  background-color: #3a613a; /* Ändert die Hintergrundfarbe bei Hover auf ein helleres Grün */
}
.confirm-dialog {
  margin-top: 10px; /* Fügt 10px Abstand über dem Dialog hinzu */
  padding: 15px; /* Fügt 15px Innenabstand hinzu */
  background-color: #ffe6e6; /* Setzt die Hintergrundfarbe auf ein helles Rot */
  border: 1px solid #a00; /* Fügt 1px dicken roten Rand hinzu */
  border-radius: 6px; /* Rundet die Ecken mit einem Radius von 6px ab */
  display: flex; /* Aktiviert Flexbox für die Anordnung der Inhalte */
  align-items: center; /* Zentriert die Inhalte vertikal */
  gap: 10px; /* Fügt 10px Abstand zwischen den Kind-Elementen hinzu */
  flex-wrap: wrap; /* Ermöglicht das Umbrechen der Inhalte auf kleineren Bildschirmen */
}
.confirm-button {
  padding: 6px 12px; /* Fügt 6px vertikalen und 12px horizontalen Innenabstand hinzu */
  background-color: #a00; /* Setzt die Hintergrundfarbe auf Rot */
  color: white; /* Setzt die Textfarbe auf Weiß */
  border: none; /* Entfernt den Rand */
  border-radius: 6px; /* Rundet die Ecken mit einem Radius von 6px ab */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
}
.confirm-button:hover {
  background-color: #c00; /* Ändert die Hintergrundfarbe bei Hover auf ein helleres Rot */
}
.cancel-button {
  padding: 6px 12px; /* Fügt 6px vertikalen und 12px horizontalen Innenabstand hinzu */
  background-color: #666; /* Setzt die Hintergrundfarbe auf Grau */
  color: white; /* Setzt die Textfarbe auf Weiß */
  border: none; /* Entfernt den Randd */
  border-radius: 4px; /* Rundet die Ecken ab */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
}
.cancel-button:hover {
  background-color: #777; /* Ändernt die Hintergrundfarbe bei Hover auf ein helleres Grau */
}
.date-picker-container {
  display: flex; /* Aktiviert Flexbox für die Anordnung der Inhalte */
  align-items: center; /* Zentriert die Inhalte vertikal */
  gap: 0.5rem; /* Fügt 0,5rem Abstand zwischen den Kind-Elementen hinzu */
}
.date-picker-label {
  font-size: 0.9rem; /* Setzt die Schriftgröße auf 0,9rem */
  font-size: 4px.; /* Setzt die Schriftgröße auf  font-weight: 500; /* Setzt die Schriftgewicht auf 500 (mittel) */
  color: #34495e; /* Setzt die Textfarbe auf ein dunkles Grau */
}
.date-picker {
  padding: 0.5rem; /* Fügt 0,5rem Innenabstand hinzu */
  border: 1px solid #dfe6e9; /* Fügt 1px dicken hellgrauen Rand hinzu */
  border-radius: 6px; /* Rundet die Ecken mit einem Radius von 5px ab */
  font-size: 0.9rem; /* Setzt die Schriftgröße auf 0,9rem */
  background-color: #fff; /* Setzt die Hintergrundfarbe auf Weiß */
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); /* Fügt einen leichten Innen-Schatten hinzu */
  cursor: pointer; /* Ändert den Mauszeiger zu einem Zeiger */
}
.loading {
  font-size: 1rem; /* Setzt die Schriftgröße auf 1rem */
  color: #7f8c8d; /* Setzt die Textfarbe auf ein helles Grau */
  text-align: center; /* Zentriert den Text horizontal */
  padding: 1rem; /* Fügt 1rem Innenabstand hinzu */
}
.no-data {
  font-size: 1rem; /* Setzt die Schriftgröße auf 1rem */
  color: #e74c3e; /* Setzt die Textfarbe auf ein helles Rot */
  text-align: center; /* Zentriert den Text horizontal */
  padding: 1px; /* Fügt 1rem Abstand hinzu */
}
      `}</style>
      <div className="container">
        <h1 className="text-4xl font-extrabold text-center text-[#333] mb-12">Stromverbrauch Rechner</h1>
        {error && (
          <div className="confirm-dialog">{error}</div>
        )}
        {apiLoading && (
          <div className="loading">⏳ Daten werden geladen…</div>
        )}
        {!apiLoading && apiData.length === 0 && (
          <div className="no-data">⚠️ Keine dynamischen Strompreisdaten gefunden. Fallback-Preis wird verwendet.</div>
        )}
        <div className="input-container-html">
          <label htmlFor="strompreis">Fallback Strompreis (€/kWh)</label>
          <input
            type="number"
            id="strompreis"
            value={strompreis}
            step="0.01"
            min="0"
            onChange={(e) => handleStrompreisChange(e.target.value)}
            placeholder="z.B. 0.30"
            aria-label="Fallback Strompreis in € pro kWh"
          />
        </div>





        
        <div className="input-container-html">
          <label htmlFor="plz">Postleitzahl (PLZ)</label>
          <input
            type="text"
            id="plz"
            placeholder="z.B. 80331"
            value={plz}
            onChange={(e) => setPlz(e.target.value)}
            aria-label="Postleitzahl"
          />
        </div>
        <div className="input-container-html date-picker-container">
          <label htmlFor="date-picker" className="date-picker-label">
            Datum für dynamische Preise
          </label>
          <input
            id="date-picker"
            type="date"
            value={toInputDate(selectedDate)}
            onChange={(e) => setSelectedDate(fromInputDate(e.target.value))}
            className="date-picker"
            disabled={availableDates.length === 0}
            aria-label="Datum für dynamische Strompreise auswählen"
          />
        </div>

        {menus.map((menu) => (
          <div key={menu.id} className="menu">
            <button
              onClick={() => toggleMenu(menu.id)}
              className="menu-header"
              aria-expanded={openMenus[menu.id]}
              aria-controls={`menu-content-${menu.id}`}
            >
              <span>{menu.label}</span>
              <span className={`triangle ${openMenus[menu.id] ? 'open' : 'closed'}`}>▼</span>
            </button>
            {openMenus[menu.id] && (
              <div id={`menu-content-${menu.id}`} className="menu-content">
                <ul className="checkbox-group">
                  <li className="checkbox-group-header">
                    <span>Auswahl</span>
                    <span>Info</span>
                    <span>Watt</span>
                    {menu.id === 'dynamischeverbraucher' && <span className="dynamischeverbraucher-extra">Einstellungen</span>}
                    {(menu.id === 'grundlastverbraucher' || menu.id === 'dynamischeverbraucher') && <span>Kosten/Jahr</span>}
                    <span>Aktion</span>
                  </li>
                  {menu.options.map((option) => (
                    <li key={option.name}>
                      <label className="checkbox-group-label">
                        <input
                          type="checkbox"
                          checked={verbraucherDaten[option.name]?.checked || false}
                          onChange={(e) => onCheckboxChange(option.name, e.target.checked, menu.id)}
                          aria-label={`Standardwert für ${option.name} aktivieren`}
                          disabled={menu.id === 'stromerzeuger' || menu.id === 'batterie'}
                        />
                        {option.name}
                      </label>
                      <span className="info-field">
                        <span className="tooltip">{verbraucherBeschreibungen[option.name] || option.specifications}</span>
                      </span>
                      <div className="input-group">
                        <input
                          type="number"
                          value={verbraucherDaten[option.name]?.watt || ''}
                          placeholder="0"
                          onChange={(e) => handleWattChange(option.name, e.target.value)}
                          className="watt-input"
                          aria-label={`Wattleistung für ${option.name}`}
                          disabled={menu.id === 'stromerzeuger' || menu.id === 'batterie'}
                        />
                      </div>
                      {menu.id === 'dynamischeverbraucher' && (
                        <button
                          type="button"
                          onClick={() => toggleErweiterteOptionen(menu.id, option.name)}
                          className="settings-field"
                          aria-label={`Erweiterte Einstellungen für ${option.name} öffnen`}
                        >
                          <span className="tooltip">Erweiterte Einstellungen</span>
                        </button>
                      )}
                      {(menu.id === 'grundlastverbraucher' || menu.id === 'dynamischeverbraucher') && (
                        <span className="price-display">{verbraucherDaten[option.name]?.kosten || '0.00'} €</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                        className="delete-option-button"
                        aria-label={`Option ${option.name} löschen`}
                      >
                        Löschen
                      </button>
                      {showErweiterteOptionen[menu.id]?.[option.name] && menu.id === 'dynamischeverbraucher' && (
                        <div className="settings-container">
                          <ul className="checkbox-group">
                            <li className="checkbox-group-header">
                              <span>Nutzung/Woche</span>
                              <span>Zeitraum</span>
                              <span>Dauer (h)</span>
                              <span>Aktion</span>
                            </li>
                            {erweiterteEinstellungen[option.name]?.zeitraeume.map((zeitraum) => (
                              <li key={zeitraum.id}>
                                <div className="input-group">
                                  <input
                                    type="number"
                                    value={erweiterteEinstellungen[option.name].nutzung || ''}
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, zeitraum.id)}
                                    className="settings-input"
                                    aria-label={`Nutzung für ${option.name}`}
                                  />
                                </div>
                                <div className="input-group">
                                  <div className="radio-group-settings">
                                    {timePeriods.map((period) => (
                                      <label key={period.label}>
                                        <input
                                          type="radio"
                                          name={`time-period-${zeitraum.id}`}
                                          checked={zeitraum.startzeit === period.startzeit && zeitraum.endzeit === period.endzeit}
                                          onChange={() => handleTimePeriodChange(option.name, period.label, zeitraum.id)}
                                          aria-label={`Select ${period.label} for ${option.name}`}
                                        />
                                        {period.label} ({period.startzeit}–{period.endzeit})
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div className="input-group">
                                  <input
                                    type="number"
                                    value={zeitraum.dauer || ''}
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'dauer', e.target.value, zeitraum.id)}
                                    className="settings-input"
                                    aria-label={`Dauer für ${option.name}`}
                                  />
                                </div>
                                <div className="input-group">
                                  <button
                                    type="button"
                                    onClick={() => addZeitraum(option.name)}
                                    className="add-option-button"
                                    aria-label={`Zeitraum hinzufügen für ${option.name}`}
                                  >
                                    +
                                  </button>
                                  {erweiterteEinstellungen[option.name].zeitraeume.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeZeitraum(option.name, zeitraum.id)}
                                      className="delete-option-button"
                                      aria-label={`Zeitraum entfernen für ${option.name}`}
                                    >
                                      –
                                    </button>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {deleteConfirmOption?.menuId === menu.id && deleteConfirmOption?.optionName === option.name && (
                        <div className="confirm-dialog">
                          <span>Option "{deleteConfirmOption.optionName}" wirklich löschen?</span>
                          <button
                            type="button"
                            onClick={() => confirmDeleteOption(menu.id, deleteConfirmOption.optionName)}
                            className="confirm-button"
                            aria-label="Löschen bestätigen"
                          >
                            Ja
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelDeleteOption()}
                            className="cancel-button"
                            aria-label="Löschen abbrechen"
                          >
                            Nein
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="new-option-container">
                  <button
                    type="button"
                    onClick={() => toggleNewOptionForm(menu.id)}
                    className="add-option-button"
                    aria-label={showNewOptionForm[menu.id] ? 'Formular abbrechen' : 'Neue Option hinzufügen'}
                  >
                    {showNewOptionForm[menu.id] ? 'Abbrechen' : 'Neue Option hinzufügen'}
                  </button>
                  {showNewOptionForm[menu.id] && (
                    <>
                      <input
                        type="text"
                        placeholder="Neuer Name (z.B. Neuer Verbraucher)"
                        value={newOptionNames[menu.id] || ''}
                        onChange={(e) => handleNewOptionName(menu.id, e.target.value)}
                        className="new-option-input"
                        aria-label="Neuer Optionsname"
                      />
                      <input
                        type="number"
                        placeholder="Watt (z.B. 100)"
                        step="1"
                        value={newOptionWatt[menu.id] || ''}
                        onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                        className="new-option-watt"
                        aria-label="Neue Wattleistung"
                      />
                      <button
                        type="button"
                        onClick={() => addNewOption(menu.id)}
                        className="save-option-button"
                        aria-label="Neue Option speichern"
                      >
                        Speichern
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="menu">
          <h3 className="menu-header">Zusammenfassung Verbraucher</h3>
          <div className="menu-content">
            <h4>Grundlastverbraucher</h4>
            <ul className="checkbox-group">
              <li className="checkbox-group-header">
                <span>Verbraucher</span>
                <span>Watt</span>
                <span>Kosten/Jahr</span>
              </li>
              {Object.keys(verbraucherDaten)
                .filter((key) => ['kühlschrank', 'gefrierschrank', 'aquarium'].includes(key.toLowerCase()))
                .map((verbraucher) => (
                  <li key={verbraucher}>
                    <span className="checkbox-group-label">{verbraucher}</span>
                    <span className="price-display">{verbraucherDaten[verbraucher].watt} W</span>
                    <span className="price-display">{verbraucherDaten[verbraucher].kosten} €</span>
                  </li>
                ))}
            </ul>
            <h4>Dynamische Verbraucher</h4>
            <ul className="checkbox-group">
              <li className="checkbox-group-header">
                <span>Verbraucher</span>
                <span>Watt</span>
                <span>Kosten/Jahr</span>
              </li>
              {Object.keys(verbraucherDaten)
                .filter((key) => !['kühlschrank', 'gefrierschrank', 'aquarium'].includes(key.toLowerCase()))
                .map((verbraucher) => (
                  <li key={verbraucher}>
                    <span className="checkbox-group-label">{verbraucher}</span>
                    <span className="price-display">{verbraucherDaten[verbraucher].watt} W</span>
                    <span className="price-display">{verbraucherDaten[verbraucher].kosten} €</span>
                  </li>
                ))}
            </ul>
            <h4>Gesamtkosten</h4>
            <ul className="checkbox-group">
              <li>
                <span className="checkbox-group-label">Grundlastverbraucher</span>
                <span className="price-display">{zusammenfassung.grundlast} €</span>
              </li>
              <li>
                <span className="checkbox-group-label">Dynamische Verbraucher</span>
                <span className="price-display">{zusammenfassung.dynamisch} €</span>
              </li>
              <li>
                <span className="checkbox-group-label">Gesamt</span>
                <span className="price-display">{zusammenfassung.gesamt} €</span>
              </li>
              <li>
                <span className="checkbox-group-label">Gesamtverbrauch</span>
                <span className="price-display">{zusammenfassung.totalWattage} W</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="menu">
          <h3 className="menu-header">Stromverbrauch pro Stunde</h3>
          <div className="menu-content">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="menu">
          <h3 className="menu-header">Stromkosten pro Stunde</h3>
          <div className="menu-content">
            <Line data={chartDataKosten} options={chartOptionsKosten} />
          </div>
        </div>
      </div>
    </>
  );
}