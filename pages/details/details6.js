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
  Herd: 2000,
  Multimedia: 350,
  Licht: 60,
};

const verbraucherBeschreibungen = {
  Kühlschrank: 'Der Kühlschrank läuft kontinuierlich und verbraucht typischerweise 120 W.',
  Gefrierschrank: 'Der Gefrierschrank benötigt etwa 200 W für Langzeitlagerung.',
  Aquarium: 'Ein Aquarium verbraucht ca. 50 W, abhängig von Größe und Ausstattung.',
  Waschmaschine: 'Die Waschmaschine verbraucht ca. 1200 W pro Waschgang (1,37h/Woche).',
  Geschirrspüler: 'Der Geschirrspüler benötigt ca. 600 W pro Spülgang (1,27h/Woche).',
  Trockner: 'Der Wäschetrockner verbraucht ca. 3500 W pro Trocknung (1,37h/Woche).',
  Herd: 'Der Herd benötigt etwa 2000 W bei 1 Stunde täglicher Nutzung.',
  Multimedia: 'Multimedia-Geräte verbrauchen ca. 350 W bei 3 Stunden täglicher Nutzung.',
  Licht: 'Beleuchtung verbraucht etwa 60 W bei 5 Stunden täglicher Nutzung.',
};

// Functions
const getStrompreis = (strompreis) => strompreis;

