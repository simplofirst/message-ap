import { useEffect, useState } from 'react';

export default function Gallery() {
  const [captures, setCaptures] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaptures = async () => {
      try {
        const response = await fetch('/api/gallery');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Impossible de charger les captures');
        }

        setCaptures(data.captures || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchCaptures();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🗂 Mes captures</h1>
      <a href="/" style={styles.link}>← Retour</a>

      {loading && <p>Chargement...</p>}

      {error && (
        <p style={styles.error}>
          ⚠️ Impossible de charger les captures : {error}.
        </p>
      )}

      <div style={styles.grid}>
        {!loading && captures.length === 0 && !error && <p>Aucune capture pour l’instant.</p>}

        {captures.map((capture) => (
          <div key={capture.filename} style={styles.card}>
            <img src={capture.url} alt={capture.filename} style={styles.img} />
            <div style={styles.date}>{new Date(capture.date).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'system-ui', background: '#0f172a', color: 'white', padding: 20, minHeight: '100vh' },
  title: { color: '#25D366' },
  link: { color: '#25D366' },
  error: { background: '#7f1d1d', padding: 15, borderRadius: 8, marginTop: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginTop: 20 },
  card: { border: '1px solid #334155', borderRadius: 10, padding: 8, background: '#1e293b' },
  img: { width: '100%', borderRadius: 6, display: 'block' },
  date: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
};
