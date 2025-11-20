import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import LinkForm from '../components/LinkForm';
import LinksTable from '../components/LinksTable';
import api from '../api';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (query = q) => {
    setLoading(true);
    try {
      const res = await api.get('/links', { params: query ? { q: query } : {} });
      setLinks(res.data.links || []);
    } catch (err) {
      console.error(err);
      alert('Error loading links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // reload if an event signals change
    const h = () => load();
    window.addEventListener('linksUpdated', h);
    return () => window.removeEventListener('linksUpdated', h);
  }, []);

  return (
    <>
      <Header />
      <main className="container">
        <section className="hero">
          <h2>TinyLink</h2>
          <p>Create short links and track clicks.</p>
        </section>

        <LinkForm onCreated={() => { load(); }} />

        <div className="search-row">
          <input
            aria-label="Search"
            placeholder="Search code or URL"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={() => load()}>Search</button>
          <button onClick={() => { setQ(''); load(''); }}>Clear</button>
        </div>

        <LinksTable links={links} loading={loading} onDelete={() => load()} />
      </main>
      <footer className="footer">
        <small>Made for TinyLink assignment • Demo</small>
      </footer>
    </>
  );
}
