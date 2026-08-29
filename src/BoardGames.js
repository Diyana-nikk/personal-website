import "./BoardGames.css";
import diamant from "./images/board-games/diamant.jpeg";
import jaipur from "./images/board-games/jaipur.jpeg";
import junkArt from "./images/board-games/junk-art.jpeg";
import tinyTowns from "./images/board-games/tiny-towns.jpeg";
import coup from "./images/board-games/coup.jpeg";
import harmonies from "./images/board-games/harmonies.jpeg";
import highSociety from "./images/board-games/high-society.jpeg";
import raccoonTycoon from "./images/board-games/raccoon-tycoon.jpeg";
import readySetBet from "./images/board-games/ready-set-bet.jpeg";
import sushiGoParty from "./images/board-games/sushi-go-party.jpeg";

// PLACEHOLDER content — ratings and reviews below are drafted generically.
// Swap in your own star ratings and blurbs before this ships.
const boardGames = [
  {
    title: "Tiny Towns",
    image: tinyTowns,
    rating: 3.5,
    review:
      "Will you architest the best tiny town? Tiny Towns is a piece placement game which feels very dynamic and constrained at the same time.  Players take turns announcing pieces that everyone has to put on their board, making it a fun optimisation problem! \n\n I initially loved this game but it feels like you can 'solve' it the more you play it, which is why it's gone a bit lower in my ratings.",
  },
  {
    title: "Coup",
    image: coup,
    rating: 4,
    review:
      "A classic game of deceiption - lie, cheat, do watever you can to elliminate your oponents and be the last one standing. This is a classic game and one of my favourite party games. Each player has 2 hidden cards which allow them to take actions. The main strategy is that you can pretend you have any of the available cards to take any action you want, just don't get caught! \n\n I like this, but it often results in 2 start turns of everyone claiming 'Duke'.",
  },
  {
    title: "Diamant",
    image: diamant,
    rating: 5,
    review:
      "You are a team of mine explorers, looking for treasure! Will you be brave enough to go deeper in the mine and get more treasure or avoid the risk of the walls collapsing and leave with what you have? \n \n This game has always been a crowd peaser for me, easy to teach and very replayable.",
  },
  {
    title: "Jaipur",
    image: jaipur,
    rating: 4.5,
    review:
      "Will you be the best trader? Can you manage your camels and good better than the oponent? This is an easy, fast paced, 2 player trading game. \n \n It's always a pleasure to play it, but I may be biased as I often win!",
  },
  {
    title: "Junk Art",
    image: junkArt,
    rating: 4,
    review:
      "Are you the best artist in town? Compete against your oponents for the best junk scupture across multipe cities and come on top! \n \n This is a great game of dexterity and strategy and each 'city' has a different game mode, making it fun and diverse.",
  },
  {
    title: "Harmonies",
    image: harmonies,
    rating: 4.5,
    review:
      "A relaxing tile-stacking game about building little landscapes and habitats for wildlife. There is a small amount of interaction as you can see what benefits your oponents but overall it's mainly independent play and very satisfying.",
  },
  {
    title: "High Society",
    image: highSociety,
    rating: 4,
    review:
      "You are French aristocrats aiming to show off your wealth but be careful -  if you spend too much you'd be shunned away from society as a whole! This is a sharp bidding game that plays up to 4 and definitely another favourite of mine.",
  },
  {
    title: "Raccoon Tycoon",
    image: raccoonTycoon,
    rating: 4,
    review:
      "You are the racoon, but can you become a tycoon? \n  An economic game of trading goods, running a railroad, and riding a fluctuating market! \n\n Produce goods, buy towns, bid for railroads and sell goods to make money.",
  },
  {
    title: "Ready Set Bet",
    image: readySetBet,
    rating: 4,
    review:
      "And we're off to the races! Fast-paced betting game - lots of shouting and poorly though out bets, perfect family night in. \n\n I would recommend getting the web app for this to automate the comentator and horse movements!",
  },
  {
    title: "Sushi Go Party!",
    image: sushiGoParty,
    rating: 3.5,
    review:
      "Get the best food off the conveyer belt before it's too late! It's a card drafting game with multiple game modes. It works reallt well with larger groups and is very dynamic. ",
  },
];

function Stars({ rating }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="board-game-stars" aria-label={`${filled} out of 5 stars`}>
      {"★".repeat(filled)}
      {"☆".repeat(5 - filled)}
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
              <img
                className="board-game-photo"
                src={game.image}
                alt={game.title}
              />
              <h3>{game.title}</h3>
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
