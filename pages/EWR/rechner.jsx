import React from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChartLine, faCalculator, faFileLines, faQuestionCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import StrompreisChart from '../EWR/Profil6';
import Statistik from '../EWR/stk0';

const Home = () => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuKlick = (item) => {
    const routes = {
      Home: '/EWR/startseite',
      Preis: '/EWR/preis',
      Rechner: '/EWR/rechner',
      Details: '/EWR/details',
      Hilfe: '/EWR/hilfe',
    };
    router.push(routes[item] || '/');
    setIsSidebarOpen(false); // Close sidebar on menu click
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
          overflow-x: hidden;
        }

        .top-box {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          background: url('/bilder/.jpg') no-repeat center/cover, linear-gradient(90deg, rgb(217,4,61), rgb(217,4,61));
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
          height: 100px;
          pointer-events: none;
        }

        .logo {
          width: 200px;
          height: 80px;
          position: absolute;
          left: 15px;
          top: 10px;
          object-fit: contain;
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .hamburger {
          display: none;
          font-size: 24px;
          color: white;
          position: absolute;
          right: 15px;
          top: 35px;
          cursor: pointer;
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
          top: 100px;
          height: calc(100vh - 100px);
          left: 0;
          z-index: 998;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
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
          transform: scale(1.1);
        }

        .sidebar .icon-container .icon {
          font-size: 24px;
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
          margin-top: 100px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          min-height: calc(100vh - 140px);
          box-sizing: border-box;
          width: 100%;
        }

        .main-content h2 {
          font-size: 2rem;
          color: rgb(5,166,150);
          margin-bottom: 10px;
          font-weight: 700;
          text-align: center;
        }

        .header-text {
          font-size: 1rem;
          color: #333;
          margin-bottom: 15px;
          text-align: center;
        }

        .header-button {
           background: linear-gradient(90deg, rgb(3, 160, 129), rgb(5,166,150));
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 1rem;
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
          background: rgb(5,166,150);
          transform: scale(1.05);
        }

        .header-button .chart-icon {
          font-size: 1.2rem;
        }

        .section-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          max-width: 100%;
          margin-bottom: 20px;
          gap: 20px;
        }

        .content-section {
          width: 100%;
          max-width: 400px;
          background: transparent;
          padding: 20px;
          border: none;
          box-shadow: none;
        }

        .dirgam-section {
          width: 100%;
          max-width: 900px;
          background: transparent;
          padding: 20px;
          border: none;
          box-shadow: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dirgam-section h2 {
          font-size: 2rem;
          color: rgb(5,166,150);
          margin-bottom: 20px;
          font-weight: 700;
          text-align: center;
        }

        .content-section h3 {
          font-size: 1.5rem;
          color: #333;
          margin: 20px 0 10px;
          font-weight: 600;
        }

        .content-section p {
          font-size: 1rem;
          line-height: 1.7;
          color: #555;
          margin: 10px 0;
        }

        .content-section ul {
          list-style-type: disc;
          padding-left: 25px;
          font-size: 1rem;
          line-height: 1.7;
          color: #555;
          margin: 10px 0;
        }

        .footer-box {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          background: linear-gradient(90deg, rgb(217,4,61), rgb(217,4,61));
          color: white;
          text-align: center;
          padding: 15px;
          font-size: 1rem;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 999;
          box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        .calculation-prompt {
          background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
          padding: 30px;
          border-radius: 10px;
          margin: 10px auto;
          width: 100%;
          max-width: 900px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-sizing: border-box;
        }

        .calculation-prompt:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .calculation-prompt p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #333;
          margin: 0 0 15px 0;
          font-weight: 500;
        }

        .calculation-prompt > div {
          width: 100%;
          overflow-x: auto;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .main-content {
            max-width: 1000px;
            padding: 15px;
          }

          .calculation-prompt {
            max-width: 100%;
            padding: 20px;
          }
        }

        @media (max-width: 768px) {
          .top-box {
            height: 80px;
          }

          .logo {
            width: 150px;
            height: 60px;
            left: 10px;
            top: 10px;
          }

          .hamburger {
            display: block;
          }

          .sidebar {
            width: 200px;
            transform: ${isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};
            top: 80px;
            height: calc(100vh - 80px);
            align-items: flex-start;
            padding: 20px;
          }

          .sidebar .icon-container {
            flex-direction: row;
            align-items: center;
            margin: 10px 0;
            width: 100%;
          }

          .sidebar .icon-container .icon {
            margin-right: 10px;
            margin-bottom: 0;
          }

          .sidebar .icon-container .icon-label {
            font-size: 14px;
          }

          .main-content {
            margin-left: 0;
            margin-top: 80px;
            padding: 15px;
            min-height: calc(100vh - 120px);
          }

          .main-content h2 {
            font-size: 1.8rem;
          }

          .section-container {
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }

          .content-section,
          .dirgam-section {
            max-width: 100%;
            padding: 15px;
          }

          .dirgam-section h2 {
            font-size: 1.8rem;
          }

          .content-section h3 {
            font-size: 1.3rem;
          }

          .header-button {
            padding: 8px 16px;
            font-size: 0.9rem;
          }

          .header-button .chart-icon {
            font-size: 1rem;
          }

          .calculation-prompt {
            padding: 20px;
          }

          .calculation-prompt p {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .top-box {
            height: 60px;
          }

          .logo {
            width: 120px;
            height: 48px;
            left: 8px;
            top: 6px;
          }

          .hamburger {
            font-size: 20px;
            top: 20px;
            right: 10px;
          }

          .sidebar {
            width: 180px;
            top: 60px;
            height: calc(100vh - 60px);
            padding: 15px;
          }

          .sidebar .icon-container .icon {
            font-size: 20px;
          }

          .sidebar .icon-container .icon-label {
            font-size: 12px;
          }

          .main-content {
            margin-top: 60px;
            padding: 10px;
            min-height: calc(100vh - 100px);
          }

          .main-content h2 {
            font-size: 1.5rem;
          }

          .header-text {
            font-size: 0.9rem;
          }

          .content-section,
          .dirgam-section {
            padding: 10px;
          }

          .dirgam-section h2 {
            font-size: 1.5rem;
          }

          .content-section h3 {
            font-size: 1.2rem;
          }

          .content-section p,
          .content-section ul,
          .calculation-prompt p {
            font-size: 0.9rem;
          }

          .header-button {
            padding: 6px 12px;
            font-size: 0.8rem;
          }

          .header-button .chart-icon {
            font-size: 0.9rem;
          }

          .calculation-prompt {
            padding: 15px;
            margin: 5px auto;
          }

          .footer-box {
            font-size: 0.9rem;
            padding: 10px;
          }
        }

        @media (min-width: 1400px) {
          .main-content {
            max-width: 1400px;
          }

          .calculation-prompt {
            max-width: 1000px;
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
          <FontAwesomeIcon icon={faBars} className="hamburger" onClick={toggleSidebar} />
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
          <h2>Preisrechner dynamische Tarife</h2>
          <p className="header-text"></p>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <StrompreisChart />
          </div>
          <div className="section-container">
            <div className="content-section"></div>
            <div className="dirgam-section"></div>
          </div>

          <div className="calculation-prompt">
            <Statistik />
          </div>
        </div>

        <div className="footer-box">© 2025 Energie Dashboard</div>
      </div>
    </>
  );
};

export default Home;