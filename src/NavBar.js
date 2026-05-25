import { useState } from 'react';
import './NavBar.css';

export default function Navbar({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  const goHome = () => {
    close();
    if (page !== 'home') {
      onNavigate('home');
    }
  };

  return (
    <nav className="navbar">
      <button
        className="navbar-brand"
        onClick={() => { onNavigate('home'); close(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        Diyana
      </button>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <li>
          <a href={page === 'home' ? '#about' : '#'}
            onClick={() => goHome('#about')}>About</a>
        </li>
        <li>
          <a href={page === 'home' ? '#projects' : '#'}
            onClick={() => goHome('#projects')}>Projects</a>
        </li>
        <li>
          <button
            className="nav-link-btn"
            onClick={() => { onNavigate('games'); close(); }}
            style={{ color: page === 'games' ? '#fff' : undefined }}
          >
            Games
          </button>
        </li>
        <li>
          <a href={page === 'home' ? '#contact' : '#'}
            onClick={() => goHome('#contact')}>Contact</a>
        </li>
        <li>
          <a
            href="https://learnbulgarian.diyana.uk/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-highlight"
            onClick={close}
          >
            Learn Bulgarian
          </a>
        </li>
      </ul>
    </nav>
  );
}
