'use client';

import { useState } from 'react';

export default function Home() {
  const [strompreis, setStrompreis] = useState('0.30'); // Standard-Strompreis: 0,30 €/kWh
  const [plz, setPlz] = useState('');
  const [selections, setSelections] = useState({});
  const [wattInputs, setWattInputs] = useState({});
  const [newOptionNames, setNewOptionNames] = useState({});
  const [newOptionWatt, setNewOptionWatt] = useState({});
  const [showNewOptionForm, setShowNewOptionForm] = useState({});
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);
  const [openMenus, setOpenMenus] = useState({
    stromerzeuger: true,
    stromspeicher: true,
    grundlastverbraucher: true,
    dynamischeverbraucher: true,
    elektroauto: true,
  });
  const [ladefrequenzInputs, setLadefrequenzInputs] = useState({});
  const [standardladungInputs, setStandardladungInputs] = useState({});
  const [feineEinstellungen, setFeineEinstellungen] = useState({});
  const [nutzungProWocheInputs, setNutzungProWocheInputs] = useState({});
  const [tageszeitInputs, setTageszeitInputs] = useState({});
  const [uhrzeitInputs, setUhrzeitInputs] = useState({});
  const [standardVerbraucher, setStandardVerbraucher] = useState({
    Kühlschrank: 120,        // 120 Watt
    Gefrierschrank: 200,     // 200 Watt
    Aquarium: 50,            // 50 Watt
    Waschmaschine: 1200,     // 1200 Watt
    Geschirrspüler: 600,     // 600 Watt
    Trockner: 3500,          // 3500 Watt
    Herd: 2000,              // 2000 Watt
    Multimedia: 350,         // 350 Watt
    Licht: 60,               // 60 Watt
    Batterie: 3000,          // 3000 Watt (für Elektroauto Batterie)
  });

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
        { name: 'Wärmepumpe', specifications: 'Leistung: 1-5 kW, COP: 3-5, Betrieb: saisonal' },
        { name: 'Sonstige', specifications: 'Individuelle Grundlastgeräte, z.B. Server' },
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
        { name: 'Wallbox', specifications: 'Leistung: 7-22 kW, Typ: AC, Ladezeit: 4-8h' },
      ],
    },
  ]);

  const getStrompreis = () => parseFloat(strompreis) || 0.30;

  const updateKosten = (watt, verbraucher, nutzungProWoche = 0, isCheckboxActive = true) => {
    const strompreis = getStrompreis();
    let kosten = 0;

    if (!isCheckboxActive && ['waschmaschine', 'geschirrspüler', 'trockner', 'herd', 'multimedia', 'licht'].includes(verbraucher.toLowerCase())) {
      kosten = (watt * nutzungProWoche * 52 * strompreis) / 1000; // Nutzung pro Woche, 52 Wochen, ÷ 1000
      return kosten;
    }

    switch (verbraucher.toLowerCase()) {
      case 'waschmaschine':
        kosten = (watt * 2 * 52) / 1000 * strompreis; // 2 Stunden/Woche, 52 Wochen
        break;
      case 'geschirrspüler':
        kosten = (watt * 7 * 52) / 1000 * strompreis; // 7 Stunden/Woche, 52 Wochen
        break;
      case 'trockner':
        kosten = (watt * 2 * 52) / 1000 * strompreis; // 2 Stunden/Woche, 52 Wochen
        break;
      case 'herd':
        kosten = (watt * 2 * 365) / 1000 * strompreis; // 2 Stunden/Tag, 365 Tage
        break;
      case 'multimedia':
        kosten = (watt * 3 * 365) / 1000 * strompreis; // 3 Stunden/Tag, 365 Tage
        break;
      case 'licht':
        kosten = (watt * 3 * 365) / 1000 * strompreis; // 3 Stunden/Tag, 365 Tage
        break;
      case 'batterie':
        kosten = (watt * strompreis * 250) / 1000; // 250 Ladevorgänge/Jahr
        break;
      default:
        kosten = (watt * strompreis * 24 * 365) / 1000; // Standard: 24 Stunden/Tag, 365 Tage
    }
    return kosten;
  };

  const handleSelection = (menuId, option) => {
    setSelections((prev) => {
      const currentSelections = prev[menuId] || [];
      if (currentSelections.includes(option)) {
        setWattInputs((prevWatt) => ({
          ...prevWatt,
          [menuId]: {
            ...prevWatt[menuId],
            [option]: '',
          },
        }));
        return {
          ...prev,
          [menuId]: currentSelections.filter((item) => item !== option),
        };
      } else {
        if (standardVerbraucher[option]) {
          setWattInputs((prevWatt) => ({
            ...prevWatt,
            [menuId]: {
              ...prevWatt[menuId],
              [option]: standardVerbraucher[option].toString(),
            },
          }));
        }
        return {
          ...prev,
          [menuId]: [...currentSelections, option],
        };
      }
    });
  };

  const handleWattInput = (menuId, option, value) => {
    setWattInputs((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: value },
    }));
  };

  const handleLadefrequenzInput = (menuId, option, value) => {
    setLadefrequenzInputs((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: value },
    }));
  };

  const handleStandardladungInput = (menuId, option, checked) => {
    setStandardladungInputs((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: checked },
    }));
  };

  const handleNutzungProWocheInput = (menuId, option, value) => {
    setNutzungProWocheInputs((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: value },
    }));
  };

  const handleTageszeitInput = (menuId, option, value) => {
    setTageszeitInputs((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: value },
    }));
    if (value !== 'Sonstige') {
      setUhrzeitInputs((prev) => ({
        ...prev,
        [menuId]: { ...prev[menuId], [option]: '' },
      }));
    }
  };

  const handleUhrzeitInput = (menuId, option, value) => {
    setUhrzeitInputs((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: value },
    }));
  };

  const toggleFeineEinstellungen = (menuId, option) => {
    setFeineEinstellungen((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: !prev[menuId]?.[option] },
    }));
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
    const watt = parseFloat(newOptionWatt[menuId]) || 100; // Standardwert 100 Watt, falls ungültig
    if (name && !isNaN(watt) && watt > 0) {
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === menuId
            ? {
                ...menu,
                options: [...menu.options, { name, specifications: `Leistung: ${watt} W` }],
              }
            : menu
        )
      );
      setStandardVerbraucher((prev) => ({
        ...prev,
        [name]: watt,
      }));
      setNewOptionNames((prev) => ({ ...prev, [menuId]: '' }));
      setNewOptionWatt((prev) => ({ ...prev, [menuId]: '' }));
      setShowNewOptionForm((prev) => ({ ...prev, [menuId]: false }));
    }
  };

  const handleDeleteOptionClick = (menuId, optionName) => {
    setDeleteConfirmOption({ menuId, optionName });
  };

  const confirmDeleteOption = (menuId, optionName) => {
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              options: menu.options.filter((opt) => opt.name !== optionName),
            }
          : menu
      )
    );
    setSelections((prev) => {
      const newSelections = { ...prev };
      if (newSelections[menuId]?.includes(optionName)) {
        newSelections[menuId] = newSelections[menuId].filter((opt) => opt !== optionName);
      }
      return newSelections;
    });
    setWattInputs((prev) => {
      const newWattInputs = { ...prev };
      if (newWattInputs[menuId]?.[optionName]) {
        delete newWattInputs[menuId][optionName];
      }
      return newWattInputs;
    });
    setLadefrequenzInputs((prev) => {
      const newLadefrequenzInputs = { ...prev };
      if (newLadefrequenzInputs[menuId]?.[optionName]) {
        delete newLadefrequenzInputs[menuId][optionName];
      }
      return newLadefrequenzInputs;
    });
    setStandardladungInputs((prev) => {
      const newStandardladungInputs = { ...prev };
      if (newStandardladungInputs[menuId]?.[optionName]) {
        delete newStandardladungInputs[menuId][optionName];
      }
      return newStandardladungInputs;
    });
    setNutzungProWocheInputs((prev) => {
      const newNutzungProWocheInputs = { ...prev };
      if (newNutzungProWocheInputs[menuId]?.[optionName]) {
        delete newNutzungProWocheInputs[menuId][optionName];
      }
      return newNutzungProWocheInputs;
    });
    setTageszeitInputs((prev) => {
      const newTageszeitInputs = { ...prev };
      if (newTageszeitInputs[menuId]?.[optionName]) {
        delete newTageszeitInputs[menuId][optionName];
      }
      return newTageszeitInputs;
    });
    setUhrzeitInputs((prev) => {
      const newUhrzeitInputs = { ...prev };
      if (newUhrzeitInputs[menuId]?.[optionName]) {
        delete newUhrzeitInputs[menuId][optionName];
      }
      return newUhrzeitInputs;
    });
    setFeineEinstellungen((prev) => {
      const newFeineEinstellungen = { ...prev };
      if (newFeineEinstellungen[menuId]?.[optionName]) {
        delete newFeineEinstellungen[menuId][optionName];
      }
      return newFeineEinstellungen;
    });
    setStandardVerbraucher((prev) => {
      const newStandardVerbraucher = { ...prev };
      delete newStandardVerbraucher[optionName];
      return newStandardVerbraucher;
    });
    setDeleteConfirmOption(null);
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

  const calculatePrice = (menuId, optionName) => {
    const isCheckboxActive = selections[menuId]?.includes(optionName) || false;
    const watt = parseFloat(wattInputs[menuId]?.[optionName] || 0);
    const nutzungProWoche = parseFloat(nutzungProWocheInputs[menuId]?.[optionName] || 0);

    if (isNaN(watt) || watt <= 0) return '-';
    if (menuId === 'dynamischeverbraucher' && !isCheckboxActive) {
      if (isNaN(nutzungProWoche) || nutzungProWoche <= 0) return '-';
      const kosten = updateKosten(watt, optionName, nutzungProWoche, false);
      return kosten.toFixed(2) + ' €';
    }
    if (!isCheckboxActive) return '-';
    const kosten = updateKosten(watt, optionName);
    return kosten.toFixed(2) + ' €';
  };

  return (
    <div>
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
        .checkbox-group-header span.elektroauto-extra, .checkbox-group-header span.dynamischeverbraucher-extra {
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
          content: '⚙';
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
        .ladefrequenz-input {
          padding: 8px;
          width: 80px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          transition: border-color 0.3s;
          flex: 0.8;
        }
        .ladefrequenz-input:focus {
          border-color: #2e4d2e;
          outline: none;
        }
        .standardladung-checkbox {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #2e4d2e;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s, border-color 0.2s;
          flex: 0.8;
          margin: 0 auto;
        }
        .standardladung-checkbox:checked {
          background-color: #2e4d2e;
          border-color: #2e4d2e;
        }
        .standardladung-checkbox:checked::after {
          content: '✔';
          color: white;
          font-size: 12px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .standardladung-checkbox:hover {
          border-color: #3a613a;
        }
        .settings-container {
          margin-top: 10px;
          padding: 15px;
          background-color: #e6f3e6;
          border: 1px solid #2e4d2e;
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
        .uhrzeit-input {
          padding: 8px;
          width: 120px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }
        .uhrzeit-input:focus {
          border-color: #2e4d2e;
          outline: none;
        }
        .radio-group-settings {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .radio-group-settings label {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #333;
          cursor: pointer;
        }
        .radio-group-settings input[type="radio"] {
          appearance: none;
          width: 16px;
          height: 16px;
          border: 2px solid #2e4d2e;
          border-radius: 50%;
          margin-right: 8px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .radio-group-settings input[type="radio"]:checked {
          background-color: #2e4d2e;
          border-color: #2e4d2e;
        }
        .radio-group-settings input[type="radio"]:checked::after {
          content: '';
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .radio-group-settings input[type="radio"]:hover {
          border-color: #3a613a;
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
        <div className="input-container">
          <label htmlFor="strompreis">Aktueller Strompreis (€/kWh):</label>
          <input
            type="number"
            id="strompreis"
            step="0.01"
            placeholder="z.B. 0.30"
            value={strompreis}
            onChange={(e) => setStrompreis(e.target.value)}
            className="input"
          />
        </div>
        <div className="input-container">
          <label htmlFor="plz">Postleitzahl (PLZ):</label>
          <input
            type="text"
            id="plz"
            placeholder="z.B. 80331"
            value={plz}
            onChange={(e) => setPlz(e.target.value)}
            className="input"
          />
        </div>

        {menus.map((menu) => (
          <div key={menu.id} className="menu">
            <div className="menu-header" onClick={() => toggleMenu(menu.id)}>
              <span>{menu.label}</span>
              <span className={`triangle ${openMenus[menu.id] ? 'open' : 'closed'}`}>
                {openMenus[menu.id] ? '▼' : '▶'}
              </span>
            </div>
            {openMenus[menu.id] && (
              <div className="menu-content">
                <div className="checkbox-group-header">
                  <span>Auswahl</span>
                  <span>Info</span>
                  <span>Watt Eingabe</span>
                  {menu.id === 'elektroauto' && <span className="elektroauto-extra">Ladefrequenz/Woche</span>}
                  {menu.id === 'elektroauto' && <span className="elektroauto-extra">Standardladung</span>}
                  {menu.id === 'dynamischeverbraucher' && <span className="dynamischeverbraucher-extra">Einstellungen</span>}
                  <span>Preis</span>
                  <span>Aktion</span>
                </div>
                <ul className="checkbox-group">
                  {menu.options.map((option) => (
                    <li key={option.name}>
                      <label className="checkbox-group-label">
                        <input
                          type="checkbox"
                          name={menu.id}
                          value={option.name}
                          checked={selections[menu.id]?.includes(option.name) || false}
                          onChange={() => handleSelection(menu.id, option.name)}
                        />
                        {option.name}
                      </label>
                      <span className="info-field">
                        <span className="tooltip">{option.specifications}</span>
                      </span>
                      <div className="input-group">
                        <input
                          type="number"
                          placeholder="W"
                          step="1"
                          className="watt-input"
                          value={wattInputs[menu.id]?.[option.name] || ''}
                          onChange={(e) => handleWattInput(menu.id, option.name, e.target.value)}
                        />
                      </div>
                      {menu.id === 'elektroauto' && (
                        <div className="input-group">
                          <input
                            type="number"
                            placeholder="z.B. 2"
                            step="1"
                            className="ladefrequenz-input"
                            value={ladefrequenzInputs[menu.id]?.[option.name] || ''}
                            onChange={(e) => handleLadefrequenzInput(menu.id, option.name, e.target.value)}
                          />
                        </div>
                      )}
                      {menu.id === 'elektroauto' && (
                        <div className="input-group">
                          <input
                            type="checkbox"
                            className="standardladung-checkbox"
                            checked={standardladungInputs[menu.id]?.[option.name] || false}
                            onChange={(e) => handleStandardladungInput(menu.id, option.name, e.target.checked)}
                          />
                        </div>
                      )}
                      {menu.id === 'dynamischeverbraucher' && (
                        <span
                          className="settings-field"
                          onClick={() => toggleFeineEinstellungen(menu.id, option.name)}
                        />
                      )}
                      <span className="price-display">{calculatePrice(menu.id, option.name)}</span>
                      <button
                        className="delete-option-button"
                        onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                      >
                        Löschen
                      </button>
                      {feineEinstellungen[menu.id]?.[option.name] && menu.id === 'dynamischeverbraucher' && (
                        <div className="settings-container">
                          <label>
                            Nutzung pro Woche (Stunden):
                            <input
                              type="number"
                              placeholder="z.B. 5"
                              step="0.1"
                              className="settings-input"
                              value={nutzungProWocheInputs[menu.id]?.[option.name] || ''}
                              onChange={(e) => handleNutzungProWocheInput(menu.id, option.name, e.target.value)}
                            />
                          </label>
                          <div className="radio-group-settings">
                            {['Vormittag', 'Mittag', 'Nachmittag', 'Abend', 'Nacht', 'Sonstige'].map((tageszeit) => (
                              <label key={tageszeit}>
                                <input
                                  type="radio"
                                  name={`tageszeit-${menu.id}-${option.name}`}
                                  value={tageszeit}
                                  checked={tageszeitInputs[menu.id]?.[option.name] === tageszeit}
                                  onChange={(e) => handleTageszeitInput(menu.id, option.name, e.target.value)}
                                />
                                {tageszeit}
                              </label>
                            ))}
                          </div>
                          {tageszeitInputs[menu.id]?.[option.name] === 'Sonstige' && (
                            <label>
                              Genaue Uhrzeit:
                              <input
                                type="time"
                                className="uhrzeit-input"
                                value={uhrzeitInputs[menu.id]?.[option.name] || ''}
                                onChange={(e) => handleUhrzeitInput(menu.id, option.name, e.target.value)}
                              />
                            </label>
                          )}
                        </div>
                      )}
                      {deleteConfirmOption?.menuId === menu.id &&
                        deleteConfirmOption?.optionName === option.name && (
                          <div className="confirm-dialog">
                            <span>Option "{option.name}" wirklich löschen?</span>
                            <button
                              className="confirm-button"
                              onClick={() => confirmDeleteOption(menu.id, option.name)}
                            >
                              Ja
                            </button>
                            <button
                              className="cancel-button"
                              onClick={cancelDeleteOption}
                            >
                              Nein
                            </button>
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
                {showNewOptionForm[menu.id] && (
                  <div className="new-option-container">
                    <input
                      type="text"
                      placeholder="Neuer Option Name"
                      className="new-option-input"
                      value={newOptionNames[menu.id] || ''}
                      onChange={(e) => handleNewOptionName(menu.id, e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Standard W"
                      step="1"
                      className="new-option-watt"
                      value={newOptionWatt[menu.id] || ''}
                      onChange={(e) => handleNewOptionWatt(menu.id, e.target.value)}
                    />
                    <button
                      className="save-option-button"
                      onClick={() => addNewOption(menu.id)}
                    >
                      Speichern
                    </button>
                  </div>
                )}
                <button
                  className="add-option-button"
                  onClick={() => toggleNewOptionForm(menu.id)}
                >
                  {showNewOptionForm[menu.id] ? 'Abbrechen' : 'Neue Option hinzufügen'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}