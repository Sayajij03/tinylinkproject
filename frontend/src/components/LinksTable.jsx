import React from 'react';
import api from '../api';

export default function LinksTable({ links = [], loading = false, onDelete }) {
  const base = import.meta.env.VITE_BASE_URL || window.location.origin;

  const handleDelete = async (code) => {
    if (!confirm('Delete this link?')) return;
    try {
      await api.delete(`/links/${encodeURIComponent(code)}`);
      if (onDelete) onDelete();
    } catch (err) {
      alert('Unable to delete');
    }
  };

  if (loading) return <p>Loading links…</p>;
  if (!links.length) return <p>No links yet.</p>;

  return (
    <div className="table-wrap">
      <table className="links-table" aria-label="Links">
        <thead>
          <tr>
            <th>Short</th>
            <th>Target</th>
            <th>Clicks</th>
            <th>Last clicked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.map(l => (
            <tr key={l.code}>
              <td><a href={`${base}/${l.code}`} target="_blank" rel="noreferrer">{l.code}</a></td>
              <td className="target-cell">{l.target_url}</td>
              <td>{l.total_clicks}</td>
              <td>{l.last_clicked ?? '—'}</td>
              <td>
                <a href={`/code/${encodeURIComponent(l.code)}`}>Stats</a>
                {' • '}
                <button className="link-delete" onClick={() => handleDelete(l.code)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
