/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BOARD_WIDTH,
  BUFFER_ROWS,
  TETROMINO_COLORS,
  TETROMINO_SHAPES,
  TOTAL_ROWS,
} from '../constants/tetris';
import { ActionBanner, ActivePiece, BoardMatrix, GameStatus } from '../types/tetris';

interface BoardProps {
  matrix: BoardMatrix;
  activePiece: ActivePiece | null;
  ghostY: number | null;
  gameStatus: GameStatus;
  banners: ActionBanner[];
  screenShake: boolean;
  onStart: () => void;
  onResume: () => void;
}

export const Board: React.FC<BoardProps> = ({
  matrix,
  activePiece,
  ghostY,
  gameStatus,
  banners,
  screenShake,
  onStart,
  onResume,
}) => {
  // Pre-calculate active piece and ghost piece occupied cells for ultra-fast lookup
  const activeCells = new Map<string, string>(); // "r,c" => colorKey
  const ghostCells = new Set<string>(); // "r,c"

  if (activePiece) {
    const shape = TETROMINO_SHAPES[activePiece.type][activePiece.rotation];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardR = activePiece.y + r;
          const boardC = activePiece.x + c;
          activeCells.set(`${boardR},${boardC}`, activePiece.type);
        }
      }
    }

    if (ghostY !== null && ghostY !== activePiece.y) {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const boardR = ghostY + r;
            const boardC = activePiece.x + c;
            ghostCells.add(`${boardR},${boardC}`);
          }
        }
      }
    }
  }

  return (
    <div
      className={`relative rounded-xl p-2 md:p-3 bg-gradient-to-b from-[#131926] to-[#0c1017] border-2 border-slate-700/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] select-none transition-transform duration-75 ${
        screenShake ? 'scale-[1.01] translate-y-1' : ''
      }`}
    >
      {/* Action Floating Banners */}
      <div className="absolute inset-x-0 top-1/4 z-30 pointer-events-none flex flex-col items-center gap-2">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`animate-bounce px-4 py-1.5 rounded-full font-arcade font-bold tracking-wider text-sm md:text-base border shadow-xl backdrop-blur-md transition-all ${
              banner.type === 'tetris'
                ? 'bg-cyan-500/90 text-white border-cyan-200 shadow-cyan-500/50 scale-110'
                : banner.type === 'tspin'
                ? 'bg-purple-600/90 text-white border-purple-300 shadow-purple-500/50 scale-105'
                : banner.type === 'triple'
                ? 'bg-emerald-600/90 text-white border-emerald-300'
                : 'bg-amber-500/90 text-white border-amber-300'
            }`}
          >
            <div className="text-center">{banner.text}</div>
            {banner.subText && (
              <div className="text-xs text-center font-sans font-medium text-amber-200">
                {banner.subText}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid Viewport (Rows 2 to 21, total 20 visible rows) */}
      <div className="grid grid-cols-10 gap-[1px] md:gap-[2px] bg-slate-900/90 border border-slate-700/50 rounded-lg p-1 overflow-hidden relative">
        {/* Subtle grid line backdrop */}
        <div className="absolute inset-0 arcade-grid pointer-events-none opacity-40" />

        {Array.from({ length: TOTAL_ROWS - BUFFER_ROWS }).map((_, rowOffset) => {
          const r = rowOffset + BUFFER_ROWS;

          return Array.from({ length: BOARD_WIDTH }).map((_, c) => {
            const key = `${r},${c}`;
            const cell = matrix[r][c];
            const isActive = activeCells.has(key);
            const isGhost = !isActive && ghostCells.has(key);

            let cellColor = null;
            if (cell.type) {
              cellColor = TETROMINO_COLORS[cell.type];
            } else if (isActive && activePiece) {
              cellColor = TETROMINO_COLORS[activePiece.type];
            }

            return (
              <div
                key={key}
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-[3px] flex items-center justify-center relative overflow-hidden transition-all duration-75"
              >
                {cell.isClearing ? (
                  // Line clear flash animation
                  <div className="absolute inset-0 bg-white animate-pulse shadow-[0_0_15px_#fff]" />
                ) : cellColor ? (
                  // Locked or Active Piece
                  <div
                    className="w-full h-full rounded-[3px] border border-white/40 relative shadow-sm"
                    style={{
                      backgroundColor: cellColor.primary,
                      boxShadow: isActive
                        ? `0 0 10px ${cellColor.glow}`
                        : `inset 0 0 6px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {/* Bevel reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/35 pointer-events-none" />
                  </div>
                ) : isGhost && activePiece ? (
                  // Ghost Piece
                  <div
                    className="w-full h-full rounded-[3px] border-2 border-dashed opacity-50 transition-opacity"
                    style={{
                      borderColor: TETROMINO_COLORS[activePiece.type].primary,
                      backgroundColor: `${TETROMINO_COLORS[activePiece.type].primary}15`,
                    }}
                  />
                ) : (
                  // Empty Grid Cell
                  <div className="w-full h-full bg-slate-950/40 border border-slate-800/40 rounded-[2px]" />
                )}
              </div>
            );
          });
        })}
      </div>

      {/* Start / Resume Game Overlays */}
      {gameStatus === 'IDLE' && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="text-3xl font-arcade font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 mb-2">
            NEO TETRIS
          </div>
          <p className="text-xs md:text-sm text-slate-300 mb-5 max-w-[200px]">
            SRS 공식 회전 & 홀드 시스템 내장 아케이드 테트리스
          </p>
          <button
            onClick={onStart}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-arcade font-bold tracking-wider text-base shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer active:scale-95 transition-all"
          >
            게임 시작
          </button>
        </div>
      )}

      {gameStatus === 'PAUSED' && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="text-2xl font-arcade font-bold text-amber-400 mb-4 tracking-wider">
            PAUSED
          </div>
          <button
            onClick={onResume}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-bold text-sm tracking-wide shadow-lg cursor-pointer active:scale-95 transition-all"
          >
            계속하기 (P)
          </button>
        </div>
      )}
    </div>
  );
};
