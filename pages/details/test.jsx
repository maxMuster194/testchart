import React from 'react';

// Inhalte der Boxen (bearbeitbar)
const boxLinksContent = 'Linke Box (Hälfte der Seite, ganze Höhe)';
const boxRechtsObenContent = 'Oben rechts';
const boxRechtsUntenContent = 'Unten rechts';

const Grid = () => {
  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100vh;
          width: 100vw;
          box-sizing: border-box;
          overflow: hidden; /* Verhindert Scrollbalken */
        }

        .grid-container {
          display: grid;
          grid-template-columns: 1fr 5fr; /* Rechte Spalte deutlich breiter */
          grid-template-rows: 1fr 1fr; /* Gleiche Höhe für rechte Boxen */
          height: 100vh; /* Füllt gesamte Höhe des Viewports */
          width: 100vw; /* Füllt gesamte Breite des Viewports */
          padding: 2px; /* 2px Abstand zum Rand */
          border: 2px solid black; /* Border von outer-wrapper übernommen */
          gap: 20px; /* 20px Abstand zwischen Boxen */
          box-sizing: border-box;
        }

        .box-links {
          grid-row: 1 / 3;
          background-color: #3498db;
          padding: 20px;
          color: white;
          box-sizing: border-box;
        }

        .box-rechts-oben {
          background-color: #2ecc71;
          padding: 40px; /* Erhöhtes Padding für größeres Erscheinungsbild */
          color: white;
          box-sizing: border-box;
        }

        .box-rechts-unten {
          background-color: #e74c3c;
          padding: 40px; /* Erhöhtes Padding für größeres Erscheinungsbild */
          color: white;
          box-sizing: border-box;
        }
      `}</style>
      <div className="grid-container">
        <div className="box-links">{boxLinksContent}</div>
        <div className="box-rechts-oben">{boxRechtsObenContent}</div>
        <div className="box-rechts-unten">{boxRechtsUntenContent}</div>
      </div>
    </>
  );
};

export default Grid;