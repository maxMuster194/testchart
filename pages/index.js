import React, { useState } from "react";

export default function IndexPage() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <>
      <div className={`main-container ${darkMode ? "dark" : ""}`}>
        {/* Sticky Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-title">
              <img src="/bilder/Ilumy.jpg" alt="Energiemarkt Logo" className="logo" />
              
            </div>
            <nav className="nav">
              <a href="#home" className="nav-link">Home</a>
              <a href="#about" className="nav-link">Über uns</a>
              <a href="#contact" className="nav-link">Kontakt</a>
              <button onClick={toggleDarkMode} className="dark-mode-toggle" aria-label="Dark Mode Toggle">
                <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          <div className="intro">
            <h1 className="main-title">Energiemarkt Dashboard</h1>
            <p className="main-subtitle">Detaillierte Einblicke in Strompreise und Netzentgelte in europäischen Märkten</p>
          </div>
          <div className="grid">
            <Section
              title="🇩🇪 Deutschland"
              links={[
                { name: "DeutschlandChart", url: "/germany/DeutschlandChart" },
                { name: "h0-h0pv-diagram", url: "/germany/h0-h0pv-diagram" },
                
                { name: "Berechnung", url: "/germany/Berechnung" },
                { name: "", url: "/germany/" },
              ]}
            />
            <Section
              title="🇦🇹 Österreich"
              links={[
                { name: "Strompreise", url: "/austria/strompreise" },
                { name: "Netzentgelte", url: "/austria/netzentgelte" },
                { name: "Marktdaten", url: "/austria/marktdaten" },
                { name: "Prognosen", url: "/austria/prognosen" },
                { name: "Analysen", url: "/austria/analysen" },
              ]}
            />
            <Section
              title=" H0 und H0 + PV"
              links={[
                { name: "h0-anzeige", url: "/h0-anzeige" },
                { name: "h0-pv-anzeige", url: "/h0-pv-anzeige" },
                
              ]}
            />
            <Section
              title="Vergleich 🔎"
              links={[
                { name: "PV-Anlage kaufen Vergleich", url: "/pvanlagekaufen" },
                { name: "", url: "//" },
                { name: "", url: "//" },
                { name: "", url: "//" },
                { name: "", url: "//" },
              ]}
            />
            <Section
              title="Einzelcharts 📊 "
              links={[
                { name: "H0", url: "/charts/h0-chart" },
                { name: "H0PV", url: "/charts/h0pv-chart" },
                { name: "H0 & H0PV", url: "/germany/chartsde" },
                { name: "", url: "//" },
                { name: "", url: "//" },
              ]}
            />
          </div>
        </main>

        {/* Footer */}
  
      </div>

      {/* Eingebettetes CSS */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .main-container {
          min-height: 100vh;
          font-family: "Inter", sans-serif;
          background: linear-gradient(to bottom, #f5f5f5, #e0e0e0);
          transition: background 0.5s ease;
        }

        .main-container.dark {
          background: linear-gradient(to bottom, #1a202c, #2d3748);
        }

        /* Header Styles */
        .header {
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 20;
        }

        .header.dark {
          background: rgba(45, 55, 72, 0.9);
        }

        .header-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-title {
          display: flex;
          align-items: center;
        }

        .logo {
          height: 56px;
          width: auto;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .header-title {
          margin-left: 16px;
          font-size: 28px;
          font-weight: 800;
          color: #1a202c;
          animation: slideIn 0.8s ease-out;
        }

        .dark .header-title {
          color: #ffffff;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          color: #4a5568;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .dark .nav-link {
          color: #e2e8f0;
        }

        .nav-link:hover {
          color: #3182ce;
        }

        .dark .nav-link:hover {
          color: #63b3ed;
        }

        .dark-mode-toggle {
          padding: 8px;
          border: none;
          border-radius: 50%;
          background: #e2e8f0;
          color: #3182ce;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .dark .dark-mode-toggle {
          background: #4a5568;
          color: #f6e05e;
        }

        .dark-mode-toggle:hover {
          background: #cbd5e0;
        }

        .dark .dark-mode-toggle:hover {
          background: #718096;
        }

        /* Main Content Styles */
        .main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 24px;
        }

        .intro {
          text-align: center;
          margin-bottom: 64px;
        }

        .main-title {
          font-size: 48px;
          font-weight: 800;
          color: #1a202c;
          animation: fadeIn 1s ease-in-out;
        }

        .dark .main-title {
          color: #ffffff;
        }

        .main-subtitle {
          margin-top: 16px;
          font-size: 20px;
          color: #4a5568;
          max-width: 768px;
          margin-left: auto;
          margin-right: auto;
          animation: slideUp 1s ease-out;
        }

        .dark .main-subtitle {
          color: #e2e8f0;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Section Styles */
        .section {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .section:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .dark .section {
          background: rgba(45, 55, 72, 0.9);
        }

        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 24px;
          background: linear-gradient(to right, #3182ce, #805ad5);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: slideIn 0.8s ease-out;
        }

        .dark .section-title {
          color: #ffffff;
        }

        .section-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-link {
          color: #3182ce;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: color 0.2s ease;
        }

        .dark .section-link {
          color: #63b3ed;
        }

        .section-link:hover {
          color: #2b6cb0;
        }

        .dark .section-link:hover {
          color: #90cdf4;
        }

        .section-link i {
          margin-right: 8px;
          transition: transform 0.2s ease;
        }

        .section-link:hover i {
          transform: translateX(4px);
        }

        /* Footer Styles */
        .footer {
          background: #1a202c;
          color: #ffffff;
          padding: 48px 24px;
        }

        .dark .footer {
          background: #171923;
        }

        .footer-content {
          max-width: 1280px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-text {
          font-size: 14px;
          font-weight: 500;
        }

        .footer-links {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .footer-link {
          color: #a0aec0;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: #63b3ed;
        }

        /* Animations */
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

function Section({ title, links }) {
  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <ul className="section-links">
        {links.map((link) => (
          <li key={link.url}>
            <a href={link.url} className="section-link">
              <i className="fas fa-arrow-right"></i>
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}