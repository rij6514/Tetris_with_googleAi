/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type Rotation = 0 | 1 | 2 | 3;

export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  type: TetrominoType | null;
  isClearing?: boolean;
  flash?: boolean;
}

export type BoardMatrix = Cell[][];

export interface ActivePiece {
  type: TetrominoType;
  rotation: Rotation;
  x: number;
  y: number;
  lastActionWasRotate?: boolean;
  lastKickIndex?: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface ActionBanner {
  id: string;
  text: string;
  subText?: string;
  type: 'single' | 'double' | 'triple' | 'tetris' | 'tspin' | 'combo' | 'b2b';
}

export interface GameStats {
  score: number;
  highScore: number;
  level: number;
  lines: number;
  combo: number;
  maxCombo: number;
  backToBack: boolean;
  singles: number;
  doubles: number;
  triples: number;
  tetrises: number;
  tspins: number;
  startTime: number;
  elapsedSeconds: number;
  piecesDropped: number;
}

export interface KeyBindings {
  moveLeft: string[];
  moveRight: string[];
  softDrop: string[];
  hardDrop: string[];
  rotateCW: string[];
  rotateCCW: string[];
  hold: string[];
  pause: string[];
  restart: string[];
}
