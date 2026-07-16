import "./BoardGames.css";

const boardGames = [
  {
    title: "Catan",
    emoji: "🌾",
    players: "3–4 players",
    playtime: "~60 min",
    rating: 3,
    review:
      "A classic but wouldn't say it's a top game of mine. It feel too punishing on early-game decisions and too reliant on luck.",
  },
  {
    title: "Codenames",
    emoji: "🕵️",
    players: "4–8 players",
    playtime: "~20 min",
    rating:45,
    review:
      "Old and trusty. It highly depends on the group of people on how successful your code master would be but great for most games nights!",
  },
  {
    title: "Finspan",
    emoji: "",
    players: "1–5 players",
    playtime: "~70 min",
    rating: 4,
    review:
      "Similar to Wingspan, but with Fish! I love the flexibility it provides and that there's no optimal strategy, unlike laying a lot of eggs last turn in Wingspan.",
  },
  {
    title: "Azul",
    emoji: "🧩",
    players: "2–4 players",
    playtime: "~40 min",
    rating: 4,
    review:
      "Beautiful and so classic. I love the competitve aspect of it and it's truly satisfying.",
  },
  {
    title: "Root",
    emoji: "🦠",
    players: "2–4 players",
    playtime: "~2 hrs",
    rating: 5,
    review:
      "My favourite game by far! It has endless combinations of variety of factions and beatiful art. I enjoy the table-talk aspect of it, as it's as big of a skill to not appear as a threat as it is to be gaining points.",
  },
];

function Stars({ rating }) {
  return (
    <span className="board-game-stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

function BoardGames() {
  return (
    <section id="board-games" className="board-games-section">
      <div className="board-games-inner">
        <h2 className="section-title">Board Games</h2>
        <p className="section-subtitle">A few from my shelf, with reviews</p>
        <div className="board-games-grid">
          {boardGames.map((game) => (
            <div className="board-game-card" key={game.title}>
              <span className="board-game-emoji">{game.emoji}</span>
              <h3>{game.title}</h3>
              <p className="board-game-meta">
                {game.players} · {game.playtime}
              </p>
              <Stars rating={game.rating} />
              <p className="board-game-review">{game.review}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BoardGames;
