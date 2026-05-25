export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
export const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUIT_SYMBOLS = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' };
export const SUIT_COLORS  = { clubs: '#1a1a2e', diamonds: '#c0392b', hearts: '#c0392b', spades: '#1a1a2e' };

// Bid hierarchy: clubs < diamonds < hearts < spades < noTrumps < allTrumps
export const BID_RANK = { clubs: 0, diamonds: 1, hearts: 2, spades: 3, noTrumps: 4, allTrumps: 5 };
export const BID_LABELS = {
  clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠', noTrumps: 'NT', allTrumps: 'AT',
};

// Counter-clockwise next player
export function nextPlayer(p) { return (p + 3) % 4; }

// ─── Deck ─────────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createShuffledDeck() {
  return shuffle(SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank, id: `${rank}-${suit}` }))));
}

// Deal 3+2 to each player (5 cards each), return { hands, remaining }
export function dealInitial(deck) {
  const hands = [[], [], [], []];
  // 3 cards each, counter-clockwise starting from index 0
  for (let i = 0; i < 3; i++) for (let p = 0; p < 4; p++) hands[p].push(deck[i * 4 + p]);
  // 2 more each
  for (let i = 0; i < 2; i++) for (let p = 0; p < 4; p++) hands[p].push(deck[12 + i * 4 + p]);
  return { hands, remaining: deck.slice(20) };
}

// Deal final 3 cards to each player after bidding
export function dealFinal(hands, remaining) {
  const newHands = hands.map(h => [...h]);
  for (let i = 0; i < 3; i++) for (let p = 0; p < 4; p++) newHands[p].push(remaining[i * 4 + p]);
  return newHands;
}

// ─── Card values ──────────────────────────────────────────────────────────────

const TRUMP_VALUES = { J: 20, 9: 14, A: 11, 10: 10, K: 4, Q: 3, 8: 0, 7: 0 };
const PLAIN_VALUES = { A: 11, 10: 10, K: 4, Q: 3, J: 2, 9: 0, 8: 0, 7: 0 };

export function cardValue(card, trump) {
  if (trump === 'allTrumps') return TRUMP_VALUES[card.rank];
  if (trump === 'noTrumps')  return PLAIN_VALUES[card.rank] * 2;
  if (card.suit === trump)   return TRUMP_VALUES[card.rank];
  return PLAIN_VALUES[card.rank];
}

// ─── Card ordering ────────────────────────────────────────────────────────────

const TRUMP_ORDER = { J: 7, 9: 6, A: 5, 10: 4, K: 3, Q: 2, 8: 1, 7: 0 };
const PLAIN_ORDER = { A: 7, 10: 6, K: 5, Q: 4, J: 3, 9: 2, 8: 1, 7: 0 };

export function isTrumpCard(card, trump) {
  if (trump === 'allTrumps') return true;
  if (trump === 'noTrumps')  return false;
  return card.suit === trump;
}

export function cardStrength(card, trump, ledSuit) {
  const isTrump = isTrumpCard(card, trump);
  if (isTrump && trump !== 'allTrumps') {
    return 1000 + TRUMP_ORDER[card.rank];
  }
  if (trump === 'allTrumps') {
    // All suits use trump order, but only led suit can win
    if (card.suit === ledSuit) return 1000 + TRUMP_ORDER[card.rank];
    return -1;
  }
  if (card.suit === ledSuit) return 100 + PLAIN_ORDER[card.rank];
  return -1;
}

// ─── Trick logic ──────────────────────────────────────────────────────────────

export function trickWinner(trick, trump) {
  const ledSuit = trick[0].card.suit;
  return trick.reduce((best, e) =>
    cardStrength(e.card, trump, ledSuit) > cardStrength(best.card, trump, ledSuit) ? e : best
  ).player;
}

export function trickPoints(trick, trump) {
  return trick.reduce((sum, e) => sum + cardValue(e.card, trump), 0);
}

// ─── Valid cards ──────────────────────────────────────────────────────────────

