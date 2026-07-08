const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    background: '#1a1a1a',
    borderTop: '1px solid #333',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '8px 0',
    border: 'none',
    background: 'none',
    color: '#666',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  tabActive: {
    color: '#007AFF',
  },
  icon: {
    fontSize: 22,
    lineHeight: 1,
  },
};

const tabs = [
  { key: 'capture', label: 'Capture', icon: '📷' },
  { key: 'albums', label: 'Albums', icon: '🖼' },
] as const;

export default function TabBar({
  active,
  onTab,
}: {
  active: string;
  onTab: (key: string) => void;
}) {
  return (
    <div style={styles.bar}>
      {tabs.map((t) => (
        <button
          key={t.key}
          style={{
            ...styles.tab,
            ...(active === t.key ? styles.tabActive : {}),
          }}
          onClick={() => onTab(t.key)}
        >
          <span style={styles.icon}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
