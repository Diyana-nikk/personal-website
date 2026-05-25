import { useState } from 'react';
import BelotGame from './games/BelotGame';
import './GamesHub.css';

const GAME_LIST = [
  {
    id: 'belot',
    title: 'Belot',
    emoji: '🃏',
    description: 'The classic Bulgarian card game. Bid for trump, form a team with your partner, and outscore your opponents.',
    players: '4 players (2v2)',
    difficulty: 'Medium',
  },
  {
    id: 'coming',
    title: 'More coming soon…',
    emoji: '🎮',
    description: 'More games are on the way. Check back later!',
    players: '—',
    difficulty: '—',
    disabled: true,
  },
];

export default function GamesHub({ onBack }) {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === 'belot') {
    return <BelotGame onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="hub-root">
      <div className="hub-header">
        <button className="hub-back-btn" onClick={onBack}>← Back to site</button>
        <h1 className="hub-title">Games</h1>
        <p className="hub-subtitle">Play directly in your browser — no download needed.</p>
      </div>

      <div className="hub-grid">
        {GAME_LIST.map(game => (
          <div
            key={game.id}
            className={`hub-card${game.disabled ? ' hub-card-disabled' : ''}`}
            onClick={() => !game.disabled && setActiveGame(game.id)}
          >
            <span className="hub-emoji">{game.emoji}</span>
            <h3 className="hub-card-title">{game.title}</h3>
            <p className="hub-card-desc">{game.description}</p>
            <div className="hub-card-meta">
              <span>{game.players}</span>
              {game.difficulty !== '—' && <span>Difficulty: {game.difficulty}</span>}
            </div>
            {!game.disabled && (
              <span className="hub-play-btn">Play now →</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
