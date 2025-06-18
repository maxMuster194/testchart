import React from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Dypreis0 from '../dynamisch/dypreis0.js';

const Home = () => {
  const router = useRouter();

  const menuKlick = (item) => {
    const routes = {
      Home: '/final/test',
      Preis: '/final/preis',
      Rechner: '/final/rechner',
      Details: '/final/details',
      Hilfe: '/final/hilfe',
    };
    router.push(routes[item] || '/');
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
          max-width: 3000px;
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
          position: relative;
          top: -15px;
        }

        .logo:hover {
          transform: scale(1.1);
        }

        .header-text {
          margin-right: 30px;
          font-weight: 700;
        }

        .sidebar {
          width: 80px;
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
          margin-top: 30px;
        }

        .sidebar .icon-container {
          margin: 15px 0;
          cursor: pointer;
          transition: color 0.3s ease, transform 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sidebar .icon-container:hover {
          color: rgb(0, 100, 80);
          transform: scale(1.2);
        }

        .sidebar .icon-container .icon {
          font-size: 26px;
          margin-bottom: 5px;
        }

        .sidebar .icon-container .icon-label {
          font-size: 12px;
          color: rgb(3, 160, 129);
          transition: color 0.3s ease;
        }

        .sidebar .icon-container:hover .icon-label {
          color: rgb(0, 100, 80);
        }

        .main-content {
          margin-left: 80px;
          margin-top: 70px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          min-height: calc(100vh - 110px);
        }

        .main-content h2 {
          font-size: 32px;
          color: rgb(3, 160, 129);
          margin-bottom: 10px;
          font-weight: 700;
          text-align: center;
        }

        .header-text {
          font-size: 16px;
          color: #333;
          margin-bottom: 15px;
          text-align: center;
        }

        .header-button {
          background: rgb(3, 160, 129);
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .header-button:hover {
          background: rgb(0, 100, 80);
          transform: scale(1.05);
        }

        .header-button .chart-icon {
          font-size: 16px;
        }

        .section-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 900px;
          margin-bottom: 20px;
        }

        .content-section {
          width: 100%;
          max-width: 400px;
          background: transparent;
          padding: 30px;
          border: none;
          box-shadow: none;
        }

        .calculation-prompt {
          background: rgba(0, 0, 0, 0.05);
          padding: 20px;
          border-radius: 8px;
          margin: 20px auto;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .calculation-prompt p {
          font-size: 16px;
          line-height: 1.7;
          color: #333;
          margin: 0 0 15px 0;
        }

        .calculation-button {
          background: rgb(3, 160, 129);
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          font-weight: 600;
          display: inline-block;
        }

        .calculation-button:hover {
          background: rgb(0, 100, 80);
          transform: scale(1.05);
        }

        .dirgam-section {
          width: 100%;
          max-width: 500px;
          background: transparent;
          padding: 30px;
          border: none;
          box-shadow: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dirgam-section h2 {
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
          max-width: 3000px;
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
            margin-left: 80px;
            padding: 20px;
            flex-direction: column;
          }
          .section-container {
            flex-direction: column;
            align-items: center;
          }
          .content-section,
          .dirgam-section {
            padding: 20px;
            margin-right: 0;
            margin-bottom: 20px;
            max-width: 100%;
          }
          .content-section h2,
          .dirgam-section h2 {
            font-size: 28px;
          }
          .content-section h3 {
            font-size: 20px;
          }
          .calculation-prompt {
            max-width: 100%;
          }
          .sidebar {
            width: 70px;
          }
          .sidebar .icon-container .icon-label {
            font-size: 10px;
          }
          .header-button {
            padding: 8px 16px;
            font-size: 14px;
          }
          .header-button .chart-icon {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="modules">
        <div className="top-box">
          <img
            src="/bilder/logo.png"
            alt="Logo"
            className="logo"
            onClick={() => menuKlick('Home')}
          />
          <span className="header-text">Header Bild</span>
        </div>

        <div className="sidebar">
          <div className="icon-container" onClick={() => menuKlick('Home')} title="Home">
            <FontAwesomeIcon icon={faHouse} className="icon" />
            <span className="icon-label">Home</span>
          </div>
          <div className="icon-container" onClick={() => menuKlick('Preis')} title="Preis">
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <span className="icon-label">Preis</span>
          </div>
          <div className="icon-container" onClick={() => menuKlick('Rechner')} title="Rechner">
            <FontAwesomeIcon icon={faCalculator} className="icon" />
            <span className="icon-label">Rechner</span>
          </div>
          <div className="icon-container" onClick={() => menuKlick('Details')} title="Details">
            <FontAwesomeIcon icon={faFileLines} className="icon" />
            <span className="icon-label">Details</span>
          </div>
          <div className="icon-container" onClick={() => menuKlick('Hilfe')} title="Hilfe">
            <FontAwesomeIcon icon={faQuestionCircle} className="icon" />
            <span className="icon-label">Hilfe</span>
          </div>
        </div>

        <div className="main-content" id="main-content">
          <h2> Rechner </h2>

          <p className="header-text"></p>
          
          <div className="section-container">
            <div className="content-section">
             
            </div>

            <div className="dirgam-section">
              
            </div>
          </div>

          <div className="calculation-prompt">
          
          </div>
        </div>

        <div className="footer-box">© 2025 Energie Dashboard</div>
      </div>
    </>
  );
};

export default Home;