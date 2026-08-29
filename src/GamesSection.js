import './GamesSection.css';

export default function GamesSection({ onNavigate }) {
  return (
    <section id="games" className="games-section">
      <div className="games-inner">
        <h2 className="section-title">Online Games</h2>
        <p className="section-subtitle">Play browser games — built right here</p>
        <div className="games-preview-grid">
          {/* Belot preview — temporarily disabled, coming soon
          <div className="games-preview-card" onClick={onNavigate}>
            <span className="games-preview-emoji">🃏</span>
            <div>
              <h3>Belot</h3>
              <p>The classic Bulgarian card game. Play against computer opponents — bid for trump, partner up, and reach 151 points first.</p>
            </div>
            <span className="games-preview-cta">Play now →</span>
          </div>
          */}
          <div className="games-preview-card games-preview-card-disabled">
            <div>
              <h3>Coming Soon</h3>
              <p>Online games are on the way — check back soon!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
