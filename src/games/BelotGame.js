import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createShuffledDeck, dealInitial, dealFinal,
  getValidCards, trickWinner, trickPoints,
  aiChooseBid, aiChooseCard, aiChooseContra,
  getDeclarations, resolveDeclarations,
  nextPlayer, roundTotal,
  SUIT_SYMBOLS, SUIT_COLORS, BID_RANK, BID_LABELS,
} from './belotLogic';
import './BelotGame.css';

const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
const ALL_BID_TYPES = ['clubs', 'diamonds', 'hearts', 'spades', 'noTrumps', 'allTrumps'];
const PLAYER_NAMES = ['You', 'Left', 'Partner', 'Right'];
const AI_DELAY = 700;
const TARGET_SCORE = 151;

function teamOf(p) { return p % 2; }
function leadsMsg(p) { return p === 0 ? 'Your lead.' : `${PLAYER_NAMES[p]} leads.`; }
function winsMsg(p)  { return p === 0 ? 'You win the trick!' : `${PLAYER_NAMES[p]} wins the trick!`; }
function turnMsg(p)  { return p === 0 ? 'Your turn.' : `${PLAYER_NAMES[p]}'s turn.`; }

// ─── Card component ───────────────────────────────────────────────────────────

function PlayingCard({ card, faceDown, clickable, onClick, small }) {
  if (faceDown) return <div className={`bcard bcard-back${small ? ' bcard-small' : ''}`} />;
  const color = SUIT_COLORS[card.suit];
  return (
    <div
      className={`bcard${clickable ? ' bcard-clickable' : ''}${small ? ' bcard-small' : ''}`}
      style={{ '--card-color': color }}
      onClick={clickable ? onClick : undefined}
    >
      <span className="bcard-rank">{card.rank}</span>
      <span className="bcard-suit">{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}

// ─── Round initialisation ──────────────────────────────────────────────────────

function newRound(prevScores = [0, 0], dealer = 0) {
  const deck = createShuffledDeck();
  const { hands, remaining } = dealInitial(deck);
  const firstBidder = nextPlayer(dealer);
  return {
    phase: 'bidding',
    hands,
    remaining,
    dealer,
    currentBidder: firstBidder,
    highestBid: null,
    passesAfterBid: 0,
    totalPasses: 0,
    bidHistory: [],          // { player, type } — type null means pass
    contra: null,
    contraTeam: null,
    trump: null,
    contractTeam: null,
    currentPlayer: null,
    trick: [],
    tricksDone: 0,
    teamTrickPoints: [0, 0],
    teamDeclPoints: [0, 0],
    declResolution: null,
    teamScores: prevScores,
    lastTrickWinner: null,
    resultMsg: null,
    message: `Dealer: ${PLAYER_NAMES[dealer]}. ${PLAYER_NAMES[firstBidder]} bids first.`,
  };
}

// ─── Bidding ──────────────────────────────────────────────────────────────────

function applyBid(state, playerIdx, bidType) {
  const isValid = bidType && (!state.highestBid || BID_RANK[bidType] > BID_RANK[state.highestBid.type]);
  const highestBid     = isValid ? { player: playerIdx, type: bidType } : state.highestBid;
  const passesAfterBid = isValid ? 0 : state.passesAfterBid + (state.highestBid ? 1 : 0);
  const totalPasses    = bidType ? state.totalPasses : state.totalPasses + 1;
  const bidHistory     = [...state.bidHistory, { player: playerIdx, type: bidType ?? null }];
  const biddingDone    = (highestBid && passesAfterBid >= 3) || totalPasses >= 4;

  if (totalPasses >= 4) {
    return newRound(state.teamScores, nextPlayer(state.dealer));
  }

  if (biddingDone && highestBid) {
    const trump        = highestBid.type;
    const contractTeam = teamOf(highestBid.player);
    const fullHands    = dealFinal(state.hands, state.remaining);
    const teamDecls    = [
      [...getDeclarations(fullHands[0], trump), ...getDeclarations(fullHands[2], trump)],
      [...getDeclarations(fullHands[1], trump), ...getDeclarations(fullHands[3], trump)],
    ];
    const declResolution  = resolveDeclarations(teamDecls, contractTeam, trump);
    const teamDeclPoints  = declResolution.map(r => r.belotePoints + r.declPoints);
    return {
      ...state,
      highestBid, passesAfterBid, totalPasses, bidHistory,
      phase: 'contra',
      trump, contractTeam,
      hands: fullHands,
      remaining: [],
      teamDecls, declResolution, teamDeclPoints,
      message: `${BID_LABELS[trump]} contract by ${PLAYER_NAMES[highestBid.player]}. Contra?`,
    };
  }

  const next = nextPlayer(playerIdx);
  const bidLabel = bidType ? BID_LABELS[bidType] : 'Pass';
  return {
    ...state,
    highestBid, passesAfterBid, totalPasses, bidHistory,
    currentBidder: next,
    message: `${PLAYER_NAMES[playerIdx]}: ${bidLabel}. ${
      highestBid ? `Current: ${BID_LABELS[highestBid.type]}. ` : ''
    }${next === 0 ? 'Your turn to bid.' : `${PLAYER_NAMES[next]} is thinking…`}`,
  };
}

// ─── Contra / Re-Contra ───────────────────────────────────────────────────────

function applyContra(state, action) {
  if (action === 'contra')   return { ...state, contra: 'contra',   contraTeam: 1 - state.contractTeam, message: 'Contra! Contract team may Re-Contra.' };
  if (action === 'reContra') return { ...state, contra: 'reContra', message: 'Re-Contra! Starting play…' };
  return startPlaying(state);
}

function startPlaying(state) {
  const firstPlayer = nextPlayer(state.dealer);
  return {
    ...state,
    phase: 'playing',
    currentPlayer: firstPlayer,
    trick: [],
    message: `${BID_LABELS[state.trump]} is trump! ${leadsMsg(firstPlayer)}`,
  };
}

// ─── Play ──────────────────────────────────────────────────────────────────────

function applyPlayCard(state, playerIdx, card) {
  const newHands = state.hands.map((h, i) =>
    i === playerIdx ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.trick, { card, player: playerIdx }];

  if (newTrick.length < 4) {
    const next = nextPlayer(playerIdx);
    return { ...state, hands: newHands, trick: newTrick, currentPlayer: next, message: turnMsg(next) };
  }

  const winner  = trickWinner(newTrick, state.trump);
  const pts     = trickPoints(newTrick, state.trump);
  const winTeam = teamOf(winner);
  const newTrickPts = [
    state.teamTrickPoints[0] + (winTeam === 0 ? pts : 0),
    state.teamTrickPoints[1] + (winTeam === 1 ? pts : 0),
  ];
  const tricksDone = state.tricksDone + 1;

  if (tricksDone < 8) {
    return { ...state, hands: newHands, trick: newTrick, teamTrickPoints: newTrickPts, tricksDone, lastTrickWinner: winner, currentPlayer: null, message: winsMsg(winner) };
  }
  return finishRound(state, newHands, newTrick, newTrickPts, winner, tricksDone);
}

function finishRound(state, hands, trick, trickPts, lastWinner, tricksDone) {
  const lastTeam = teamOf(lastWinner);
  const withBonus = [
    trickPts[0] + (lastTeam === 0 ? 10 : 0),
    trickPts[1] + (lastTeam === 1 ? 10 : 0),
  ];
  const ct  = state.contractTeam;
  const ot  = 1 - ct;
  const total = roundTotal(state.trump) + 10;
  const contractPoints = withBonus[ct] + (state.teamDeclPoints?.[ct] ?? 0);
  const oppPoints      = withBonus[ot] + (state.teamDeclPoints?.[ot] ?? 0);

  let roundResult;
  if (contractPoints > oppPoints) {
    roundResult = [
      withBonus[0] + (state.teamDeclPoints?.[0] ?? 0),
      withBonus[1] + (state.teamDeclPoints?.[1] ?? 0),
    ];
  } else {
    roundResult = ct === 0
      ? [0, total + (state.teamDeclPoints?.[0] ?? 0)]
      : [total + (state.teamDeclPoints?.[1] ?? 0), 0];
  }

  const mult = state.contra === 'reContra' ? 4 : state.contra === 'contra' ? 2 : 1;
  if (mult > 1) {
    const ctPts = roundResult[ct] * mult;
    const otPts = roundResult[ot] * mult;
    roundResult = ct === 0 ? [ctPts, otPts] : [otPts, ctPts];
  }

  const newScores  = [state.teamScores[0] + roundResult[0], state.teamScores[1] + roundResult[1]];
  const failed     = contractPoints <= oppPoints;
  const gameOver   = newScores[0] >= TARGET_SCORE || newScores[1] >= TARGET_SCORE;
  const gameWinner = newScores[0] >= TARGET_SCORE ? 0 : newScores[1] >= TARGET_SCORE ? 1 : null;
  const contraTag  = mult > 1 ? ` (×${mult})` : '';
  const resultMsg  = failed ? `Contract failed! Opponents take all.${contraTag}` : `Contract made!${contraTag}`;

  return {
    ...state, hands, trick,
    teamTrickPoints: withBonus, tricksDone,
    lastTrickWinner: lastWinner,
    teamScores: newScores,
    currentPlayer: null,
    phase: gameOver ? 'gameOver' : 'roundEnd',
    resultMsg,
    message: gameOver ? `Game over! ${gameWinner === 0 ? 'Your team wins!' : 'Opponents win!'}` : resultMsg,
    gameWinner, roundResult,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BelotGame({ onBack }) {
  const [game, setGame]               = useState(() => newRound());
  const [trickDisplay, setTrickDisplay] = useState([]);
  const [showingTrick, setShowingTrick] = useState(false);
  const [contraActed, setContraActed] = useState(false);

  // Drag state for hand reordering
  const [dragSrc, setDragSrc]   = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const dragSrcRef = useRef(null);

  const reorderHand = useCallback((from, to) => {
    if (from === to || from == null) return;
    setGame(prev => {
      const hand = [...prev.hands[0]];
      const [moved] = hand.splice(from, 1);
      hand.splice(to, 0, moved);
      return { ...prev, hands: [hand, ...prev.hands.slice(1)] };
    });
  }, []);

  // ── AI bidding ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (game.phase !== 'bidding' || game.currentBidder === 0) return;
    const t = setTimeout(() => {
      setGame(prev => {
        if (prev.phase !== 'bidding' || prev.currentBidder === 0) return prev;
        const bidType = aiChooseBid(prev.hands[prev.currentBidder], prev.highestBid);
        return applyBid(prev, prev.currentBidder, bidType);
      });
    }, AI_DELAY);
    return () => clearTimeout(t);
  }, [game.phase, game.currentBidder]);

  // ── AI contra ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (game.phase !== 'contra' || contraActed) return;
    setContraActed(true);
    const t = setTimeout(() => {
      setGame(prev => {
        if (prev.phase !== 'contra') return prev;
        const oppTeam    = 1 - prev.contractTeam;
        const oppPlayers = [1, 3].filter(p => teamOf(p) === oppTeam);
        const wantsContra = oppPlayers.some(p =>
          aiChooseContra(prev.hands[p], prev.trump, prev.contractTeam, oppTeam)
        );
        if (wantsContra && !prev.contra) {
          return { ...prev, contra: 'contra', contraTeam: oppTeam, message: `${PLAYER_NAMES[oppPlayers[0]]} declares Contra!` };
        }
        return prev;
      });
    }, AI_DELAY);

    // Auto-proceed after contra window if human team is the contract team (no action needed from human)
    // OR if human already had a chance (contraActed covers this)
    const t2 = setTimeout(() => {
      setGame(prev => {
        if (prev.phase !== 'contra') return prev;
        // Only auto-proceed if human doesn't need to act (human is contract team and AI may contra, or human is opposing team and already saw contra)
        return startPlaying(prev);
      });
    }, AI_DELAY * 4);

    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [game.phase, contraActed]);

  useEffect(() => {
    if (game.phase !== 'contra') setContraActed(false);
  }, [game.phase]);

  // ── AI card play ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (game.phase !== 'playing' || game.currentPlayer === 0 || game.currentPlayer === null) return;
    if (showingTrick) return;
    const t = setTimeout(() => {
      setGame(prev => {
        if (prev.phase !== 'playing' || prev.currentPlayer === 0 || prev.currentPlayer === null) return prev;
        const card = aiChooseCard(prev.hands[prev.currentPlayer], prev.trick, prev.trump, prev.currentPlayer);
        return applyPlayCard(prev, prev.currentPlayer, card);
      });
    }, AI_DELAY);
    return () => clearTimeout(t);
  }, [game.phase, game.currentPlayer, game.trick.length, showingTrick]);

  // ── Trick reveal ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (game.trick.length !== 4 || game.currentPlayer !== null || showingTrick) return;
    if (game.phase === 'roundEnd' || game.phase === 'gameOver') return;
    setTrickDisplay(game.trick);
    setShowingTrick(true);
    const t = setTimeout(() => {
      setShowingTrick(false);
      setGame(prev => {
        if (prev.phase !== 'playing') return prev;
        return { ...prev, trick: [], currentPlayer: prev.lastTrickWinner, message: leadsMsg(prev.lastTrickWinner) };
      });
    }, 1400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.trick.length, game.currentPlayer, game.phase, showingTrick]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleBid = useCallback((bidType) => {
    setGame(prev => {
      if (prev.phase !== 'bidding' || prev.currentBidder !== 0) return prev;
      return applyBid(prev, 0, bidType);
    });
  }, []);

  const handlePass = useCallback(() => {
    setGame(prev => {
      if (prev.phase !== 'bidding' || prev.currentBidder !== 0) return prev;
      return applyBid(prev, 0, null);
    });
  }, []);

  const handleContra = useCallback((action) => {
    setGame(prev => {
      if (prev.phase !== 'contra') return prev;
      const next = applyContra(prev, action);
      if (action === 'pass') return startPlaying(prev);
      return next;
    });
  }, []);

  const handleCardClick = useCallback((card) => {
    setGame(prev => {
      if (prev.phase !== 'playing' || prev.currentPlayer !== 0) return prev;
      const valid = getValidCards(prev.hands[0], prev.trick, prev.trump, 0);
      if (!valid.find(c => c.id === card.id)) return prev;
      return applyPlayCard(prev, 0, card);
    });
  }, []);

  const startNewRound = useCallback(() => {
    setTrickDisplay([]); setShowingTrick(false);
    setGame(prev => newRound(prev.teamScores, nextPlayer(prev.dealer)));
  }, []);

  const startNewGame = useCallback(() => {
    setTrickDisplay([]); setShowingTrick(false);
    setGame(newRound());
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────────
  const validIds = new Set(
    game.phase === 'playing' && game.currentPlayer === 0 && !showingTrick
      ? getValidCards(game.hands[0], game.trick, game.trump, 0).map(c => c.id)
      : []
  );
  const currentTrick   = showingTrick ? trickDisplay : game.trick;
  const isMyBidTurn    = game.phase === 'bidding' && game.currentBidder === 0;
  const biddableSet    = new Set(
    isMyBidTurn
      ? ALL_BID_TYPES.filter(t => !game.highestBid || BID_RANK[t] > BID_RANK[game.highestBid.type])
      : []
  );
  const canContra      = game.phase === 'contra' && teamOf(0) !== game.contractTeam && !game.contra;
  const canReContra    = game.phase === 'contra' && game.contra === 'contra' && teamOf(0) === game.contractTeam;

  const trumpLabel = game.trump
    ? (game.trump === 'noTrumps' ? 'No Trumps' : game.trump === 'allTrumps' ? 'All Trumps' : SUIT_SYMBOLS[game.trump])
    : null;
  const trumpColor = game.trump && !['noTrumps', 'allTrumps'].includes(game.trump)
    ? SUIT_COLORS[game.trump] : '#d4c97a';

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="belot-root">

      {/* Header */}
      <div className="belot-header">
        <button className="belot-back-btn" onClick={onBack}>← Back</button>
        <h2 className="belot-title">Bulgarian Belot</h2>
        <div className="belot-scores">
          <span className="score-chip score-us">Us: {game.teamScores[0]}</span>
          <span className="score-chip score-them">Them: {game.teamScores[1]}</span>
        </div>
      </div>

      {/* Contract / trump bar */}
      {game.trump && (
        <div className="belot-trump-bar" style={{ '--tc': trumpColor }}>
          <span>Contract: <strong>{trumpLabel}</strong> by {PLAYER_NAMES[game.highestBid?.player ?? 0]}</span>
          {game.contra === 'contra'   && <span className="contra-tag">CONTRA ×2</span>}
          {game.contra === 'reContra' && <span className="contra-tag reContra-tag">RE-CONTRA ×4</span>}
          {game.declResolution?.map((r, i) =>
            (r.belotePoints + r.declPoints > 0) ? (
              <span key={i} className="belote-tag">
                {i === 0 ? 'Us' : 'Them'} decl: +{r.belotePoints + r.declPoints}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Table */}
      <div className="belot-table">

        {/* Partner (top) */}
        <div className="belot-seat belot-top">
          <span className="seat-label">Partner</span>
          <div className="hand-row">
            {game.hands[2].map((_, i) => <PlayingCard key={i} faceDown small />)}
          </div>
        </div>

        {/* Left opponent */}
        <div className="belot-seat belot-left">
          <span className="seat-label">Left</span>
          <div className="hand-col">
            {game.hands[1].map((_, i) => <PlayingCard key={i} faceDown small />)}
          </div>
        </div>

        {/* Center */}
        <div className="belot-center">

          {/* Trick area */}
          <div className="trick-area">
            {currentTrick.map((entry, i) => (
              <div key={i} className="trick-slot">
                <span className="trick-player-label">{PLAYER_NAMES[entry.player]}</span>
                <PlayingCard card={entry.card} />
              </div>
            ))}
            {currentTrick.length === 0 && <span className="trick-empty">— trick area —</span>}
          </div>

          {/* Bid history */}
          {game.phase === 'bidding' && game.bidHistory.length > 0 && (
            <div className="bid-history">
              {game.bidHistory.map((e, i) => (
                <span key={i} className={`bid-hist-entry ${e.type ? 'bid-hist-bid' : 'bid-hist-pass'}`}>
                  {PLAYER_NAMES[e.player]}: {e.type ? BID_LABELS[e.type] : '—'}
                </span>
              ))}
            </div>
          )}

          {/* Bidding controls — always visible during bidding phase */}
          {game.phase === 'bidding' && (
            <div className="bid-panel">
              <p className="bid-prompt">
                {isMyBidTurn ? 'Your bid:' : (
                  <span className="bid-waiting-txt">
                    <span className="spinner" /> {PLAYER_NAMES[game.currentBidder]} is thinking…
                  </span>
                )}
              </p>
              <div className="bid-buttons">
                {ALL_BID_TYPES.map(t => {
                  const isSuit = SUITS.includes(t);
                  const ok     = biddableSet.has(t);
                  return (
                    <button
                      key={t}
                      className={`bid-btn${!ok ? ' bid-btn-disabled' : ''}${!isSuit ? ' bid-btn-text' : ''}`}
                      style={isSuit ? { '--sc': SUIT_COLORS[t] } : {}}
                      onClick={() => { if (ok) handleBid(t); }}
                      disabled={!ok}
                      title={t === 'noTrumps' ? 'No Trumps' : t === 'allTrumps' ? 'All Trumps' : t}
                    >
                      {BID_LABELS[t]}
                    </button>
                  );
                })}
                <button
                  className="bid-btn bid-pass"
                  onClick={handlePass}
                  disabled={!isMyBidTurn}
                >
                  Pass
                </button>
              </div>
              {isMyBidTurn && !biddableSet.size && (
                <p className="bid-no-valid">No valid bids — you must pass.</p>
              )}
            </div>
          )}

          {/* Contra panel */}
          {game.phase === 'contra' && (canContra || canReContra) && (
            <div className="contra-panel">
              {canContra && (
                <>
                  <p className="bid-prompt">Declare Contra? (doubles score)</p>
                  <div className="bid-buttons">
                    <button className="belot-btn contra-btn" onClick={() => handleContra('contra')}>Contra!</button>
                    <button className="belot-btn" onClick={() => handleContra('pass')}>Pass</button>
                  </div>
                </>
              )}
              {canReContra && (
                <>
                  <p className="bid-prompt">Re-Contra? (×4 score)</p>
                  <div className="bid-buttons">
                    <button className="belot-btn contra-btn" onClick={() => handleContra('reContra')}>Re-Contra!</button>
                    <button className="belot-btn" onClick={() => handleContra('pass')}>Pass</button>
                  </div>
                </>
              )}
            </div>
          )}
          {game.phase === 'contra' && !canContra && !canReContra && (
            <div className="bid-waiting">
              <span className="spinner" /> Waiting…
            </div>
          )}

          {/* Declarations note during first trick */}
          {game.phase === 'playing' && game.tricksDone === 0 && game.declResolution &&
            (game.declResolution[0].declPoints + game.declResolution[0].belotePoints +
             game.declResolution[1].declPoints + game.declResolution[1].belotePoints > 0) && (
            <div className="decl-summary">
              {game.declResolution.map((r, i) =>
                (r.declPoints + r.belotePoints > 0) ? (
                  <span key={i} className={`decl-chip ${i === 0 ? 'decl-us' : 'decl-them'}`}>
                    {i === 0 ? 'Us' : 'Them'}: +{r.declPoints + r.belotePoints} decl
                  </span>
                ) : null
              )}
            </div>
          )}

          <p className="belot-message">{game.message}</p>

          {/* Round end */}
          {game.phase === 'roundEnd' && !showingTrick && (
            <div className="round-end-panel">
              <p className="result-label">{game.resultMsg}</p>
              <div className="round-scores">
                <span>Us: +{game.roundResult?.[0] ?? 0}</span>
                <span>Them: +{game.roundResult?.[1] ?? 0}</span>
              </div>
              <div className="round-scores" style={{ fontSize: '0.8rem', color: '#888' }}>
                <span>Total Us: {game.teamScores[0]}</span>
                <span>Total Them: {game.teamScores[1]}</span>
              </div>
              <button className="belot-btn" onClick={startNewRound}>Next Round →</button>
            </div>
          )}

          {/* Game over */}
          {game.phase === 'gameOver' && (
            <div className="round-end-panel">
              <p className="game-over-msg">
                {game.gameWinner === 0 ? '🏆 Your team wins!' : '💀 Opponents win!'}
              </p>
              <div className="round-scores">
                <span>Us: {game.teamScores[0]}</span>
                <span>Them: {game.teamScores[1]}</span>
              </div>
              <button className="belot-btn" onClick={startNewGame}>Play Again</button>
            </div>
          )}
        </div>

        {/* Right opponent */}
        <div className="belot-seat belot-right">
          <span className="seat-label">Right</span>
          <div className="hand-col">
            {game.hands[3].map((_, i) => <PlayingCard key={i} faceDown small />)}
          </div>
        </div>
      </div>

      {/* Human hand — with drag-and-drop reordering */}
      <div className="belot-hand-area">
        <span className="seat-label">Your Hand — drag to reorder</span>
        <div className="hand-row hand-row-main">
          {game.hands[0].map((card, idx) => (
            <div
              key={card.id}
              className={`hand-card-wrap${dragOver === idx && dragSrc !== idx ? ' drag-over' : ''}`}
              draggable
              onDragStart={() => { setDragSrc(idx); dragSrcRef.current = idx; }}
              onDragEnd={() => { setDragSrc(null); setDragOver(null); dragSrcRef.current = null; }}
              onDragOver={e => { e.preventDefault(); if (dragOver !== idx) setDragOver(idx); }}
              onDrop={e => {
                e.preventDefault();
                reorderHand(dragSrcRef.current, idx);
                setDragSrc(null); setDragOver(null);
              }}
            >
              <PlayingCard
                card={card}
                clickable={validIds.has(card.id)}
                onClick={() => handleCardClick(card)}
              />
            </div>
          ))}
        </div>
        {game.phase === 'playing' && (game.teamDeclPoints?.[0] ?? 0) > 0 && (
          <span className="hand-decl-note">Your declarations: {game.teamDeclPoints[0]} pts</span>
        )}
      </div>
    </div>
  );
}
