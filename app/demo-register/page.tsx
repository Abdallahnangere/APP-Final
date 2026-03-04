'use client';
import { useState } from 'react';

export default function RegisterDemoPage() {
  const [screen, setScreen] = useState<'form' | 'pin' | 'success'>('form');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!/^\d{11}$/.test(formData.phone)) {
      setError('Phone must be exactly 11 digits (Nigerian format)');
      return;
    }
    
    setScreen('pin');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!/^\d{6}$/.test(pin)) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    try {
      // Call the register API
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          pin,
          confirmPin,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccessData(data);
      setScreen('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7', padding: '20px' }}>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', system-ui, sans-serif; }
        .container { max-width: 400px; margin: 0 auto; background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 28px; }
        .header h1 { font-size: 24px; font-weight: 700; color: #1C1C1E; margin: 0 0 8px; }
        .header p { font-size: 14px; color: #6C6C70; margin: 0; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #1C1C1E; margin-bottom: 6px; }
        input { width: 100%; padding: 12px 14px; border: 1.5px solid #E5E5EA; border-radius: 12px; font-size: 16px; font-family: inherit; transition: all 0.2s; }
        input:focus { border-color: #007AFF; box-shadow: 0 0 0 3px rgba(0,122,255,0.1); }
        input::placeholder { color: #8E8E93; }
        button { width: 100%; padding: 14px; background: #007AFF; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        button:hover { background: #0062CC; }
        button:active { transform: scale(0.98); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { color: #FF3B30; font-size: 13px; margin-bottom: 12px; padding: 10px; background: #FFEBEB; border-radius: 8px; }
        .success-box { background: #E8F5E9; border: 1.5px solid #34C759; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .success-box h3 { color: #34C759; font-size: 14px; font-weight: 600; margin: 0 0 8px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E5EA; font-size: 13px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #6C6C70; font-weight: 500; }
        .info-value { color: #1C1C1E; font-weight: 600; font-family: 'SF Mono', monospace; }
        .back-btn { margin-top: 16px; background: #E5E5EA; color: #1C1C1E; }
        .back-btn:hover { background: #D1D1D6; }
        .pin-input-group { display: flex; gap: 8px; margin-bottom: 16px; }
        .pin-input-group input { flex: 1; text-align: center; letter-spacing: 4px; font-size: 20px; font-weight: 600; }
        .step-indicator { display: flex; gap: 8px; margin-bottom: 20px; justify-content: center; }
        .step { width: 8px; height: 8px; border-radius: 4px; background: #E5E5EA; transition: all 0.2s; }
        .step.active { background: #007AFF; width: 24px; border-radius: 4px; }
      `}</style>

      <div className="container">
        {screen === 'form' && (
          <>
            <div className="step-indicator">
              <div className="step active"></div>
              <div className="step"></div>
              <div className="step"></div>
            </div>
            <div className="header">
              <h1>Create Account</h1>
              <p>Join SaukiMart today and start buying data</p>
            </div>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chioma"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Okafor"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  disabled={loading}
                  maxLength={11}
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Continue to PIN'}
              </button>
            </form>
          </>
        )}

        {screen === 'pin' && (
          <>
            <div className="step-indicator">
              <div className="step active"></div>
              <div className="step active"></div>
              <div className="step"></div>
            </div>
            <div className="header">
              <h1>Set Your PIN</h1>
              <p>Create a secure 6-digit PIN for login</p>
            </div>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handlePinSubmit}>
              <div className="form-group">
                <label>PIN (6 digits)</label>
                <div className="pin-input-group">
                  <input
                    type="password"
                    placeholder="●●●●●●"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm PIN</label>
                <div className="pin-input-group">
                  <input
                    type="password"
                    placeholder="●●●●●●"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading || pin.length < 6 || confirmPin.length < 6}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
              <button type="button" className="back-btn" onClick={() => setScreen('form')} disabled={loading}>
                Back
              </button>
            </form>
          </>
        )}

        {screen === 'success' && successData && (
          <>
            <div className="step-indicator">
              <div className="step active"></div>
              <div className="step active"></div>
              <div className="step active"></div>
            </div>
            <div className="header">
              <h1>✓ Account Created</h1>
              <p>Welcome to SaukiMart!</p>
            </div>

            <div className="success-box">
              <h3>✓ Registration Successful</h3>
              <div style={{ fontSize: '13px', color: '#34C759' }}>
                Your account has been created and you can now buy data and products.
              </div>
            </div>

            <div className="form-group" style={{ background: '#F9F9F9', padding: '12px', borderRadius: '8px' }}>
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{successData.user.firstName} {successData.user.lastName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{successData.user.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Account ID:</span>
                <span className="info-value" style={{ fontSize: '11px', wordBreak: 'break-all' }}>{successData.user.id.slice(0, 12)}...</span>
              </div>
              <div className="info-row">
                <span className="info-label">Bank Account:</span>
                <span className="info-value">{successData.user.accountNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Bank:</span>
                <span className="info-value">{successData.user.bankName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Wallet Balance:</span>
                <span className="info-value">₦{Number(successData.user.walletBalance).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ fontWeight: 600, color: '#FF9500', marginBottom: '6px' }}>📌 Next Steps:</div>
              <div style={{ color: '#825500', lineHeight: '1.5' }}>
                1. Transfer money to your account number above<br/>
                2. Wait for deposit confirmation (few seconds)<br/>
                3. Start buying data and products!
              </div>
            </div>

            <button onClick={() => window.location.href = '/app'} style={{ background: '#007AFF' }}>
              Go to Dashboard
            </button>
            <button type="button" className="back-btn" onClick={() => {
              setScreen('form');
              setFormData({ firstName: '', lastName: '', phone: '' });
              setPin('');
              setConfirmPin('');
              setError('');
            }}>
              Register Another Account
            </button>
          </>
        )}
      </div>
    </div>
  );
}
