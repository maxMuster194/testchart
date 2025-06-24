'use client';

import { useState } from 'react';

export default function Home() {
  const [strompreis, setStrompreis] = useState('');
  const [plz, setPlz] = useState('');
  const [selections, setSelections] = useState({});
  const [kwInputs, setKwInputs] = useState({});
  const [newOptionNames, setNewOptionNames] = useState({});
  const [newOptionKw, setNewOptionKw] = useState({});
  const [showNewOptionForm, setShowNewOptionForm] = useState({});
  const [deleteConfirmOption, setDeleteConfirmOption] = useState(null);
  const [openMenus, setOpenMenus] = useState({
    stromerzeuger: true,
    stromspeicher: true,
    grundlastverbraucher: true,
    dynamischeverbraucher: true,
    elektroauto: true,
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
        { name: 'Option 1', specifications: 'Flexibler Verbraucher, z.B. Waschmaschine' },
        { name: 'Option 2', specifications: 'Flexibler Verbraucher, z.B. Trockner' },
        { name: 'Sonstige', specifications: 'Individuelle dynamische Verbraucher' },
      ],
    },
    {
      id: 'elektroauto',
      label: 'Elektroauto',
      options: [
        { name: 'Ladestation 1', specifications: 'Leistung: 7.4 kW, Typ: AC, Ladezeit: ~6-8h' },
        { name: 'Ladestation 2', specifications: 'Leistung: 11 kW, Typ: AC, Ladezeit: ~4-6h' },
        { name: 'Sonstige', specifications: 'Individuelle Ladelösungen, z.B. DC-Schnellladung' },
      ],
    },
  ]);

  const handleSelection = (menuId, option) => {
    setSelections((prev) => {
      if (prev[menuId] === option) {
        const newSelections = { ...prev };
        delete newSelections[menuId];
        return newSelections;
      }
      return { ...prev, [menuId]: option };
    });
  };

  const handleKwInput = (menuId, option, value) => {
    setKwInputs((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [option]: value },
    }));
  };

  const handleNewOptionName = (menuId, value) => {
    setNewOptionNames((prev) => ({ ...prev, [menuId]: value }));
  };

  const handleNewOptionKw = (menuId, value) => {
    setNewOptionKw((prev) => ({ ...prev, [menuId]: value }));
  };

  const toggleNewOptionForm = (menuId) => {
    setShowNewOptionForm((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const addNewOption = (menuId) => {
    const name = newOptionNames[menuId]?.trim();
    const kw = newOptionKw[menuId] || '1.0';
    if (name) {
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === menuId
            ? {
                ...menu,
                options: [...menu.options, { name, specifications: 'Individuelle Spezifikationen' }],
              }
            : menu
        )
      );
      setNewOptionNames((prev) => ({ ...prev, [menuId]: '' }));
      setNewOptionKw((prev) => ({ ...prev, [menuId]: '' }));
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
      if (newSelections[menuId] === optionName) {
        delete newSelections[menuId];
      }
      return newSelections;
    });
    setKwInputs((prev) => {
      const newKwInputs = { ...prev };
      if (newKwInputs[menuId]?.[optionName]) {
        delete newKwInputs[menuId][optionName];
      }
      return newKwInputs;
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
    const kw = parseFloat(kwInputs[menuId]?.[optionName] || 0);
    const pricePerKwh = parseFloat(strompreis || 0);
    if (isNaN(kw) || isNaN(pricePerKwh)) return '-';
    return (kw * pricePerKwh).toFixed(2) + ' €';
  };

  return (
    <div>
      <style jsx>{`
        .container {
          max-width: 800px;
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
        .radio-group {
          margin-bottom: 15px;
          list-style: none;
          padding: 0;
        }
        .radio-group-header {
          display: flex;
          align-items: center;
          font-weight: bold;
          color: #333;
          padding: 10px;
          background-color: #f0f0f0;
          border-bottom: 1px solid #ddd;
        }
        .radio-group-header span {
          flex: 1;
          text-align: center;
        }
        .radio-group li {
          display: flex;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        }
        .radio-group li:hover {
          background-color: #f0f0f0;
        }
        .radio-group-label {
          display: flex;
          align-items: center;
          font-size: 16px;
          color: #333;
          cursor: pointer;
          flex: 1;
          min-width: 150px;
        }
        .radio-group input[type="checkbox"] {
          appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #2e4d2e;
          border-radius: 50%;
          margin-right: 10px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .radio-group input[type="checkbox"]:checked {
          background-color: #2e4d2e;
          border-color: #2e4d2e;
        }
        .radio-group input[type="checkbox"]:checked::after {
          content: '✔';
          color: white;
          font-size: 12px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .radio-group input[type="checkbox"]:hover {
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
        .input-group {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .kw-input {
          padding: 8px;
          width: 80px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          transition: border-color 0.3s;
        }
        .kw-input:focus {
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
        .new-option-kw {
          padding: 8px;
          width: 100px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
        }
        .new-option-kw:focus {
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
                <div className="radio-group-header">
                  <span>Auswahl</span>
                  <span>Info</span>
                  <span>kW Eingabe</span>
                  <span>Preis</span>
                  <span>Aktion</span>
                </div>
                <ul className="radio-group">
                  {menu.options.map((option) => (
                    <li key={option.name}>
                      <label className="radio-group-label">
                        <input
                          type="checkbox"
                          name={menu.id}
                          value={option.name}
                          checked={selections[menu.id] === option.name}
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
                          placeholder="kW"
                          step="0.1"
                          className="kw-input"
                          value={kwInputs[menu.id]?.[option.name] || ''}
                          onChange={(e) => handleKwInput(menu.id, option.name, e.target.value)}
                        />
                      </div>
                      <span className="price-display">{calculatePrice(menu.id, option.name)}</span>
                      <button
                        className="delete-option-button"
                        onClick={() => handleDeleteOptionClick(menu.id, option.name)}
                      >
                        Löschen
                      </button>
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
                      placeholder="Standard kW"
                      step="0.1"
                      className="new-option-kw"
                      value={newOptionKw[menu.id] || ''}
                      onChange={(e) => handleNewOptionKw(menu.id, e.target.value)}
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