const updateKosten = (watt, verbraucher, strompreis, setVerbraucherDaten, erweiterteEinstellungen) => {
  let kosten = 0;
  const einstellung = erweiterteEinstellungen[verbraucher];
  const totalDauer = einstellung?.zeitraeume.reduce((sum, z) => sum + (parseFloat(z.dauer) || 0), 0) || 0;
  const nutzung = einstellung?.nutzung || 0;

  switch (verbraucher.toLowerCase()) {
    case 'waschmaschine':
      kosten = (watt  * nutzung )  * strompreis; // Align with dynamic calculation
      break;
    case 'geschirrspüler':
      kosten = (watt * totalDauer * nutzung * 52) / 1000 * strompreis;
      break;
    case 'trockner':
      kosten = (watt * totalDauer * nutzung * 52) / 1000 * strompreis;
      break;
    case 'herd':
      kosten = (watt * totalDauer * nutzung * 365) / 1000 * strompreis;
      break;
    case 'multimedia':
      kosten = (watt * totalDauer * nutzung * 365) / 1000 * strompreis;
      break;
    case 'licht':
      kosten = (watt * totalDauer * nutzung * 365) / 1000 * strompreis;
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

  // Sum total duration from all zeitraeume
  let totalDauer = 0;
  einstellung.zeitraeume.forEach(zeitraum => {
    const dauer = parseFloat(zeitraum.dauer) || 0;
    totalDauer += dauer;
  });
  if (totalDauer === 0) return 0;

  // Calculate annual cost based on consumer type
  let kosten = 0;
  if (['waschmaschine', 'geschirrspüler', 'trockner'].includes(verbraucher.toLowerCase())) {
    kosten = (watt * totalDauer * einstellung.nutzung * 52) / 1000 * strompreis; // Weekly usage
  } else if (['herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase())) {
    kosten = (watt * totalDauer * einstellung.nutzung * 365) / 1000 * strompreis; // Daily usage
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
  const stunden = Array(24).fill(0);
  Object.keys(standardVerbrauch).forEach((verbraucher) => {
    const watt = verbraucherDaten[verbraucher]?.watt || 0;
    if (watt <= 0) return;
    const isGrundlast = ['kühlschrank', 'gefrierschrank', 'aquarium'].includes(verbraucher.toLowerCase());
    const einstellung = erweiterteEinstellungen[verbraucher];
    if (isGrundlast) {
      for (let i = 0; i < 24; i++) {
        stunden[i] += watt / 1000; // Constant load in kW
      }
    } else {
      const totalDauer = einstellung?.zeitraeume.reduce((sum, zeitraum) => sum + (parseFloat(zeitraum.dauer) || 0), 0) || 0;
      if (totalDauer > 0) {
        const hourlyWatt = (watt * totalDauer) / 24 / 1000; // Spread evenly over 24 hours
        for (let i = 0; i < 24; i++) {
          stunden[i] += hourlyWatt;
        }
      }
    }
  });
  return stunden.map(val => parseFloat(val.toFixed(2)));
};

// Exportable wattage data
export const getWattageData = (verbraucherDaten, erweiterteEinstellungen) => {
  const totalWattage = calculateTotalWattage(verbraucherDaten);
  const hourlyKWConsumption = berechneStundenVerbrauch(verbraucherDaten, erweiterteEinstellungen);
  return {
    totalWattage: parseFloat(totalWattage),
    hourlyKWConsumption,
    consumers: Object.keys(verbraucherDaten).map(verbraucher => ({
      name: verbraucher,
      watt: parseFloat(verbraucherDaten[verbraucher].watt) || 0,
    })),
  };
};

// Component
export default function Home() {
  const [strompreis, setStrompreis] = useState(0.32); // Updated default to 0.32 €/kWh
  const [plz, setPlz] = useState('');
  const [verbraucherDaten, setVerbraucherDaten] = useState(
    Object.keys(standardVerbrauch).reduce((acc, key) => ({
      ...acc,
      [key]: { watt: 0, checked: false, kosten: 0 },
    }), {})
  );
  const [erweiterteEinstellungen, setErweiterteEinstellungen] = useState(
    Object.keys(standardVerbrauch).reduce((acc, key) => {
      let dauer, nutzung;
      switch (key.toLowerCase()) {
        case 'waschmaschine':
          dauer = 2;
          nutzung = 2; 
          break;
        case 'trockner':
          dauer = 1.37;
          nutzung = 2;
          break;
        case 'geschirrspüler':
          dauer = 2;
          nutzung = 7;
          break;
        case 'herd':
          dauer = 1.0;
          nutzung = 3;
          break;
        case 'multimedia':
          dauer = 3.0;
          nutzung = 3;
          break;
        case 'licht':
          dauer = 5.0;
          nutzung = 3;
          break;
        default:
          dauer = 0;
          nutzung = 0;
      }
      return {
        ...acc,
        [key]: {
          nutzung,
          zeitraeume: [{ id: Date.now() + Math.random(), dauer }],
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
    stromproduzent: true,
    batterie: true,
    grundlastverbraucher: true,
    dynamischeverbraucher: true,
  });
  const [newOptionNames, setNewOptionNames] = useState({});
  const [newOptionWatt, setNewOptionWatt] = useState({});
  const [showNewOptionForm, setShowNewOptionForm] = useState({});
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);
  const [menus, setMenus] = useState([
    {
      id: 'stromproduzent',
      label: 'Stromproduzent',
      options: [
        { name: 'Photovoltaik', specifications: 'Leistung: 5-20 kWp, Effizienz: ~20%, Lebensdauer: ~25 Jahre' },
        { name: 'Windrad', specifications: 'Leistung: 2-10 kW, Windgeschwindigkeit: 3-25 m/s' },
        { name: 'Sonstige', specifications: 'Individuelle Stromerzeugung, z.B. Wasserkraft' },
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
  ]);

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
    const parsedValue = parseFloat(value) || 0;
    if (parsedValue < 0) {
      setError(`Nutzung oder Dauer für ${verbraucher} darf nicht negativ sein.`);
      return;
    }
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: {
        ...prev[verbraucher],
        [field === 'nutzung' ? 'nutzung' : 'zeitraeume']: field === 'nutzung'
          ? parsedValue
          : prev[verbraucher].zeitraeume.map(zeitraum =>
              zeitraum.id === zeitraumId ? { ...zeitraum, dauer: parsedValue } : zeitraum
            ),
      },
    }));
    setError('');
    const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, erweiterteEinstellungen);
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
    }));
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
  };

  const addZeitraum = (verbraucher) => {
    setErweiterteEinstellungen((prev) => ({
      ...prev,
      [verbraucher]: {
        ...prev[verbraucher],
        zeitraeume: [...prev[verbraucher].zeitraeume, {
          id: Date.now() + Math.random(),
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
    const kosten = berechneDynamischenVerbrauch(verbraucherDaten[verbraucher].watt, verbraucher, strompreis, erweiterteEinstellungen);
    setVerbraucherDaten((prev) => ({
      ...prev,
      [verbraucher]: { ...prev[verbraucher], kosten: kosten.toFixed(2) },
    }));
    updateZusammenfassung(verbraucherDaten, setZusammenfassung);
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
        if (['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase())) {
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
            zeitraeume: [{ id: Date.now() + Math.random(), dauer: 0 }],
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

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Stromverbrauch (kW)',
        data: berechneStundenVerbrauch(verbraucherDaten, erweiterteEinstellungen),
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
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Verbrauch (kW)', color: '#333' }, ticks: { color: '#333' } },
      x: { title: { display: true, text: 'Uhrzeit', color: '#333' }, ticks: { color: '#333' } },
    },
  };

  return (
    <>
      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 20px auto;
          padding: 20px;
          font-family: 'Arial', sans-serif;
          background-color: #f7f7f7;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .input-container {
          margin-bottom: 20px;
        }
        .input-container label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
        }
        .input-container input {
          padding: 12px;
          width: 100%;
          max-width: 220px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .input-container input:focus {
          border-color: #2e4d2e;
          box-shadow: 0 0 5px rgba(46, 77, 46, 0.3);
          outline: none;
        }
        .menu {
          margin-bottom: 15px;
          background-color: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .menu-header {
          background-color: #2e4d2e;
          color: white;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .menu-header:hover {
          background-color: #3a613a;
        }
        .menu-content {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .triangle {
          transition: transform 0.3s;
          font-size: 14px;
        }
        .triangle.open {
          transform: rotate(180deg);
        }
        .triangle.closed {
          transform: rotate(90deg);
        }
        .checkbox-group {
          margin-bottom: 15px;
          list-style: none;
          padding: 0;
        }
        .checkbox-group-header {
          display: flex;
          align-items: center;
          font-weight: bold;
          color: #333;
          padding: 10px;
          background-color: #f0f0f0;
          border-bottom: 1px solid #ddd;
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
          padding: 10px;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        }
        .checkbox-group li:hover {
          background-color: #f0f0f0;
        }
        .checkbox-group-label {
          display: flex;
          align-items: center;
          font-size: 16px;
          color: #333;
          cursor: pointer;
          flex: 1;
          min-width: 150px;
        }
        .checkbox-group input[type="checkbox"] {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #2e4d2e;
          border-radius: 4px;
          margin-right: 10px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .checkbox-group input[type="checkbox"]:checked {
          background-color: #2e4d2e;
          border-color: #2e4d2e;
        }
        .checkbox-group input[type="checkbox"]:checked::after {
          content: '✔';
          color: white;
          font-size: 12px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .checkbox-group input[type="checkbox"]:hover {
          border-color: #3a613a;
        }
        .info-field {
          width: 80px;
          font-size: 14px;
          text-align: center;
          flex: 1;
          position: relative;
          cursor: pointer;
        }
        .info-field::before {
          content: 'ℹ';
          display: inline-block;
          width: 20px;
          height: 20px;
          line-height: 20px;
          background-color: #2e4d2e;
          color: white;
          border-radius: 50%;
          font-size: 12px;
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
          padding: 10px;
          border-radius: 6px;
          position: absolute;
          z-index: 1;
          top: -10px;
          left: 100%;
          transform: translateY(-50%);
          width: 200px;
          font-size: 12px;
          transition: opacity 0.3s;
        }
        .info-field .tooltip::before {
          content: '';
          position: absolute;
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-right-color: #333;
        }
        .settings-field {
          width: 80px;
          font-size: 14px;
          text-align: center;
          flex: 0.8;
          cursor: pointer;
        }
        .settings-field::before {
          content: '⚙️';
          display: inline-block;
          width: 20px;
          height: 20px;
          line-height: 20px;
          color: rgb(222, 82, 17);
          font-size: 16px;
          text-align: center;
          vertical-align: middle;
        }
        .input-group {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .watt-input {
          padding: 8px;
          width: 80px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          transition: border-color 0.3s;
        }
        .watt-input:focus {
          border-color: #2e4d2e;
          outline: none;
        }
        .settings-container {
          margin-top: 10px;
          padding: 15px;
          background-color: #e6f3e6;
          border: 1px solid rgb(15, 25, 223);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 100%;
        }
        .settings-input {
          padding: 8px;
          width: 100px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          transition: border-color 0.3s;
        }
        .settings-input:focus {
          border-color: #2e4d2e;
          outline: none;
        }
        .price-display {
          width: 80px;
          font-size: 14px;
          color: #333;
          text-align: center;
          flex: 1;
        }
        .delete-option-button {
          padding: 6px 12px;
          background-color: #a00;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          flex: 1;
          text-align: center;
          max-width: 80px;
        }
        .delete-option-button:hover {
          background-color: #c00;
        }
        .new-option-container {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .new-option-input {
          padding: 8px;
          width: 200px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        .new-option-input:focus {
          border-color: #2e4d2e;
          outline: none;
        }
        .new-option-watt {
          padding: 8px;
          width: 100px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
        }
        .new-option-watt:focus {
          border-color: #2e4d2e;
          outline: none;
        }
        .add-option-button,
        .save-option-button {
          padding: 10px 20px;
          background-color: #2e4d2e;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        .add-option-button:hover,
        .save-option-button:hover {
          background-color: #3a613a;
        }
        .confirm-dialog {
          margin-top: 10px;
          padding: 15px;
          background-color: #ffe6e6;
          border: 1px solid #a00;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .confirm-button {
          padding: 6px 12px;
          background-color: #a00;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .confirm-button:hover {
          background-color: #c00;
        }
        .cancel-button {
          padding: 6px 12px;
          background-color: #666;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .cancel-button:hover {
          background-color: #777;
        }
      `}</style>
      <div className="container">
        <h1 className="text-4xl font-extrabold text-center text-[#333] mb-12">Stromverbrauch Rechner</h1>
        {error && (
          <div className="confirm-dialog">{error}</div>
        )}
        <div className="input-container">
          <label htmlFor="strompreis">Strompreis (€/kWh)</label>
          <input
            type="number"
            id="strompreis"
            value={strompreis}
            step="0.01"
            min="0"
            onChange={(e) => handleStrompreisChange(e.target.value)}
            placeholder="z.B. 0.32"
            aria-label="Strompreis in € pro kWh"
          />
        </div>
        <div className="input-container">
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
                          disabled={menu.id === 'stromproduzent' || menu.id === 'batterie'}
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
                          disabled={menu.id === 'stromproduzent' || menu.id === 'batterie'}
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
                              <span>Dauer (h)</span>
                              <span>Aktion</span>
                            </li>
                            {erweiterteEinstellungen[option.name]?.zeitraeume.map((zeitraum) => (
                              <li key={zeitraum.id}>
                                <div className="input-group">
                                  <input
                                    type="number"
                                    value={erweiterteEinstellungen[option.name].nutzung || ''}
                                    step="0.01"
                                    onChange={(e) => handleErweiterteEinstellungChange(option.name, 'nutzung', e.target.value, zeitraum.id)}
                                    className="settings-input"
                                    aria-label={`Nutzung für ${option.name}`}
                                  />
                                </div>
                                <div className="input-group">
                                  <input
                                    type="number"
                                    value={zeitraum.dauer || ''}
                                    step="0.01"
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
      </div>
    </>
  );
}