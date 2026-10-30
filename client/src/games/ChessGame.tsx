import React, { useState, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../hooks/useRoom';
import { ChessState } from '@shared/types';
import { socket } from '../socket/socketClient';
import { sounds } from '../utils/sound';
import { Crown, RotateCcw, Flag, Handshake, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  P: '♙',
  R: '♖',
  N: '♘',
  B: '♗',
  Q: '♕',
  K: '♔',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessGame: React.FC = () => {
  const { gameState, sendGameAction, myPlayer, lastGameResult, voteRematch } = useRoom();
  const state = gameState as ChessState | null;

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  // Local chess instance for legal move calculation and client responsiveness
  const clientChess = useMemo(() => {
    if (!state?.fen) return new Chess();
    try {
      return new Chess(state.fen);
    } catch {
      return new Chess();
    }
  }, [state?.fen]);

  if (!state) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Waiting for Chess board to initialize...
      </div>
    );
  }

  const isWhite = myPlayer?.socketId === state.players.white.socketId;
  const isBlack = myPlayer?.socketId === state.players.black.socketId;
  const isPlayer = isWhite || isBlack;
  const isMyTurn = myPlayer?.socketId === state.turnPlayerId;
  const isFlipped = isBlack; // Flip board so Black is at bottom

  const displayFiles = isFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = isFlipped ? [...RANKS].reverse() : RANKS;

  // Calculate legal moves for selected square
  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare || !isMyTurn) return [];
    try {
      const moves = clientChess.moves({ square: selectedSquare, verbose: true });
      return moves.map(m => m.to as Square);
    } catch {
      return [];
    }
  }, [selectedSquare, clientChess, isMyTurn]);

  const handleSquareClick = (square: Square) => {
    if (!isMyTurn || state.winner) return;

    const piece = clientChess.get(square);

    // If already selected a piece, check if clicking a valid destination
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      if (legalMovesForSelected.includes(square)) {
        // Check for pawn promotion (pawn moving to rank 8 for white or rank 1 for black)
        const selectedPiece = clientChess.get(selectedSquare);
        const isPromotion =
          selectedPiece?.type === 'p' &&
          ((selectedPiece.color === 'w' && square.endsWith('8')) ||
            (selectedPiece.color === 'b' && square.endsWith('1')));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        // Execute regular move
        sendGameAction('move', { from: selectedSquare, to: square });
        sounds.playPop();
        setSelectedSquare(null);
        return;
      }

      // If clicked on own piece, select that instead
      if (piece && ((piece.color === 'w' && isWhite) || (piece.color === 'b' && isBlack))) {
        setSelectedSquare(square);
        sounds.playPop();
        return;
      }

      setSelectedSquare(null);
      return;
    }

    // Select piece if it's player's piece
    if (piece && ((piece.color === 'w' && isWhite) || (piece.color === 'b' && isBlack))) {
      setSelectedSquare(square);
      sounds.playPop();
    }
  };

  const handlePromotionSelect = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingPromotion) return;
    sendGameAction('move', {
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: piece,
    });
    sounds.playPop();
    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  const handleResign = () => {
    sendGameAction('resign');
    setShowResignConfirm(false);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      {/* Promotion Selector Modal */}
      <AnimatePresence>
        {pendingPromotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full">
              <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white mb-2">
                Pawn Promotion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Choose the piece to promote your pawn to:
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'q', name: 'Queen', icon: isWhite ? '♕' : '♛' },
                  { id: 'r', name: 'Rook', icon: isWhite ? '♖' : '♜' },
                  { id: 'b', name: 'Bishop', icon: isWhite ? '♗' : '♝' },
                  { id: 'n', name: 'Knight', icon: isWhite ? '♘' : '♞' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePromotionSelect(p.id as any)}
                    className="p-4 rounded-2xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/40 border border-slate-200 dark:border-slate-700 text-3xl font-serif hover:scale-105 transition-all cursor-pointer"
                  >
                    <span>{p.icon}</span>
                    <span className="block text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 mt-1">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resign Confirm Modal */}
      <AnimatePresence>
        {showResignConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white mb-2">
                Resign Game?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to resign? Your opponent will be awarded the victory.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowResignConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResign}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/20"
                >
                  Yes, Resign
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Chess Board Column */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Opponent Card (Top) */}
          <div className="w-full max-w-[480px] flex items-center justify-between mb-3 px-2 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">
                {isFlipped ? state.players.white.avatar : state.players.black.avatar}
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isFlipped ? state.players.white.playerName : state.players.black.playerName}</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    ({isFlipped ? 'White ♔' : 'Black ♚'})
                  </span>
                </div>
                {/* Captured pieces */}
                <div className="text-xs font-serif text-slate-500 dark:text-slate-400 min-h-[16px] tracking-tight">
                  {(isFlipped ? state.capturedPieces.b : state.capturedPieces.w).map((p, idx) => (
                    <span key={idx}>{PIECE_SYMBOLS[p] || p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Turn badge */}
            {state.turn === (isFlipped ? 'w' : 'b') && !state.winner && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                Thinking...
              </span>
            )}
          </div>

          {/* 8x8 Chessboard */}
          <div className="relative p-2.5 sm:p-3.5 rounded-3xl bg-amber-950/20 dark:bg-slate-950/80 border-4 border-amber-800/40 dark:border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px] rounded-2xl overflow-hidden border border-amber-900/30">
              {displayRanks.map(rank =>
                displayFiles.map(file => {
                  const square = `${file}${rank}` as Square;
                  const piece = clientChess.get(square);
                  const isLight = (file.charCodeAt(0) - 97 + parseInt(rank)) % 2 !== 0;

                  const isSelected = selectedSquare === square;
                  const isLegalTarget = legalMovesForSelected.includes(square);
                  const isLastMove =
                    state.lastMove?.from === square || state.lastMove?.to === square;
                  const isKingInCheck =
                    state.isCheck && piece?.type === 'k' && piece?.color === state.turn;

                  return (
                    <button
                      key={square}
                      onClick={() => handleSquareClick(square)}
                      className={`relative flex items-center justify-center select-none transition-colors duration-150 cursor-pointer ${
                        isLight
                          ? 'bg-[#f0d9b5] hover:bg-[#ebd0a7]'
                          : 'bg-[#b58863] hover:bg-[#a67b56]'
                      } ${isSelected ? '!bg-amber-300 dark:!bg-amber-400' : ''} ${
                        isLastMove && !isSelected ? 'ring-2 ring-blue-500/50 inset-0' : ''
                      } ${isKingInCheck ? '!bg-rose-500/80' : ''}`}
                    >
                      {/* Legal Move Dot or Ring */}
                      {isLegalTarget && (
                        <div
                          className={`absolute z-10 pointer-events-none rounded-full transition-transform ${
                            piece
                              ? 'w-full h-full border-4 border-emerald-500/70 scale-90'
                              : 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500/70'
                          }`}
                        />
                      )}

                      {/* Chess Piece Symbol */}
                      {piece && (
                        <span
                          className={`text-3xl sm:text-4xl md:text-5xl font-serif transform transition-transform hover:scale-110 drop-shadow-md ${
                            piece.color === 'w'
                              ? 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]'
                              : 'text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
                          }`}
                        >
                          {piece.color === 'w'
                            ? PIECE_SYMBOLS[piece.type.toUpperCase()]
                            : PIECE_SYMBOLS[piece.type]}
                        </span>
                      )}

                      {/* Coordinate Labels */}
                      {file === displayFiles[0] && (
                        <span
                          className={`absolute top-0.5 left-1 text-[9px] font-bold font-mono ${
                            isLight ? 'text-amber-900/60' : 'text-amber-100/60'
                          }`}
                        >
                          {rank}
                        </span>
                      )}
                      {rank === displayRanks[displayRanks.length - 1] && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[9px] font-bold font-mono ${
                            isLight ? 'text-amber-900/60' : 'text-amber-100/60'
                          }`}
                        >
                          {file}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* My Player Card (Bottom) */}
          <div className="w-full max-w-[480px] flex items-center justify-between mt-3 px-2 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">
                {isFlipped ? state.players.black.avatar : state.players.white.avatar}
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isFlipped ? state.players.black.playerName : state.players.white.playerName} (You)</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    ({isFlipped ? 'Black ♚' : 'White ♔'})
                  </span>
                </div>
                {/* Captured pieces */}
                <div className="text-xs font-serif text-slate-500 dark:text-slate-400 min-h-[16px] tracking-tight">
                  {(isFlipped ? state.capturedPieces.w : state.capturedPieces.b).map((p, idx) => (
                    <span key={idx}>{PIECE_SYMBOLS[p] || p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Turn badge */}
            {isMyTurn && !state.winner ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-sm animate-pulse">
                Your Turn ⚡
              </span>
            ) : null}
          </div>
        </div>

        {/* Sidebar Info & Move History */}
        <div className="lg:col-span-4 w-full flex flex-col gap-4">
          {/* Game Status Banner */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
              {state.isCheck && !state.winner && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-500 border border-rose-500/30">
                  Check!
                </span>
              )}
            </div>

            {state.winner ? (
              <div className="text-center py-2">
                <Crown className="w-8 h-8 text-amber-400 mx-auto mb-1.5" />
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {state.winner === 'draw'
                    ? 'Game Drawn'
                    : state.winner === myPlayer?.socketId
                    ? 'You Won! 🎉'
                    : 'Opponent Won'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{state.winnerReason}</p>

                <button
                  onClick={voteRematch}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Rematch</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isMyTurn ? 'Your turn to move' : "Waiting for opponent's move..."}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Click your piece to reveal valid destinations, then click target square.
                </p>
              </div>
            )}
          </div>

          {/* Move History Panel */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex-1 flex flex-col min-h-[220px]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Move History ({state.history.length})
            </h4>

            <div className="flex-1 overflow-y-auto max-h-[200px] space-y-1 pr-1 font-mono text-xs">
              {state.history.length === 0 ? (
                <div className="text-slate-400 text-xs italic py-4 text-center">
                  No moves played yet
                </div>
              ) : (
                Array.from({ length: Math.ceil(state.history.length / 2) }).map((_, moveIdx) => {
                  const whiteMove = state.history[moveIdx * 2];
                  const blackMove = state.history[moveIdx * 2 + 1];

                  return (
                    <div
                      key={moveIdx}
                      className="flex items-center justify-between px-2.5 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <span className="w-8 text-slate-400 font-semibold">{moveIdx + 1}.</span>
                      <span className="flex-1 font-bold text-slate-800 dark:text-slate-200">
                        {whiteMove}
                      </span>
                      <span className="flex-1 font-bold text-slate-500 dark:text-slate-400">
                        {blackMove || ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions: Resign & Draw */}
          {isPlayer && !state.winner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResignConfirm(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Resign</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
