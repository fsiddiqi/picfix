import { useRegisterSW } from 'virtual:pwa-register/react';

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'fixed' as const,
    bottom: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 12,
    padding: '12px 16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: 14,
  },
  btn: {
    background: '#007AFF',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div style={styles.wrapper}>
      <span>Update available</span>
      <button style={styles.btn} onClick={() => updateServiceWorker()}>
        Reload
      </button>
    </div>
  );
}
