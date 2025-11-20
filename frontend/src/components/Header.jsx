import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <a href="/"><h1>TinyLink</h1></a>
        </div>
        <nav>
          <a href="/">Dashboard</a>
        </nav>
      </div>
    </header>
  );
}
