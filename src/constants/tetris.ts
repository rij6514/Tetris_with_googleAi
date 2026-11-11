/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rotation, TetrominoType } from '../types/tetris';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BUFFER_ROWS = 2; // Rows 0 and 1 are hidden spawn buffer
export const TOTAL_ROWS = BOARD_HEIGHT + BUFFER_ROWS; // 22

export const TETROMINO_SHAPES: Record<TetrominoType, Record<Rotation, number[][]>> = {
  I: {
    0: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    1: [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    2: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    3: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  },
  J: {
    0: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    1: [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    2: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    3: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  },
  L: {
    0: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    1: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    2: [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    3: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  },
  O: {
    0: [
      [1, 1],
      [1, 1],
    ],
    1: [
      [1, 1],
      [1, 1],
    ],
    2: [
      [1, 1],
      [1, 1],
    ],
    3: [
      [1, 1],
      [1, 1],
    ],
  },
  S: {
    0: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    1: [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    2: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    3: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
  T: {
    0: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    1: [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    2: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    3: [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
  Z: {
    0: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    1: [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    2: [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    3: [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  },
};

/**
 * Super Rotation System (SRS) Wall Kick Data
 * Standard guidelines: [dx, dy] where +dx is right, +dy is down.
 */
type KickTable = Record<string, [number, number][]>;

export const JLSTZ_WALL_KICK_DATA: KickTable = {
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

export const I_WALL_KICK_DATA: KickTable = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

export const TETROMINO_COLORS: Record<TetrominoType, {
  primary: string;
  glow: string;
  border: string;
  gradient: string;
  dark: string;
}> = {
  I: {
    primary: '#06b6d4', // cyan-500
    glow: 'rgba(6, 182, 212, 0.6)',
    border: '#67e8f9',
    gradient: 'from-cyan-400 to-cyan-600',
    dark: '#083344',
  },
  J: {
    primary: '#3b82f6', // blue-500
    glow: 'rgba(59, 130, 246, 0.6)',
    border: '#93c5fd',
    gradient: 'from-blue-400 to-blue-600',
    dark: '#172554',
  },
  L: {
    primary: '#f97316', // orange-500
    glow: 'rgba(249, 115, 22, 0.6)',
    border: '#fdba74',
    gradient: 'from-orange-400 to-orange-600',
    dark: '#431407',
  },
  O: {
    primary: '#eab308', // yellow-500
    glow: 'rgba(234, 179, 8, 0.6)',
    border: '#fde047',
    gradient: 'from-yellow-400 to-yellow-600',
    dark: '#422006',
  },
  S: {
    primary: '#22c55e', // green-500
    glow: 'rgba(34, 197, 94, 0.6)',
    border: '#86efac',
    gradient: 'from-green-400 to-green-600',
    dark: '#052e16',
  },
  T: {
    primary: '#a855f7', // purple-500
    glow: 'rgba(168, 85, 247, 0.6)',
    border: '#d8b4fe',
    gradient: 'from-purple-400 to-purple-600',
    dark: '#3b0764',
  },
  Z: {
    primary: '#ef4444', // red-500
    glow: 'rgba(239, 68, 68, 0.6)',
    border: '#fca5a5',
    gradient: 'from-red-400 to-red-600',
    dark: '#450a0a',
  },
};

export const LEVEL_SPEEDS_MS: Record<number, number> = {
  1: 800,
  2: 710,
  3: 620,
  4: 530,
  5: 450,
  6: 370,
  7: 290,
  8: 220,
  9: 160,
  10: 110,
  11: 85,
  12: 65,
  13: 50,
  14: 38,
  15: 28,
};

export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_MOVES = 15; // Max moves or rotations during lock delay before forced lock

export const SCORE_TABLE = {
  single: 100,
  double: 300,
  triple: 500,
  tetris: 800,
  tspinMini: 100,
  tspinSingle: 800,
  tspinDouble: 1200,
  tspinTriple: 1600,
  softDrop: 1, // Per cell
  hardDrop: 2, // Per cell
  backToBackMultiplier: 1.5,
  comboBonus: 50, // per combo count * level
};
