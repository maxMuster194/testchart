import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faDollarSign, faCalculator, faInfoCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const menuKlick = (item, sectionId) => {
    alert(`Du hast ${item} im Menü geklickt!`);
    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleImportClick = () => {
    alert('Import-Funktion ausgelöst!');
  };

  return (
    <>
      <style jsx>{`
        body {
          margin: 0;
          font-family: 'Roboto', Arial, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          color: #333;
        }

        .top-box {
          width: 100%;
          max-width: 2000px;
          margin: 0 auto;
          background: linear-gradient(90deg, rgb(3, 160, 129), rgb(0, 200, 150));
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          font-size: 28px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        .logo {
          width: 120px;
          height: 70px;
          margin-left: 50px;
          object-fit: contain;
          cursor: pointer;
          position: relative; /* Ermöglicht Verschiebung */
          top: -15px; /* Ändere diesen Wert für Verschiebung: z.B. -10px (nach oben), 10px (nach unten) */
        }

        .logo:hover {
          transform: scale(1.1);
        }

        .header-text {
          margin-right: 30px;
          font-weight: 700;
        }

        .sidebar {
          width: 60px;
          background-color: #ffffff;
          color: rgb(3, 160, 129);
          padding: 15px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: fixed;
          top: 70px;
          height: calc(100vh - 70px);
          left: 0;
          z-index: 998;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }

        .sidebar div {
          margin: 20px 0;
          font-size: 26px;
          cursor: pointer;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .sidebar div:hover {
          color: rgb(0, 100, 80);
          transform: scale(1.2);
        }

        .main-content {
          margin-left: 60px;
          margin-top: 70px;
          flex: 1;
          display: flex;
          flex-direction: row;
          justify-content: center;
          padding: 40px 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          min-height: calc(100vh - 110px);
        }

        .content-section {
          width: 100%;
          max-width: 500px;
          background: transparent;
          padding: 30px;
          border: none;
          box-shadow: none;
          margin-right: 20px;
        }

        .dirgam-section {
          width: 100%;
          max-width: 500px;
          background: #ffffff;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .dirgam-section:hover {
          transform: translateY(-5px);
        }

        .dirgam-section h2 {
          font-size: 32px;
          color: rgb(3, 160, 129);
          margin-bottom: 20px;
          font-weight: 700;
          text-align: center;
        }

        .content-section h2 {
          font-size: 32px;
          color: rgb(3, 160, 129);
          margin-bottom: 20px;
          font-weight: 700;
          text-align: center;
        }

        .content-section h3 {
          font-size: 22px;
          color: #333;
          margin: 20px 0 10px;
          font-weight: 600;
        }

        .content-section p {
          font-size: 16px;
          line-height: 1.7;
          color: #555;
          margin: 10px 0;
        }

        .content-section ul {
          list-style-type: disc;
          padding-left: 25px;
          font-size: 16px;
          line-height: 1.7;
          color: #555;
          margin: 10px 0;
        }

        .import-button {
          background: rgb(3, 160, 129);
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 18px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 25px;
          transition: background 0.3s ease, transform 0.3s ease;
          font-weight: 600;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .import-button:hover {
          background: rgb(0, 100, 80);
          transform: scale(1.05);
        }

        .footer-box {
          width: 100%;
          max-width: 2000px;
          margin: 0 auto;
          background: linear-gradient(90deg, rgb(3, 160, 129), rgb(0, 200, 150));
          color: white;
          text-align: center;
          padding: 20px;
          font-size: 18px;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 999;
          box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 50px;
            padding: 20px;
            flex-direction: column;
          }
          .sidebar {
            width: 50px;
          }
          .content-section,
          .dirgam-section {
            padding: 20px;
            margin-right: 0;
            margin-bottom: 20px;
          }
          .content-section h2,
          .dirgam-section h2 {
            font-size: 28px;
          }
          .content-section h3 {
            font-size: 20px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="top-box">
        <img
          src="/bilder/logo.png"
          alt="Logo"
          className="logo"
          onClick={() => menuKlick('Home', 'main-content')}
        />
        <span className="header-text">Header Bild</span>
      </div>

      {/* Menüleiste links */}
      <div className="sidebar">
        <div onClick={() => menuKlick('Home', 'main-content')} title="Home">
          <FontAwesomeIcon icon={faHouse} />
        </div>
        <div onClick={() => menuKlick('Preis')} title="Preis">
          <FontAwesomeIcon icon={faDollarSign} />
        </div>
        <div onClick={() => menuKlick('Rechner')} title="Rechner">
          <FontAwesomeIcon icon={faCalculator} />
        </div>
        <div onClick={() => menuKlick('Details')} title="Details">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div onClick={() => menuKlick('Hilfe')} title="Hilfe">
          <FontAwesomeIcon icon={faQuestionCircle} />
        </div>
      </div>

      {/* Hauptinhalt */}
      <div className="main-content" id="main-content">
        <div className="content-section">
          <h2></h2>
          
        </div>

        
        
      </div>

      {/* Footer */}
      <div className="footer-box">© 2025 Energie Dashboard</div>
    </>
  );
};

export default Home;