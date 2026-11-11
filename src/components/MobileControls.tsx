/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpToLine,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Repeat,
} from 'lucide-react';
import { GameStatus } from '../types/tetris';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  onTogglePause: () => void;
  gameStatus: GameStatus;
  canHold: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  onTogglePause,
  gameStatus,
  canHold,
}) => {
  const repeatIntervalRef = useRef<number | null>(null);
  const repeatTimeoutRef = useRef<number | null>(null);

  const startRepeating = (action: () => void) => {
    action();
    stopRepeating();
    repeatTimeoutRef.current = window.setTimeout(() => {
      repeatIntervalRef.current = window.setInterval(action, 80);
    }, 200);
  };

  const stopRepeating = () => {
    if (repeatTimeoutRef.current !== null) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
    if (repeatIntervalRef.current !== null) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-2 p-2 select-none touch-none">
      {/* Top quick row: Pause & Hold & Hard Drop */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          onClick={onTogglePause}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 active:bg-slate-700 transition-colors"
        >
          {gameStatus === 'PAUSED' ? (
            <Play className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Pause className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{gameStatus === 'PAUSED' ? '재개' : '일시정지'}</span>
        </button>

        <button
          onClick={onHold}
          disabled={!canHold || gameStatus !== 'PLAYING'}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-arcade font-bold tracking-wider transition-all ${
            canHold && gameStatus === 'PLAYING'
              ? 'bg-amber-600/30 border-amber-500/60 text-amber-300 active:scale-95'
              : 'bg-slate-800/50 border-slate-700/40 text-slate-500 cursor-not-allowed opacity-50'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>홀드 (C)</span>
        </button>

        <button
          onClick={onHardDrop}
          disabled={gameStatus !== 'PLAYING'}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/50 text-white font-arcade font-bold text-xs tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
        >
          <ArrowUpToLine className="w-4 h-4 rotate-180" />
          <span>하드드롭</span>
        </button>
      </div>

      {/* Main Touch Controls: Direction D-pad on Left, Rotations & Drop on Right */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        {/* Left Side: D-Pad */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex flex-col items-center justify-center gap-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            방향 이동
          </div>
          <div className="flex items-center gap-3">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                startRepeating(onMoveLeft);
              }}
              onPointerUp={stopRepeating}
              onPointerLeave={stopRepeating}
              onContextMenu={(e) => e.preventDefault()}
              className="w-14 h-14 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-700 flex items-center justify-center text-slate-100 shadow-md active:scale-95 transition-transform"
              aria-label="왼쪽으로 이동"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                startRepeating(onSoftDrop);
              }}
              onPointerUp={stopRepeating}
              onPointerLeave={stopRepeating}
              onContextMenu={(e) => e.preventDefault()}
              className="w-14 h-14 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-700 flex items-center justify-center text-slate-100 shadow-md active:scale-95 transition-transform"
              aria-label="소프트 드롭"
            >
              <ArrowDown className="w-6 h-6" />
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                startRepeating(onMoveRight);
              }}
              onPointerUp={stopRepeating}
              onPointerLeave={stopRepeating}
              onContextMenu={(e) => e.preventDefault()}
              className="w-14 h-14 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-700 flex items-center justify-center text-slate-100 shadow-md active:scale-95 transition-transform"
              aria-label="오른쪽으로 이동"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Side: Rotations */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 flex flex-col items-center justify-center gap-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            SRS 회전
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRotateCCW}
              className="w-14 h-14 rounded-xl bg-purple-900/40 active:bg-purple-600 border border-purple-500/50 flex flex-col items-center justify-center text-purple-200 shadow-md active:scale-95 transition-transform"
              aria-label="반시계방향 회전"
            >
              <RotateCcw className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-arcade font-bold">좌회전</span>
            </button>

            <button
              onClick={onRotateCW}
              className="w-14 h-14 rounded-xl bg-cyan-900/40 active:bg-cyan-600 border border-cyan-500/50 flex flex-col items-center justify-center text-cyan-200 shadow-md active:scale-95 transition-transform"
              aria-label="시계방향 회전"
            >
              <RotateCw className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-arcade font-bold">우회전</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
