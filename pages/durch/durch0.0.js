import React, { useState } from 'react';

function App() {
  const [monate, setMonate] = useState([
    { name: 'Januar', verbrauch: 300, kosten: 90, details: { strompreis: 0.3 } },
    { name: 'Februar', verbrauch: 280, kosten: 84, details: { strompreis: 0.3 } },
    { name: 'März', verbrauch: 320, kosten: 96, details: { strompreis: 0.3 } },
    { name: 'April', verbrauch: 250, kosten: 75, details: { strompreis: 0.3 } },
    { name: 'Mai', verbrauch: 240, kosten: 72, details: { strompreis: 0.3 } },
    { name: 'Juni', verbrauch: 230, kosten: 69, details: { strompreis: 0.3 } },
    { name: 'Juli', verbrauch: 220, kosten: 66, details: { strompreis: 0.3 } },
    { name: 'August', verbrauch: 210, kosten: 63, details: { strompreis: 0.3 } },
    { name: 'September', verbrauch: 230, kosten: 69, details: { strompreis: 0.3 } },
    { name: 'Oktober', verbrauch: 260, kosten: 78, details: { strompreis: 0.3 } },
    { name: 'November', verbrauch: 290, kosten: 87, details: { strompreis: 0.3 } },
    { name: 'Dezember', verbrauch: 310, kosten: 93, details: { strompreis: 0.3 } }
  ]);
  const [verbrauchInput, setVerbrauchInput] = useState('');
  const [zeitraum, setZeitraum] = useState('monatlich');
  const [selectedMonat, setSelectedMonat] = useState(null);

  const handleBerechnen = () => {
    const verbrauch = parseFloat(verbrauchInput);
    const strompreis = 0.3;

    if (isNaN(verbrauch) || verbrauch <= 0) {
      alert('Bitte einen gültigen Verbrauchswert eingeben.');
      return;
    }

    let monatlicherVerbrauch;
    if (zeitraum === 'täglich') {
      monatlicherVerbrauch = verbrauch * 30;
    } else if (zeitraum === 'jährlich') {
      monatlicherVerbrauch = verbrauch / 12;
    } else {
      monatlicherVerbrauch = verbrauch;
    }

    const updatedMonate = monate.map(monat => ({
      ...monat,
      verbrauch: Math.round(monatlicherVerbrauch),
      kosten: Math.round(monatlicherVerbrauch * strompreis),
      details: { strompreis }
    }));

    setMonate(updatedMonate);
  };

  const showModal = (index) => {
    setSelectedMonat(monate[index]);
  };

  const closeModal = () => {
    setSelectedMonat(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-5xl font-extrabold text-center mb-10 text-blue-800">
        Verbrauchsübersicht 2025
      </h1>

      {/* Eingabefeld */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto">
        <label htmlFor="verbrauchInput" className="block text-lg font-medium text-gray-700 mb-2">
          Verbrauch eingeben:
        </label>
        <div className="flex space-x-4">
          <input
            type="number"
            id="verbrauchInput"
            placeholder="z. B. 300 kWh"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={verbrauchInput}
            onChange={(e) => setVerbrauchInput(e.target.value)}
          />
          <select
            id="zeitraum"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={zeitraum}
            onChange={(e) => setZeitraum(e.target.value)}
          >
            <option value="monatlich">Monatlich</option>
            <option value="täglich">Täglich</option>
            <option value="jährlich">Jährlich</option>
          </select>
        </div>
        <button
          className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
          onClick={handleBerechnen}
        >
          Kosten berechnen
        </button>
      </div>

      {/* Grid für die Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {monate.map((monat, index) => (
          <div
            key={monat.name}
            className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer card-hover"
            onClick={() => showModal(index)}
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-700">{monat.name}</h2>
            <p className="text-gray-600">Ø Verbrauch: {monat.verbrauch} kWh</p>
            <p className="text-gray-600">Ø Kosten: {monat.kosten} €</p>
          </div>
        ))}
      </div>

      {/* Modal für Detailansicht */}
      {selectedMonat && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">{selectedMonat.name} 2025</h2>
            <p className="text-gray-600 mb-2">Ø Verbrauch: {selectedMonat.verbrauch} kWh</p>
            <p className="text-gray-600 mb-4">Ø Kosten: {selectedMonat.kosten} €</p>
            <div className="text-gray-600">
              <p>Strompreis pro kWh: {selectedMonat.details.strompreis} €</p>
            </div>
            <button
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              onClick={closeModal}
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* CSS within the component using styled-jsx */}
      <style jsx>{`
        /* General container styling */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
          background-color: #f4f7fa;
          min-height: 100vh;
        }

        /* Heading styling */
        h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e40af;
          text-align: center;
          margin-bottom: 2.5rem;
          letter-spacing: -0.025em;
        }

        /* Input section styling */
        .mb-8 {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 32rem;
          margin-left: auto;
          margin-right: auto;
          transition: transform 0.2s ease-in-out;
        }

        .mb-8:hover {
          transform: translateY(-4px);
        }

        /* Label styling */
        label {
          display: block;
          font-size: 1.125rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        /* Input and select styling */
        input[type="number"],
        select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        input[type="number"]:focus,
        select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        /* Flex container for input and select */
        .flex.space-x-4 {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        /* Button styling */
        button {
          width: 100%;
          padding: 0.75rem;
          background-color: #2563eb;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.2s;
        }

        button:hover {
          background-color: #1e40af;
          transform: translateY(-2px);
        }

        button:active {
          transform: translateY(0);
        }

        /* Grid for cards */
        .grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        }

        /* Card styling */
        .card-hover {
          background-color: #ffffff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .card-hover h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 1rem;
        }

        .card-hover p {
          font-size: 1rem;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }

        /* Modal styling */
        .fixed.inset-0 {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(75, 85, 99, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .fixed.inset-0 > div {
          background-color: #ffffff;
          padding: 2rem;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
          max-width: 28rem;
          width: 100%;
          animation: fadeIn 0.3s ease-in-out;
        }

        /* Modal heading */
        .fixed.inset-0 h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 1rem;
        }

        /* Modal text */
        .fixed.inset-0 p {
          font-size: 1rem;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }

        /* Modal button */
        .fixed.inset-0 button {
          margin-top: 1.5rem;
          padding: 0.5rem 1rem;
          background-color: #2563eb;
          color: #ffffff;
          border-radius: 0.5rem;
          transition: background-color 0.2s, transform 0.2s;
        }

        .fixed.inset-0 button:hover {
          background-color: #1e40af;
          transform: translateY(-2px);
        }

        /* Animation for modal */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          h1 {
            font-size: 2rem;
          }

          .mb-8 {
            padding: 1rem;
          }

          .flex.space-x-4 {
            flex-direction: column;
            gap: 0.5rem;
          }

          input[type="number"],
          select {
            width: 100%;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default App;