/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Music,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
} from 'lucide-react';
import { Board } from './components/Board';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { GameOverModal } from './components/GameOverModal';
import { MobileControls } from './components/MobileControls';
import { PiecePreview } from './components/PiecePreview';
import { StatsPanel } from './components/StatsPanel';
import { LEVEL_SPEEDS_MS } from './constants/tetris';
import { useTetris } from './hooks/useTetris';
import { soundManager } from './utils/sound';

export default function App() {
  const [startLevel, setStartLevel] = useState<number>(1);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [bgmOn, setBgmOn] = useState<boolean>(false);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);

  const {
    matrix,
    activePiece,
    ghostY,
    holdPiece,
    canHold,
    nextPieces,
    gameStatus,
    stats,
    banners,
    screenShake,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotateCW,
    rotateCCW,
    hold,
  } = useTetris(startLevel);

  // Sync audio settings
  useEffect(() => {
    soundManager.setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    soundManager.setBgmEnabled(bgmOn);
  }, [bgmOn]);

  // Keyboard Event Handlers with preventDefault for game keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Start/Restart key
      if (e.key === 'r' || e.key === 'R') {
        startGame(startLevel);
        return;
      }

      // Pause toggle
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (gameStatus !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          softDrop();
          break;
        case ' ': // Space for Hard Drop
          e.preventDefault();
          hardDrop();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'x':
        case 'X':
          e.preventDefault();
          rotateCW();
          break;
        case 'z':
        case 'Z':
        case 'q':
        case 'Q':
          e.preventDefault();
          rotateCCW();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          hold();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameStatus,
    startLevel,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotateCW,
    rotateCCW,
    hold,
  ]);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none">
      {/* Top Header Navbar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 px-3 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl mb-3 shadow-lg">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-arcade font-extrabold text-white text-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            T
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-arcade font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 leading-tight">
              NEO TETRIS <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">SRS</span>
            </h1>
            <p className="hidden sm:block text-[10px] text-slate-400 font-mono">
              슈퍼 로테이션 시스템 & 홀드 & 하드드롭 완벽 지원
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Start Level Selector (Disabled during game) */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              시작 레벨:
            </span>
            <select
              value={startLevel}
              disabled={gameStatus === 'PLAYING'}
              onChange={(e) => setStartLevel(Number(e.target.value))}
              aria-label="시작 레벨 선택"
              className="bg-transparent text-cyan-400 font-arcade font-bold focus:outline-none cursor-pointer text-xs"
            >
              {Array.from({ length: 15 }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1} className="bg-slate-900 text-white">
                  Lv.{idx + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`p-2 rounded-lg border transition-all ${
              soundOn
                ? 'bg-slate-800/80 border-cyan-500/50 text-cyan-400 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title={soundOn ? '효과음 켜짐' : '효과음 꺼짐'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* BGM Toggle */}
          <button
            onClick={() => setBgmOn(!bgmOn)}
            className={`p-2 rounded-lg border transition-all ${
              bgmOn
                ? 'bg-purple-900/40 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title={bgmOn ? 'BGM 켜짐' : 'BGM 꺼짐'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Guide Modal Button */}
          <button
            onClick={() => setGuideOpen(true)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="조작법 및 SRS 가이드"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Restart Button */}
          <button
            onClick={() => startGame(startLevel)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">재시작 (R)</span>
          </button>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center">
        {/* Desktop 3-Column Arena */}
        <div className="w-full flex flex-row items-start justify-center gap-4 lg:gap-6">
          {/* Left Column: HOLD Box & Key Cheat Sheet */}
          <aside className="hidden md:flex flex-col gap-3 w-44 lg:w-48">
            {/* HOLD Box */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 shadow-lg flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">
                <span>HOLD</span>
                <span className="text-[10px] text-amber-400 font-bold">[C / Shift]</span>
              </div>
              <PiecePreview type={holdPiece} size="md" disabled={!canHold} />
              {!canHold && (
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  잠금 후 재사용 가능
                </div>
              )}
            </div>

            {/* Current Speed / Gravity Indicator */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 shadow-lg text-xs font-mono">
              <div className="text-slate-400 uppercase text-[11px] mb-1">
                중력 속도
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-arcade font-bold text-sm">
                  {LEVEL_SPEEDS_MS[Math.min(stats.level, 15)] || 30} ms / 칸
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                10줄 클리어마다 난이도 가속
              </div>
            </div>

            {/* Quick Key Cheat Sheet */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 text-[11px] font-mono text-slate-400 space-y-1.5">
              <div className="text-slate-300 font-bold font-arcade mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" /> 단축키 안내
              </div>
              <div className="flex justify-between">
                <span>하드 드롭:</span>
                <span className="text-cyan-300 font-bold">Space</span>
              </div>
              <div className="flex justify-between">
                <span>소프트 드롭:</span>
                <span className="text-amber-300">↓ / S</span>
              </div>
              <div className="flex justify-between">
                <span>우회전 (CW):</span>
                <span className="text-purple-300">↑ / X</span>
              </div>
              <div className="flex justify-between">
                <span>좌회전 (CCW):</span>
                <span className="text-pink-300">Z / Q</span>
              </div>
              <div className="flex justify-between">
                <span>홀드:</span>
                <span className="text-yellow-300">C / Shift</span>
              </div>
            </div>
          </aside>

          {/* Center Column: The Tetris Board */}
          <section className="flex flex-col items-center">
            {/* Mobile-Only Top Summary (Hold & Next) */}
            <div className="md:hidden w-full flex items-center justify-between gap-2 mb-2">
              <div className="flex-1 bg-slate-900/80 border border-slate-700/70 rounded-xl p-2 flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  HOLD (C)
                </span>
                <PiecePreview type={holdPiece} size="sm" disabled={!canHold} />
              </div>

              <div className="flex flex-col items-center px-2">
                <span className="text-[10px] font-mono text-cyan-400">
                  Lv.{stats.level}
                </span>
                <span className="text-sm font-arcade font-bold text-white">
                  {stats.score.toLocaleString()}
                </span>
              </div>

              <div className="flex-1 bg-slate-900/80 border border-slate-700/70 rounded-xl p-2 flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  NEXT
                </span>
                <PiecePreview type={nextPieces[0] || null} size="sm" />
              </div>
            </div>

            {/* Main Board Component */}
            <Board
              matrix={matrix}
              activePiece={activePiece}
              ghostY={ghostY}
              gameStatus={gameStatus}
              banners={banners}
              screenShake={screenShake}
              onStart={() => startGame(startLevel)}
              onResume={togglePause}
            />

            {/* Mobile On-Screen Controls */}
            <div className="w-full md:hidden mt-2">
              <MobileControls
                onMoveLeft={moveLeft}
                onMoveRight={moveRight}
                onSoftDrop={softDrop}
                onHardDrop={hardDrop}
                onRotateCW={rotateCW}
                onRotateCCW={rotateCCW}
                onHold={hold}
                onTogglePause={togglePause}
                gameStatus={gameStatus}
                canHold={canHold}
              />
            </div>
          </section>

          {/* Right Column: NEXT Queue & Full StatsPanel */}
          <aside className="hidden md:flex flex-col gap-3 w-48 lg:w-56">
            {/* NEXT Queue (Previews up to 5 upcoming pieces) */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 shadow-lg flex flex-col items-center">
              <div className="w-full text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1 flex justify-between">
                <span>NEXT</span>
                <span className="text-cyan-400 text-[10px]">대기 큐</span>
              </div>
              <div className="flex flex-col gap-1 items-center w-full">
                {nextPieces.slice(0, 5).map((type, idx) => (
                  <div
                    key={idx}
                    className={`w-full flex items-center justify-center ${
                      idx === 0
                        ? 'p-1 rounded-lg bg-slate-950/40 border border-slate-800/80'
                        : 'opacity-70 scale-90'
                    }`}
                  >
                    <PiecePreview
                      type={type}
                      size={idx === 0 ? 'md' : 'sm'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Panel */}
            <StatsPanel stats={stats} />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-2 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/60 mt-3">
        <span>NeoTetris Pro &copy; 2026 &bull; Super Rotation System (SRS)</span>
        <span className="hidden sm:inline">
          Space: 하드드롭 | C: 홀드 | X/Z: 회전 | ↓: 소프트드롭
        </span>
      </footer>

      {/* Modals */}
      <GameOverModal
        isOpen={gameStatus === 'GAMEOVER'}
        stats={stats}
        onRestart={() => startGame(startLevel)}
      />
      <ControlsGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
