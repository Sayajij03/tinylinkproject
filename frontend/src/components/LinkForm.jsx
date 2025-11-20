import React, { useState } from 'react';
import api from '../api';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default function LinkForm({ onCreated }) {
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!target) return alert('Enter a target URL');
    if (code && !CODE_REGEX.test(code)) return alert('Custom code must be 6-8 alphanumeric characters');

    setLoading(true);
    try {
      await api.post('/links', { target_url: target, code: code || undefined });
      setTarget('');
      setCode('');
      // signal update
      window.dispatchEvent(new Event('linksUpdated'));
      if (onCreated) onCreated();
    } catch (err) {
      if (err.response?.status === 409) alert('Code already exists');
      else alert(err.response?.data?.error || 'Error creating link');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card form-card">
      <div className="form-row">
        <label>Target URL</label>
        <input value={target} onChange={e => setTarget(e.target.value)} placeholder="https://example.com/long/path" required />
      </div>
      <div className="form-row">
        <label>Custom code (optional)</label>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="6-8 chars (alphanumeric)" />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create short link'}</button>
      </div>
    </form>
  );
}
