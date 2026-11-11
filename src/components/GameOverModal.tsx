/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Flame, RotateCcw, Trophy, Zap } from 'lucide-react';
import { GameStats } from '../types/tetris';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  onRestart,
}) => {
  if (!isOpen) return null;

  const isNewRecord = stats.score > 0 && stats.score >= stats.highScore;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}분 ${s}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#181a29] to-[#0f111a] border-2 border-red-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-3xl font-arcade font-extrabold text-red-500 mb-1 tracking-wider drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">
          GAME OVER
        </div>
        <p className="text-xs text-slate-400 mb-4 font-sans">
          보드가 상단 한계선에 도달했습니다.
        </p>

        {isNewRecord && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300 text-xs font-arcade font-bold animate-pulse">
            <Trophy className="w-3.5 h-3.5" />
            <span>최고 기록 갱신 달성!</span>
          </div>
        )}

        {/* Score Box */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 mb-4">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
            최종 점수
          </div>
          <div className="text-3xl font-arcade font-extrabold text-white">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-left mb-6 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-slate-400 font-mono text-[11px] mb-0.5">
              도달 레벨
            </div>
            <div className="font-arcade font-bold text-cyan-400 text-base flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Lv.{stats.level}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-slate-400 font-mono text-[11px] mb-0.5">
              클리어 라인
            </div>
            <div className="font-arcade font-bold text-emerald-400 text-base">
              {stats.lines} 줄
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-slate-400 font-mono text-[11px] mb-0.5">
              테트리스 (4줄 클리어)
            </div>
            <div className="font-arcade font-bold text-amber-400 text-base flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> {stats.tetrises} 회
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-slate-400 font-mono text-[11px] mb-0.5">
              최대 콤보
            </div>
            <div className="font-arcade font-bold text-orange-400 text-base flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {stats.maxCombo} Combo
            </div>
          </div>

          <div className="col-span-2 bg-slate-950/60 border border-slate-800 rounded-lg p-2 flex justify-between items-center text-[11px] text-slate-400">
            <span>생존 시간: {formatTime(stats.elapsedSeconds)}</span>
            <span>T-Spin 성공: {stats.tspins}회</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-arcade font-bold text-base tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>다시 도전하기 (R)</span>
        </button>
      </div>
    </div>
  );
};
