import React from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Dypreis0 from '../dynamisch/dypreis0.js';

const Home = () => {
  const router = useRouter();

  const menuKlick = (item) => {
    const routes = {
      Home: '/EWR/startseite',
      Preis: '/EWR/preis',
      Rechner: '/EWR/rechner',
      Details: '/EWR/details',
      Hilfe: '/EWR/hilfe',
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
          background: url('/bilder/.jpg') no-repeat center/cover, linear-gradient(90deg, rgb(217,4,61), rgb(5,166,150));
          display: flex;
          align-items: flex-start;
          padding: 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
          height: 130px;
          pointer-events: none;
        }

        .logo {
          width: 250px;
          height: 95px;
          position: absolute;
          left: 20px;
          top: 0;
          object-fit: contain;
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.1);
        }

        .header-text-top {
          margin-right: 30px;
          font-size: 28px;
          font-weight: 700;
          color: white;
          align-self: center;
          pointer-events: auto;
        }

        .sidebar {
          width: 80px;
          background-color: #ffffff;
          color: rgb(5,166,150);
          padding: 15px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: fixed;
          top: 130px;
          height: calc(100vh - 130px);
          left: 0;
          z-index: 998;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
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
          color: rgb(217,4,61);
          transform: scale(1.2);
        }

        .sidebar .icon-container .icon {
          font-size: 26px;
          margin-bottom: 5px;
        }

        .sidebar .icon-container .icon-label {
          font-size: 12px;
          color: rgb(5,166,150);
          transition: color 0.3s ease;
        }

        .sidebar .icon-container:hover .icon-label {
          color: rgb(217,4,61);
        }

        .main-content {
          margin-left: 80px;
          margin-top: 130px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          min-height: calc(100vh - 170px);
        }

        .main-content h2 {
          font-size: 36px;
          color: rgb(5,166,150);
          margin-bottom: 15px;
          font-weight: 700;
          text-align: center;
        }

        .header-text {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }

        .header-button {
          background: linear-gradient(90deg, rgb(217,4,61), rgb(5,166,150));
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-left: 10px;
        }

        .header-button:hover {
           background: linear-gradient(90deg, rgb(217,4,61), rgb(5,166,150));
          transform: scale(1.05);
        }

        .header-button .chart-icon {
          font-size: 18px;
        }

        .section-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 1100px;
          margin-bottom: 30px;
        }

        .content-section {
          width: 100%;
          max-width: 500px;
          background: transparent;
          padding: 30px;
          border: none;
          box-shadow: none;
        }

        .content-section h3 {
          font-size: 24px;
          color: #333;
          margin: 20px 0 15px;
          font-weight: 600;
        }

        .content-section p {
          font-size: 16px;
          line-height: 1.7;
          color: #555;
          margin: 10px 0;
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
          font-size: 36px;
          color: rgb(5,166,150);
          margin-bottom: 20px;
          font-weight: 700;
          text-align: center;
        }

        .calculation-prompt {
          background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
          padding: 25px;
          border-radius: 10px;
          margin: 20px auto;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .calculation-prompt:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .calculation-prompt p {
          font-size: 18px;
          line-height: 1.7;
          color: #333;
          margin: 0 0 15px 0;
          font-weight: 500;
        }

        .calculation-button {
          background: linear-gradient(90deg, rgb(217,4,61), rgb(5,166,150));
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
          font-weight: 600;
        }

        .calculation-button:hover {
          background: linear-gradient(90deg, rgb(217,4,61), rgb(5,166,150));
          transform: scale(1.05);
        }

        .full-width-section {
          width: 100%;
          max-width: 1100px;
          background: transparent;
          padding: 30px;
          border: none;
          box-shadow: none;
          margin-bottom: 30px;
        }

        .full-width-section h3 {
          font-size: 26px;
          color: #333;
          margin: 25px 0 15px;
          font-weight: 700;
          border-bottom: 2px solid rgb(5,166,150);
          padding-bottom: 10px;
        }

        .full-width-section h3.disadvantage {
          border-bottom: 2px solid rgb(200, 50, 50);
        }

        .list-box {
          background: #ffffff;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .list-box:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .full-width-section ul {
          list-style-type: disc;
          padding-left: 25px;
          font-size: 16px;
          line-height: 1.8;
          color: #555;
          margin: 0;
        }

        .full-width-section li {
          margin-bottom: 12px;
        }

        .full-width-section li strong {
          color: #333;
          font-weight: 600;
          font-size: 17px;
        }

        .full-width-section li p {
          margin: 0;
          font-size: 16px;
          color: #444;
          line-height: 1.6;
          display: inline;
        }

       

      

        .footer-box {
          width: 100%;
          max-width: 3000px;
          margin: 0 auto;
          background: linear-gradient(90deg, rgb(217,4,61), rgb(5,166,150));
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
        }

        .footer-text {
          background: linear-gradient(90deg, #ffffff, #e0e0e0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .top-box {
            height: 100px;
            padding: 10px;
          }

          .logo {
            width: 150px;
            height: 50px;
            left: 10px;
          }

          .header-text-top {
            font-size: 20px;
            margin-right: 10px;
          }

          .sidebar {
            width: 70px;
            top: 100px;
            height: calc(100vh - 100px);
          }

          .sidebar .icon-container .icon-label {
            font-size: 10px;
          }

          .main-content {
            margin-left: 70px;
            margin-top: 100px;
            padding: 20px;
            min-height: calc(100vh - 140px);
          }

          .main-content h2 {
            font-size: 30px;
          }

          .header-text {
            font-size: 16px;
          }

          .header-button {
            padding: 10px 18px;
            font-size: 16px;
          }

          .header-button .chart-icon {
            font-size: 16px;
          }

          .section-container {
            flex-direction: column;
            align-items: center;
          }

          .content-section,
          .dirgam-section,
          .full-width-section {
            max-width: 100%;
            padding: 20px;
            margin-bottom: 20px;
          }

          .content-section h3,
          .full-width-section h3 {
            font-size: 22px;
          }

          .content-section p,
          .full-width-section li p {
            font-size: 15px;
          }

          .full-width-section ul {
            padding-left: 20px;
            font-size: 15px;
          }

          .full-width-section li strong {
            font-size: 16px;
          }

          .calculation-prompt {
            max-width: 100%;
            padding: 20px;
          }

          .calculation-prompt p {
            font-size: 16px;
          }

          .calculation-button {
            padding: 10px 25px;
            font-size: 16px;
          }

          .footer-box {
            padding: 15px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="modules">
        <div className="top-box">
          <img
            src="/bilder/EWR.jpg"
            alt="Logo"
            className="logo"
            onClick={() => menuKlick('Home')}
          />
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
          <h2>Preis</h2>
          <p className="header-text"></p>
          <div className="section-container">
            <div className="content-section"></div>
            <div className="dirgam-section"></div>
          </div>
          <div className="calculation-prompt"></div>
        </div>

        <div className="footer-box">© 2025 Energie Dashboard</div>
      </div>
    </>
  );
};

export default Home;