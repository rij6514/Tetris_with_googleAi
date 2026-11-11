/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { GameStats } from '../types/tetris';

interface StatsPanelProps {
  stats: GameStats;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const linesToNextLevel = 10 - (stats.lines % 10);
  const progressPercent = ((stats.lines % 10) / 10) * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* High Score & Current Score Card */}
      <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <Trophy className="w-3.5 h-3.5" /> 최고 기록
          </span>
          <span className="font-arcade text-amber-300 font-bold">
            {stats.highScore.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-0.5">
          현재 점수
        </div>
        <div className="text-2xl md:text-3xl font-arcade font-extrabold text-white tracking-tight">
          {stats.score.toLocaleString()}
        </div>
      </div>

      {/* Level & Speed Bar */}
      <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
              LEVEL
            </span>
          </div>
          <span className="text-xl font-arcade font-bold text-cyan-400">
            {stats.level}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
          <span>다음 레벨까지</span>
          <span className="text-cyan-300 font-bold">{linesToNextLevel} 줄</span>
        </div>
      </div>

      {/* Lines & Time Card */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-2.5 text-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            클리어 라인
          </div>
          <div className="text-lg md:text-xl font-arcade font-bold text-emerald-400">
            {stats.lines}
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-2.5 text-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            플레이 시간
          </div>
          <div className="text-lg md:text-xl font-arcade font-bold text-slate-200">
            {formatTime(stats.elapsedSeconds)}
          </div>
        </div>
      </div>

      {/* Combo & B2B Status */}
      <div className="flex items-center gap-2">
        {stats.combo > 1 && (
          <div className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-arcade font-bold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>{stats.combo} COMBO</span>
          </div>
        )}
        {stats.backToBack && (
          <div className="flex-1 flex items-center justify-center py-1.5 px-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-arcade font-bold">
            ⚡ B2B 활성
          </div>
        )}
      </div>
    </div>
  );
};
