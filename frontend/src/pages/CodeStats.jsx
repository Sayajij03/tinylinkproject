import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

export default function CodeStats() {
  const { code } = useParams();
  const [stat, setStat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/links/${encodeURIComponent(code)}`);
        setStat(res.data);
      } catch (err) {
        setStat(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [code]);

  return (
    <>
      <Header />
      <main className="container">
        <h2>Stats — {code}</h2>
        {loading && <p>Loading…</p>}
        {!loading && !stat && <p>Not found</p>}
        {stat && (
          <div className="card">
            <p><strong>Short:</strong> {stat.code}</p>
            <p><strong>Target URL:</strong> <a href={stat.target_url} target="_blank" rel="noreferrer">{stat.target_url}</a></p>
            <p><strong>Total clicks:</strong> {stat.total_clicks}</p>
            <p><strong>Last clicked:</strong> {stat.last_clicked ?? 'Never'}</p>
            <div style={{marginTop: 12}}>
              <Link to="/">← Back to Dashboard</Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