export function getValidCards(hand, trick, trump, playerIdx) {
  if (trick.length === 0) return hand;

  const ledSuit = trick[0].card.suit;

  // Teammate exemption: if partner is currently winning, play anything
  const currentWinner = trick.reduce((best, e) =>
    cardStrength(e.card, trump, ledSuit) > cardStrength(best.card, trump, ledSuit) ? e : best
  );
  if (currentWinner.player % 2 === playerIdx % 2) return hand;

  // Must follow led suit
  const sameSuit = hand.filter(c => c.suit === ledSuit);
  if (sameSuit.length > 0) {
    // If led suit is trump (or allTrumps), enforce overtrump
    if (ledSuit === trump || trump === 'allTrumps') {
      const bestInTrick = trick
        .filter(e => e.card.suit === ledSuit)
        .reduce((b, e) => TRUMP_ORDER[e.card.rank] > TRUMP_ORDER[b.rank] ? e.card : b, { rank: '-' });
      const over = sameSuit.filter(c => TRUMP_ORDER[c.rank] > (TRUMP_ORDER[bestInTrick.rank] ?? -1));
      if (over.length > 0) return over;
    }
    return sameSuit;
  }

  // No Trumps / All Trumps: can't follow suit → play anything
  if (trump === 'noTrumps' || trump === 'allTrumps') return hand;

  // Must trump if possible
  const trumpCards = hand.filter(c => c.suit === trump);
  if (trumpCards.length > 0) {
    // Must overtrump the highest trump in the trick if possible
    const bestTrumpInTrick = trick
      .filter(e => e.card.suit === trump)
      .reduce((b, e) => TRUMP_ORDER[e.card.rank] > TRUMP_ORDER[(b || { rank: '-' }).rank] ? e.card : b, null);
    if (bestTrumpInTrick) {
      const over = trumpCards.filter(c => TRUMP_ORDER[c.rank] > TRUMP_ORDER[bestTrumpInTrick.rank]);
      if (over.length > 0) return over;
    }
    return trumpCards;
  }

  return hand;
}

// ─── Declarations ─────────────────────────────────────────────────────────────

const SEQ_ORDER = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function findSequences(hand) {
  const result = [];
  for (const suit of SUITS) {
    const suitCards = hand.filter(c => c.suit === suit);
    const indices = suitCards.map(c => SEQ_ORDER.indexOf(c.rank)).sort((a, b) => a - b);
    if (indices.length < 3) continue;
    let start = 0;
    while (start < indices.length) {
      let end = start;
      while (end + 1 < indices.length && indices[end + 1] === indices[end] + 1) end++;
      const len = end - start + 1;
      if (len >= 3) {
        const points = len >= 5 ? 100 : len === 4 ? 50 : 20;
        result.push({ type: 'sequence', suit, len, topRank: SEQ_ORDER[indices[end]], points });
      }
      start = end + 1;
    }
  }
  return result;
}

export function findFourOfAKind(hand) {
  const result = [];
  const scoredRanks = { J: 200, 9: 150, A: 100, K: 100, Q: 100, 10: 100 };
  for (const rank of Object.keys(scoredRanks)) {
    if (hand.filter(c => c.rank === rank).length === 4) {
      result.push({ type: 'four', rank, points: scoredRanks[rank] });
    }
  }
  return result;
}

export function findBelote(hand, trump) {
  if (!trump || trump === 'noTrumps') return [];
  const trumpSuits = trump === 'allTrumps' ? SUITS : [trump];
  return trumpSuits
    .filter(s => hand.some(c => c.suit === s && c.rank === 'K') && hand.some(c => c.suit === s && c.rank === 'Q'))
    .map(s => ({ type: 'belote', suit: s, points: 20 }));
}

// Returns all declarations for a hand
export function getDeclarations(hand, trump) {
  return [...findFourOfAKind(hand), ...findSequences(hand), ...findBelote(hand, trump)];
}

// Compare the "best" declaration between two teams to decide who scores sequences/fours
// Returns 0 if team0 wins, 1 if team1 wins, -1 if tie (contract team wins)
function bestDeclarationRank(decls) {
  // Fours beat sequences. Higher points win. Ties: top rank order, then trump suit.
  const fours = decls.filter(d => d.type === 'four');
  if (fours.length > 0) return { category: 2, points: Math.max(...fours.map(d => d.points)) };
  const seqs = decls.filter(d => d.type === 'sequence');
  if (seqs.length > 0) {
    const best = seqs.reduce((b, d) =>
      d.len > b.len || (d.len === b.len && SEQ_ORDER.indexOf(d.topRank) > SEQ_ORDER.indexOf(b.topRank)) ? d : b
    );
    return { category: 1, points: best.points, len: best.len, topRank: best.topRank, suit: best.suit };
  }
  return null;
}

// Returns { winner: 0|1, teamDecls: [[decls for t0], [decls for t1]] }
export function resolveDeclarations(teamDecls, contractTeam, trump) {
  const ranks = teamDecls.map(bestDeclarationRank);
  let winner = contractTeam; // default: contract team wins tie
  if (ranks[0] && !ranks[1]) winner = 0;
  else if (!ranks[0] && ranks[1]) winner = 1;
  else if (ranks[0] && ranks[1]) {
    if (ranks[0].category !== ranks[1].category) {
      winner = ranks[0].category > ranks[1].category ? 0 : 1;
    } else if (ranks[0].points !== ranks[1].points) {
      winner = ranks[0].points > ranks[1].points ? 0 : 1;
    } else if (ranks[0].len !== undefined && ranks[0].len === ranks[1].len) {
      // Same length sequence: trump suit wins, else contract team
      const t0hasTrump = teamDecls[0].some(d => d.type === 'sequence' && (d.suit === trump || trump === 'allTrumps'));
      const t1hasTrump = teamDecls[1].some(d => d.type === 'sequence' && (d.suit === trump || trump === 'allTrumps'));
      if (t0hasTrump && !t1hasTrump) winner = 0;
      else if (!t0hasTrump && t1hasTrump) winner = 1;
      else winner = contractTeam;
    } else {
      winner = contractTeam;
    }
  }
  // Belotes always score regardless; sequences/fours only for winner
  const scoredDecls = teamDecls.map((decls, team) => ({
    belotePoints: decls.filter(d => d.type === 'belote').reduce((s, d) => s + d.points, 0),
    declPoints: team === winner
      ? decls.filter(d => d.type !== 'belote').reduce((s, d) => s + d.points, 0)
      : 0,
    decls,
    winner: team === winner,
  }));
  return scoredDecls;
}

