const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    overflow: 'auto',
    background: '#121212',
    padding: '16px 20px',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  track: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 0',
    borderBottom: '1px solid #222',
  },
  trackDone: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 16,
    lineHeight: '20px',
    width: 20,
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#eee',
    marginBottom: 2,
  },
  trackDesc: {
    fontSize: 12,
    color: '#888',
    lineHeight: '18px',
  },
  gap: { height: 40 },
};

const tracks = {
  done: [
    { num: '08', title: 'Album Management & Metadata', desc: 'CRUD albums, photo detail view, move/delete photos, metadata editing.' },
    { num: '07', title: 'Image Processing Pipeline', desc: 'Crop & perspective correction, auto-detect photo bounds, manual corner-drag UI.' },
    { num: '06', title: 'PWA App Shell & Installability', desc: 'App shell, lazy loading, bottom tabs, offline support, install prompt.' },
    { num: '05', title: 'Core PWA (Capture + Browse)', desc: 'Camera capture, thumbnail gen, IndexedDB persistence, album browsing.' },
    { num: '04', title: 'Colorize & Restore', desc: 'Colorization and restoration of monochrome/physical photos. (Expo prototype, superseded by Track 07.)' },
  ],
  current: [
    { num: '09', title: 'Server-Side Processing Pipeline', desc: 'FastAPI + OpenCV backend: multi-photo detection, auto-color correction, perspective correction.' },
  ],
  upcoming: [
    { num: '10', title: 'Album UX Enhancements', desc: 'Cover photo selection, search, people/location metadata editing, album reordering.' },
    { num: '—', title: 'Data Portability & Sync', desc: 'Export/import albums as zip, WebDAV sync, backup/restore.' },
    { num: '—', title: 'AI Features', desc: 'B&W colorization, face sharpening, cloud sync & subscriptions.' },
  ],
};

export default function ChangelogScreen() {
  return (
    <div style={styles.container}>
      <div style={styles.title}>Progress</div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>In Progress</div>
        {tracks.current.map(t => (
          <div key={t.num} style={styles.track}>
            <div style={styles.icon}>🔄</div>
            <div>
              <div style={styles.trackTitle}>Track {t.num}: {t.title}</div>
              <div style={styles.trackDesc}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Completed</div>
        {tracks.done.map(t => (
          <div key={t.num} style={{ ...styles.track, ...styles.trackDone }}>
            <div style={styles.icon}>✅</div>
            <div>
              <div style={styles.trackTitle}>Track {t.num}: {t.title}</div>
              <div style={styles.trackDesc}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Upcoming</div>
        {tracks.upcoming.map(t => (
          <div key={t.title} style={{ ...styles.track, opacity: 0.5 }}>
            <div style={styles.icon}>⬜</div>
            <div>
              <div style={styles.trackTitle}>{t.num !== '—' ? `Track ${t.num}: ` : ''}{t.title}</div>
              <div style={styles.trackDesc}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.gap} />
    </div>
  );
}
