'use client';

export default function Home() {
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
          gap: 40px;
          justify-content: center; /* Zentriert den Inhalt */
          flex-wrap: nowrap;
        }

        .calculation-report {
          width: 800px;
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .report-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .report-content p {
          color: #4b5563;
        }

        .diagrams-container {
          width: 800px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .diagram {
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
          box-sizing: border-box;
        }

        .diagram-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .diagram-placeholder {
          width: 752px;
          height: 600px;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .diagram-placeholder p {
          color: #6b7280;
        }
      `}} />
      <div className="app-container">
        <div className="container">
          {/* Linker Bereich: Rechenbericht */}
          <div className="calculation-report">
            <h2 className="report-title">Rechenbericht</h2>
            <div className="report-content">
              <p>
                Hier wird der Rechenbericht angezeigt. Fügen Sie Ihre Berechnungen oder Daten hier ein.
              </p>
            </div>
          </div>
          {/* Rechter Bereich: Diagramme */}
          <div className="diagrams-container">
            <div className="diagram">
              <h3 className="diagram-title">Diagramm 1</h3>
              <div className="diagram-placeholder">
                <p>Platzhalter Diagramm 1 (800x600px)</p>
              </div>
            </div>
            <div className="diagram">
              <h3 className="diagram-title">Diagramm 2</h3>
              <div className="diagram-placeholder">
                <p>Platzhalter Diagramm 2 (800x600px)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
