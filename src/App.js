import { useState } from 'react';
import Navbar from './NavBar';
import About from './About';
import Projects from './Projects';
import GamesSection from './GamesSection';
import Contact from './Contact';
import GamesHub from './GamesHub';
import './App.css';

export default function App() {
  const [page, setPage] = useState('home');

  if (page === 'games') {
    return (
      <>
        <Navbar page={page} onNavigate={setPage} />
        <GamesHub onBack={() => setPage('home')} />
      </>
    );
  }

  return (
    <>
      <Navbar page={page} onNavigate={setPage} />
      <About />
      <Projects />
      <GamesSection onNavigate={() => setPage('games')} />
      <Contact />
    </>
  );
}
