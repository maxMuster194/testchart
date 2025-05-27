const styles = {
  banner: {
    width: '100vw',
    height: '300px',
    objectFit: 'cover',
    position: 'relative',
    left: 'calc(-50vw + 50%)',
    marginBottom: '2rem',
  },
  container: {
    display: 'flex',
    gap: '2rem',
    padding: '0 2cm',
    alignItems: 'stretch',
  },
  leftContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem', // Space between the two left containers
  },
  left: {
    flex: 1,
    backgroundColor: '#e6f4ea',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 0 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  right: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  box: {
    backgroundColor: '#f0fdf4',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 0 8px rgba(0,0,0,0.1)',
    flex: 1,
  },
  heading: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#256029',
  },
};

function DeutschlandChart() {
  return (
    <div>
      <img
        src="/bilder/Ilumy.jpg"
        alt="Header Banner"
        style={styles.banner}
      />

      <div style={styles.container}>
        {/* Linker Bereich: zwei untereinanderliegende Container */}
        <div style={styles.leftContainer}>
          <div style={styles.left}>
            <h2 style={styles.heading}>Berechnung</h2>
            <p>Hier könnten Eingaben oder Ergebnisse stehen. Der Bereich ist genauso hoch wie beide rechten Boxen zusammen.</p>
          </div>
          <div style={styles.left}>
            <h2 style={styles.heading}>Zusätzlicher Bereich</h2>
            <p>Hier kommt der neue linke Container hin.</p>
          </div>
        </div>

        {/* Rechter Bereich mit zwei untereinanderliegenden Boxen */}
        <div style={styles.right}>
          <div style={styles.box}>
            <h2 style={styles.heading}>Diagramm 1</h2>
            <p>Hier kommt dein erstes Diagramm hin.</p>
          </div>
          <div style={styles.box}>
            <h2 style={styles.heading}>Diagramm 2</h2>
            <p>Hier kommt dein zweites Diagramm hin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeutschlandChart;