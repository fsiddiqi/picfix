import { useInstallPrompt } from './useInstallPrompt';

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    background: '#1e3a5f',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
  },
  icon: { fontSize: 22 },
  text: { flex: 1, lineHeight: 1.3 },
  btn: {
    background: '#007AFF',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  dismiss: {
    background: 'none',
    border: 'none',
    color: '#999',
    fontSize: 18,
    cursor: 'pointer',
    padding: '2px 6px',
  },
};

export default function InstallBanner() {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  const handleDismiss = () => {
    // Dismissed — stored in session, not shown again this session
    sessionStorage.setItem('install-dismissed', '1');
  };

  if (sessionStorage.getItem('install-dismissed')) return null;

  return (
    <div style={styles.banner}>
      <span style={styles.icon}>📲</span>
      <span style={styles.text}>Install PicFix for the best experience</span>
      <button style={styles.btn} onClick={promptInstall}>
        Install
      </button>
      <button style={styles.dismiss} onClick={handleDismiss}>
        ✕
      </button>
    </div>
  );
}