// ─── Belote helper ────────────────────────────────────────────────────────────

export function hasBelote(hand, trump) {
  if (!trump || trump === 'noTrumps') return false;
  const suits = trump === 'allTrumps' ? SUITS : [trump];
  return suits.some(s => hand.some(c => c.suit === s && c.rank === 'K') && hand.some(c => c.suit === s && c.rank === 'Q'));
}

// ─── Round total (max points in the deck) ─────────────────────────────────────

export function roundTotal(trump) {
  if (trump === 'allTrumps') return 248; // 4×62
  if (trump === 'noTrumps')  return 240; // 4×60
  return 152; // 3×30 + 62 (one trump suit)
}

// ─── AI ───────────────────────────────────────────────────────────────────────

function suitStrength(hand, suit) {
  return hand.filter(c => c.suit === suit)
    .reduce((s, c) => s + ({ J: 6, 9: 5, A: 3, 10: 2, K: 1, Q: 1 }[c.rank] ?? 0), 0);
}

function handNoTrumpStrength(hand) {
  return hand.reduce((s, c) => s + ({ A: 3, 10: 2, K: 1, Q: 1 }[c.rank] ?? 0), 0);
}

function handAllTrumpStrength(hand) {
  return hand.reduce((s, c) => s + ({ J: 6, 9: 5, A: 2, 10: 1 }[c.rank] ?? 0), 0);
}

export function aiChooseBid(hand, highestBid) {
  const currentRank = highestBid ? BID_RANK[highestBid.type] : -1;

  // Evaluate each bid type
  let bestType = null;
  let bestScore = 0;

  // Suit bids
  for (const suit of SUITS) {
    if (BID_RANK[suit] <= currentRank) continue;
    const str = suitStrength(hand, suit);
    if (str > bestScore && str >= 5) { bestScore = str; bestType = suit; }
  }

  // No Trumps — requires a very strong no-trump hand
  if (BID_RANK.noTrumps > currentRank) {
    const str = handNoTrumpStrength(hand);
    if (str >= 14 && str > bestScore) { bestScore = str; bestType = 'noTrumps'; }
  }

  // All Trumps — requires exceptional hand with multiple jacks/nines
  if (BID_RANK.allTrumps > currentRank) {
    const str = handAllTrumpStrength(hand);
    if (str >= 20 && str > bestScore) { bestScore = str; bestType = 'allTrumps'; }
  }

  return bestType; // null = pass
}

export function aiChooseCard(hand, trick, trump, playerIdx) {
  const valid = getValidCards(hand, trick, trump, playerIdx);
  if (valid.length === 1) return valid[0];

  if (trick.length === 0) {
    const jackOrNine = valid.find(c => isTrumpCard(c, trump) && (c.rank === 'J' || c.rank === '9'));
    if (jackOrNine) return jackOrNine;
    return valid.reduce((b, c) => cardValue(c, trump) > cardValue(b, trump) ? c : b);
  }

  const ledSuit = trick[0].card.suit;
  const winnerEntry = trick.reduce((b, e) =>
    cardStrength(e.card, trump, ledSuit) > cardStrength(b.card, trump, ledSuit) ? e : b
  );
  const isPartnerWinning = winnerEntry.player % 2 === playerIdx % 2;

  if (isPartnerWinning) {
    return valid.reduce((b, c) => cardValue(c, trump) < cardValue(b, trump) ? c : b);
  }

  const winnerStrength = cardStrength(winnerEntry.card, trump, ledSuit);
  const canBeat = valid.filter(c => cardStrength(c, trump, ledSuit) > winnerStrength);
  if (canBeat.length > 0) {
    return canBeat.reduce((b, c) =>
      cardStrength(c, trump, ledSuit) < cardStrength(b, trump, ledSuit) ? c : b
    );
  }

  return valid.reduce((b, c) => cardValue(c, trump) < cardValue(b, trump) ? c : b);
}

// AI decides whether to Contra (opposing team after contract set)
export function aiChooseContra(hand, trump, contractTeam, aiTeam) {
  if (contractTeam === aiTeam) return false;
  // Only contra if hand is strong vs declared trump
  const strength = trump === 'noTrumps'
    ? handNoTrumpStrength(hand)
    : trump === 'allTrumps'
    ? 0
    : suitStrength(hand, trump);
  return strength >= 6;
}
