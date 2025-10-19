export default function Settings() {
  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
        ⚙️ Settings
      </h1>

      {/* Notifications Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
          🔔 Notifications
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: '20px', height: '20px' }}
            />
            <span>Trade updates</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: '20px', height: '20px' }}
            />
            <span>New messages</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: '20px', height: '20px' }}
            />
            <span>XP and level-up alerts</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px' }}
            />
            <span>Weekly quest reminders</span>
          </label>
        </div>
      </div>

      {/* Accessibility Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
          ♿ Accessibility
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{
              display: 'block',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-2)',
            }}>
              Text Size
            </label>
            <select
              style={{
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-base)',
                border: '2px solid var(--color-gray-300)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-white)',
                cursor: 'pointer',
              }}
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px' }}
            />
            <span>High Contrast Mode</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: '20px', height: '20px' }}
            />
            <span>Reduce animations</span>
          </label>
        </div>
      </div>

      {/* Privacy & Safety Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
          🔒 Privacy & Safety
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: '20px', height: '20px' }}
            />
            <span>Profile visible to other traders</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: '20px', height: '20px' }}
            />
            <span>Show my level badge</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
          }}>
            <input
              type="checkbox"
              defaultChecked
              style={{ width: '20px', height: '20px' }}
            />
            <span>Enable chat moderation</span>
          </label>
        </div>
      </div>

      {/* Account Card */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
          👤 Account
        </h3>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-gray-600)',
            marginBottom: 'var(--space-1)',
          }}>
            User ID
          </div>
          <div style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            fontFamily: 'monospace',
          }}>
            user-1
          </div>
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-gray-600)',
            marginBottom: 'var(--space-1)',
          }}>
            Member Since
          </div>
          <div style={{
            fontSize: 'var(--text-base)',
          }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => alert('Feature coming soon!')}
          >
            Change Username
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => alert('Feature coming soon!')}
          >
            Change Avatar
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) {
                alert('Sign out feature coming soon!');
              }
            }}
            style={{
              background: 'var(--color-red-light)',
              color: 'var(--color-red-dark)',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* App Info */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-6)',
        color: 'var(--color-gray-600)',
        fontSize: 'var(--text-sm)',
      }}>
        <div style={{ marginBottom: 'var(--space-2)' }}>Swappy v1.0.0</div>
        <div>Kid-friendly local trading app 🔄</div>
      </div>
    </div>
  );
}

