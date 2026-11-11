/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  BUFFER_ROWS,
  I_WALL_KICK_DATA,
  JLSTZ_WALL_KICK_DATA,
  LEVEL_SPEEDS_MS,
  LOCK_DELAY_MS,
  MAX_LOCK_MOVES,
  SCORE_TABLE,
  TETROMINO_SHAPES,
  TOTAL_ROWS,
} from '../constants/tetris';
import {
  ActionBanner,
  ActivePiece,
  BoardMatrix,
  GameStats,
  GameStatus,
  Rotation,
  TetrominoType,
} from '../types/tetris';
import { soundManager } from '../utils/sound';

const ALL_PIECES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// 7-Bag Randomizer
function generateBag(): TetrominoType[] {
  const bag = [...ALL_PIECES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function createEmptyMatrix(): BoardMatrix {
  return Array.from({ length: TOTAL_ROWS }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ type: null }))
  );
}

function getSpawnPosition(type: TetrominoType): { x: number; y: number } {
  if (type === 'I') return { x: 3, y: 0 };
  if (type === 'O') return { x: 4, y: 1 };
  return { x: 3, y: 1 };
}

export function useTetris(initialLevel: number = 1) {
  const [matrix, setMatrix] = useState<BoardMatrix>(createEmptyMatrix);
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [queue, setQueue] = useState<TetrominoType[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [banners, setBanners] = useState<ActionBanner[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    level: initialLevel,
    lines: 0,
    combo: 0,
    maxCombo: 0,
    backToBack: false,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetrises: 0,
    tspins: 0,
    startTime: 0,
    elapsedSeconds: 0,
    piecesDropped: 0,
  });

  // Refs for current game loop values to avoid stale closures in tick intervals
  const matrixRef = useRef(matrix);
  matrixRef.current = matrix;

  const activePieceRef = useRef(activePiece);
  activePieceRef.current = activePiece;

  const gameStatusRef = useRef(gameStatus);
  gameStatusRef.current = gameStatus;

  const statsRef = useRef(stats);
  statsRef.current = stats;

  const queueRef = useRef(queue);
  queueRef.current = queue;

  const canHoldRef = useRef(canHold);
  canHoldRef.current = canHold;

  const lockTimeoutRef = useRef<number | null>(null);
  const lockMovesRef = useRef<number>(0);
  const isClearingRef = useRef<boolean>(false);

  // Load high score on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('neotetris_high_score');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) {
          setStats((prev) => ({ ...prev, highScore: val }));
        }
      }
    } catch {
      // Local storage unavailable
    }
  }, []);

  // Timer for elapsed seconds
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;
    const timer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStatus]);

  // Helper banner notifications
  const showBanner = useCallback(
    (text: string, subText: string | undefined, type: ActionBanner['type']) => {
      const newBanner: ActionBanner = {
        id: Math.random().toString(),
        text,
        subText,
        type,
      };
      setBanners((prev) => [...prev.slice(-2), newBanner]);
      setTimeout(() => {
        setBanners((prev) => prev.filter((b) => b.id !== newBanner.id));
      }, 1500);
    },
    []
  );

  // Trigger screen shake
  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 200);
  }, []);

  // Collision detection
  const checkCollision = useCallback(
    (
      type: TetrominoType,
      currentMatrix: BoardMatrix,
      offsetX: number,
      offsetY: number,
      rotation: Rotation
    ): boolean => {
      const shape = TETROMINO_SHAPES[type][rotation];
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const newX = offsetX + c;
            const newY = offsetY + r;

            // Boundaries
            if (newX < 0 || newX >= BOARD_WIDTH) return true;
            if (newY >= TOTAL_ROWS) return true;

            // Check matrix cell collision
            if (newY >= 0 && currentMatrix[newY][newX].type !== null) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  // Check if piece is resting on a surface
  const isGrounded = useCallback(
    (piece: ActivePiece, currentMatrix: BoardMatrix): boolean => {
      return checkCollision(
        piece.type,
        currentMatrix,
        piece.x,
        piece.y + 1,
        piece.rotation
      );
    },
    [checkCollision]
  );

  // Calculate Ghost position (where piece would land)
  const getGhostY = useCallback(
    (piece: ActivePiece, currentMatrix: BoardMatrix): number => {
      let ghostY = piece.y;
      while (
        !checkCollision(
          piece.type,
          currentMatrix,
          piece.x,
          ghostY + 1,
          piece.rotation
        )
      ) {
        ghostY++;
      }
      return ghostY;
    },
    [checkCollision]
  );

  // Ensure queue has enough pieces
  const ensureQueue = useCallback(() => {
    let nextQueue = [...queueRef.current];
    while (nextQueue.length < 8) {
      nextQueue = nextQueue.concat(generateBag());
    }
    setQueue(nextQueue);
    return nextQueue;
  }, []);

  // Clear lock delay timer
  const cancelLockDelay = useCallback(() => {
    if (lockTimeoutRef.current !== null) {
      clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }
  }, []);

  // Lock the active piece into board and evaluate line clears & T-Spins
  const lockPiece = useCallback(() => {
    const piece = activePieceRef.current;
    if (!piece || isClearingRef.current) return;

    cancelLockDelay();

    const shape = TETROMINO_SHAPES[piece.type][piece.rotation];
    const newMatrix = matrixRef.current.map((row) =>
      row.map((cell) => ({ ...cell }))
    );

    // Embed into board
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const targetY = piece.y + r;
          const targetX = piece.x + c;
          if (
            targetY >= 0 &&
            targetY < TOTAL_ROWS &&
            targetX >= 0 &&
            targetX < BOARD_WIDTH
          ) {
            newMatrix[targetY][targetX] = { type: piece.type };
          }
        }
      }
    }

    // T-Spin Check
    let isTSpin = false;
    let isTSpinMini = false;
    if (piece.type === 'T' && piece.lastActionWasRotate) {
      const centerX = piece.x + 1;
      const centerY = piece.y + 1;
      const corners = [
        { x: centerX - 1, y: centerY - 1 },
        { x: centerX + 1, y: centerY - 1 },
        { x: centerX - 1, y: centerY + 1 },
        { x: centerX + 1, y: centerY + 1 },
      ];

      let occupiedCorners = 0;
      corners.forEach((pt) => {
        if (
          pt.x < 0 ||
          pt.x >= BOARD_WIDTH ||
          pt.y >= TOTAL_ROWS ||
          (pt.y >= 0 && matrixRef.current[pt.y][pt.x].type !== null)
        ) {
          occupiedCorners++;
        }
      });

      if (occupiedCorners >= 3) {
        if (piece.lastKickIndex === 4) {
          isTSpin = true;
        } else {
          // Front corners test based on rotation
          isTSpin = true;
        }
      }
    }

    // Check full rows
    const fullRowIndices: number[] = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
      const isFull = newMatrix[r].every((cell) => cell.type !== null);
      if (isFull) {
        fullRowIndices.push(r);
      }
    }

    const linesCount = fullRowIndices.length;
    let addedScore = 0;
    const currentLevel = statsRef.current.level;
    let nextBackToBack = statsRef.current.backToBack;
    let nextCombo = statsRef.current.combo;

    if (linesCount > 0) {
      nextCombo += 1;
      const isDifficult = linesCount === 4 || isTSpin;

      // Base score calculation
      let baseScore = 0;
      let clearType: ActionBanner['type'] = 'single';
      let title = '';

      if (isTSpin) {
        if (linesCount === 1) {
          baseScore = SCORE_TABLE.tspinSingle * currentLevel;
          title = 'T-SPIN SINGLE!';
          clearType = 'tspin';
        } else if (linesCount === 2) {
          baseScore = SCORE_TABLE.tspinDouble * currentLevel;
          title = 'T-SPIN DOUBLE!!';
          clearType = 'tspin';
        } else if (linesCount === 3) {
          baseScore = SCORE_TABLE.tspinTriple * currentLevel;
          title = 'T-SPIN TRIPLE!!!';
          clearType = 'tspin';
        }
        soundManager.playTSpin();
      } else {
        if (linesCount === 1) {
          baseScore = SCORE_TABLE.single * currentLevel;
          title = 'SINGLE';
          clearType = 'single';
        } else if (linesCount === 2) {
          baseScore = SCORE_TABLE.double * currentLevel;
          title = 'DOUBLE!';
          clearType = 'double';
        } else if (linesCount === 3) {
          baseScore = SCORE_TABLE.triple * currentLevel;
          title = 'TRIPLE!!';
          clearType = 'triple';
        } else if (linesCount === 4) {
          baseScore = SCORE_TABLE.tetris * currentLevel;
          title = 'TETRIS!!!!';
          clearType = 'tetris';
          triggerShake();
          soundManager.playTetris();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      }

      if (isDifficult && statsRef.current.backToBack) {
        baseScore = Math.floor(baseScore * SCORE_TABLE.backToBackMultiplier);
        title = `B2B ${title}`;
      }

      // Combo bonus
      if (nextCombo > 1) {
        baseScore += SCORE_TABLE.comboBonus * (nextCombo - 1) * currentLevel;
      }

      addedScore = baseScore;
      nextBackToBack = isDifficult;

      // Show banner
      showBanner(
        title,
        nextCombo > 1 ? `${nextCombo - 1} 콤보! (+${addedScore}점)` : `+${addedScore}점`,
        clearType
      );

      if (linesCount < 4 && !isTSpin) {
        soundManager.playLineClear(linesCount);
      }

      // Trigger line clearing animation in matrix
      fullRowIndices.forEach((r) => {
        for (let c = 0; c < BOARD_WIDTH; c++) {
          newMatrix[r][c] = { ...newMatrix[r][c], isClearing: true };
        }
      });

      setMatrix(newMatrix);
      isClearingRef.current = true;

      // Remove lines after visual animation delay
      setTimeout(() => {
        const remainingRows = newMatrix.filter(
          (_, idx) => !fullRowIndices.includes(idx)
        );
        const newEmptyRows = Array.from({ length: linesCount }, () =>
          Array.from({ length: BOARD_WIDTH }, () => ({ type: null }))
        );
        const finalMatrix = [...newEmptyRows, ...remainingRows];

        setMatrix(finalMatrix);
        matrixRef.current = finalMatrix;
        isClearingRef.current = false;

        // Spawn next piece
        spawnNextPiece(finalMatrix);
      }, 160);
    } else {
      // No lines cleared
      nextCombo = 0;
      if (isTSpin) {
        addedScore = SCORE_TABLE.tspinMini * currentLevel;
        showBanner('T-SPIN!', `+${addedScore}점`, 'tspin');
        soundManager.playTSpin();
      }

      setMatrix(newMatrix);
      matrixRef.current = newMatrix;

      // Spawn next piece
      spawnNextPiece(newMatrix);
    }

    // Update stats
    setStats((prev) => {
      const newLines = prev.lines + linesCount;
      const newLevel = Math.max(prev.level, Math.floor(newLines / 10) + 1);
      const newScore = prev.score + addedScore;
      const newHighScore = Math.max(prev.highScore, newScore);

      if (newLevel > prev.level) {
        soundManager.playLevelUp();
        showBanner(`레벨 업! LEVEL ${newLevel}`, '낙하 속도 상승!', 'combo');
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
        });
      }

      if (newHighScore > prev.highScore) {
        try {
          localStorage.setItem('neotetris_high_score', newHighScore.toString());
        } catch {
          // ignore
        }
      }

      return {
        ...prev,
        score: newScore,
        highScore: newHighScore,
        lines: newLines,
        level: newLevel,
        combo: nextCombo,
        maxCombo: Math.max(prev.maxCombo, nextCombo),
        backToBack: nextBackToBack,
        singles: prev.singles + (linesCount === 1 ? 1 : 0),
        doubles: prev.doubles + (linesCount === 2 ? 1 : 0),
        triples: prev.triples + (linesCount === 3 ? 1 : 0),
        tetrises: prev.tetrises + (linesCount === 4 ? 1 : 0),
        tspins: prev.tspins + (isTSpin ? 1 : 0),
        piecesDropped: prev.piecesDropped + 1,
      };
    });
  }, [cancelLockDelay, triggerShake, showBanner]);

  // Spawn next piece from the queue
  const spawnNextPiece = useCallback(
    (currentMatrix: BoardMatrix) => {
      let q = [...queueRef.current];
      if (q.length < 7) {
        q = q.concat(generateBag());
      }
      const nextType = q.shift()!;
      setQueue(q);
      queueRef.current = q;

      const spawnPos = getSpawnPosition(nextType);
      const newPiece: ActivePiece = {
        type: nextType,
        rotation: 0,
        x: spawnPos.x,
        y: spawnPos.y,
        lastActionWasRotate: false,
      };

      // Check top out (Game Over)
      if (
        checkCollision(
          newPiece.type,
          currentMatrix,
          newPiece.x,
          newPiece.y,
          newPiece.rotation
        )
      ) {
        // Immediate collision on spawn = Game Over
        setGameStatus('GAMEOVER');
        gameStatusRef.current = 'GAMEOVER';
        setActivePiece(null);
        soundManager.playGameOver();
        return;
      }

      setActivePiece(newPiece);
      activePieceRef.current = newPiece;
      setCanHold(true);
      canHoldRef.current = true;
      lockMovesRef.current = 0;
    },
    [checkCollision]
  );

  // Schedule lock delay when piece touches the floor
  const scheduleLockDelay = useCallback(() => {
    cancelLockDelay();
    lockTimeoutRef.current = window.setTimeout(() => {
      const piece = activePieceRef.current;
      if (piece && isGrounded(piece, matrixRef.current)) {
        lockPiece();
      }
    }, LOCK_DELAY_MS);
  }, [cancelLockDelay, isGrounded, lockPiece]);

  // Move Active Piece horizontally
  const moveHorizontal = useCallback(
    (dir: -1 | 1) => {
      if (
        gameStatusRef.current !== 'PLAYING' ||
        !activePieceRef.current ||
        isClearingRef.current
      ) {
        return;
      }
      const piece = activePieceRef.current;
      const targetX = piece.x + dir;

      if (
        !checkCollision(
          piece.type,
          matrixRef.current,
          targetX,
          piece.y,
          piece.rotation
        )
      ) {
        const updated = {
          ...piece,
          x: targetX,
          lastActionWasRotate: false,
        };
        setActivePiece(updated);
        activePieceRef.current = updated;
        soundManager.playMove();

        // If piece is grounded, reset lock delay if under MAX_LOCK_MOVES
        if (isGrounded(updated, matrixRef.current)) {
          if (lockMovesRef.current < MAX_LOCK_MOVES) {
            lockMovesRef.current++;
            scheduleLockDelay();
          }
        } else {
          cancelLockDelay();
        }
      }
    },
    [checkCollision, isGrounded, scheduleLockDelay, cancelLockDelay]
  );

  // Soft Drop
  const softDrop = useCallback(() => {
    if (
      gameStatusRef.current !== 'PLAYING' ||
      !activePieceRef.current ||
      isClearingRef.current
    ) {
      return;
    }
    const piece = activePieceRef.current;
    const targetY = piece.y + 1;

    if (
      !checkCollision(
        piece.type,
        matrixRef.current,
        piece.x,
        targetY,
        piece.rotation
      )
    ) {
      const updated = {
        ...piece,
        y: targetY,
        lastActionWasRotate: false,
      };
      setActivePiece(updated);
      activePieceRef.current = updated;
      soundManager.playSoftDrop();

      // Soft drop score (+1)
      setStats((prev) => ({
        ...prev,
        score: prev.score + SCORE_TABLE.softDrop,
      }));

      if (isGrounded(updated, matrixRef.current)) {
        scheduleLockDelay();
      } else {
        cancelLockDelay();
      }
    } else {
      // Already on ground
      scheduleLockDelay();
    }
  }, [checkCollision, isGrounded, scheduleLockDelay, cancelLockDelay]);

  // Hard Drop
  const hardDrop = useCallback(() => {
    if (
      gameStatusRef.current !== 'PLAYING' ||
      !activePieceRef.current ||
      isClearingRef.current
    ) {
      return;
    }
    const piece = activePieceRef.current;
    const targetY = getGhostY(piece, matrixRef.current);
    const dropDistance = targetY - piece.y;

    const lockedPiece: ActivePiece = {
      ...piece,
      y: targetY,
    };
    setActivePiece(lockedPiece);
    activePieceRef.current = lockedPiece;

    // Hard drop score (+2 per row dropped)
    if (dropDistance > 0) {
      setStats((prev) => ({
        ...prev,
        score: prev.score + dropDistance * SCORE_TABLE.hardDrop,
      }));
    }

    soundManager.playHardDrop();
    lockPiece();
  }, [getGhostY, lockPiece]);

  // SRS Rotation (Super Rotation System with official wall kick tables)
  const rotate = useCallback(
    (direction: 'CW' | 'CCW') => {
      if (
        gameStatusRef.current !== 'PLAYING' ||
        !activePieceRef.current ||
        isClearingRef.current
      ) {
        return;
      }
      const piece = activePieceRef.current;
      const currentRot = piece.rotation;
      const nextRot = (
        direction === 'CW' ? (currentRot + 1) % 4 : (currentRot + 3) % 4
      ) as Rotation;

      // O piece needs no wall kick or rotation matrix shift
      if (piece.type === 'O') {
        return;
      }

      const transitionKey = `${currentRot}->${nextRot}`;
      const kickTable =
        piece.type === 'I' ? I_WALL_KICK_DATA : JLSTZ_WALL_KICK_DATA;
      const kickOffsets = kickTable[transitionKey] || [[0, 0]];

      for (let i = 0; i < kickOffsets.length; i++) {
        const [dx, dy] = kickOffsets[i];
        const testX = piece.x + dx;
        const testY = piece.y + dy;

        if (
          !checkCollision(
            piece.type,
            matrixRef.current,
            testX,
            testY,
            nextRot
          )
        ) {
          // Successful rotation via test `i`
          const updated: ActivePiece = {
            ...piece,
            x: testX,
            y: testY,
            rotation: nextRot,
            lastActionWasRotate: true,
            lastKickIndex: i,
          };
          setActivePiece(updated);
          activePieceRef.current = updated;
          soundManager.playRotate();

          // Reset lock delay if grounded
          if (isGrounded(updated, matrixRef.current)) {
            if (lockMovesRef.current < MAX_LOCK_MOVES) {
              lockMovesRef.current++;
              scheduleLockDelay();
            }
          } else {
            cancelLockDelay();
          }
          return;
        }
      }
      // If all kicks fail, rotation is blocked
    },
    [checkCollision, isGrounded, scheduleLockDelay, cancelLockDelay]
  );

  // Hold Piece
  const hold = useCallback(() => {
    if (
      gameStatusRef.current !== 'PLAYING' ||
      !activePieceRef.current ||
      !canHoldRef.current ||
      isClearingRef.current
    ) {
      return;
    }

    cancelLockDelay();
    soundManager.playHold();

    const currentType = activePieceRef.current.type;
    const currentHeld = holdPiece;

    setHoldPiece(currentType);
    setCanHold(false);
    canHoldRef.current = false;
    lockMovesRef.current = 0;

    if (currentHeld === null) {
      // Spawn from queue
      spawnNextPiece(matrixRef.current);
    } else {
      // Swap with held piece
      const spawnPos = getSpawnPosition(currentHeld);
      const swappedPiece: ActivePiece = {
        type: currentHeld,
        rotation: 0,
        x: spawnPos.x,
        y: spawnPos.y,
        lastActionWasRotate: false,
      };

      if (
        checkCollision(
          swappedPiece.type,
          matrixRef.current,
          swappedPiece.x,
          swappedPiece.y,
          swappedPiece.rotation
        )
      ) {
        setGameStatus('GAMEOVER');
        gameStatusRef.current = 'GAMEOVER';
        setActivePiece(null);
        soundManager.playGameOver();
        return;
      }

      setActivePiece(swappedPiece);
      activePieceRef.current = swappedPiece;
    }
  }, [holdPiece, cancelLockDelay, spawnNextPiece, checkCollision]);

  // Main Gravity Fall Tick
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const speedMs = LEVEL_SPEEDS_MS[Math.min(stats.level, 15)] || 30;

    const interval = setInterval(() => {
      if (
        gameStatusRef.current !== 'PLAYING' ||
        !activePieceRef.current ||
        isClearingRef.current
      ) {
        return;
      }

      const piece = activePieceRef.current;
      const targetY = piece.y + 1;

      if (
        !checkCollision(
          piece.type,
          matrixRef.current,
          piece.x,
          targetY,
          piece.rotation
        )
      ) {
        const updated = {
          ...piece,
          y: targetY,
          lastActionWasRotate: false,
        };
        setActivePiece(updated);
        activePieceRef.current = updated;

        if (isGrounded(updated, matrixRef.current)) {
          scheduleLockDelay();
        }
      } else {
        // Can't move down, initiate lock down
        if (lockTimeoutRef.current === null) {
          scheduleLockDelay();
        }
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [gameStatus, stats.level, checkCollision, isGrounded, scheduleLockDelay]);

  // Start / Restart game
  const startGame = useCallback(
    (startLevel: number = 1) => {
      cancelLockDelay();
      const emptyMatrix = createEmptyMatrix();
      setMatrix(emptyMatrix);
      matrixRef.current = emptyMatrix;

      // Generate 2 bags for good buffer
      const initialQueue = [...generateBag(), ...generateBag()];
      const firstPieceType = initialQueue.shift()!;
      setQueue(initialQueue);
      queueRef.current = initialQueue;

      const spawnPos = getSpawnPosition(firstPieceType);
      const firstPiece: ActivePiece = {
        type: firstPieceType,
        rotation: 0,
        x: spawnPos.x,
        y: spawnPos.y,
        lastActionWasRotate: false,
      };

      setActivePiece(firstPiece);
      activePieceRef.current = firstPiece;
      setHoldPiece(null);
      setCanHold(true);
      canHoldRef.current = true;
      lockMovesRef.current = 0;
      isClearingRef.current = false;
      setBanners([]);

      setStats((prev) => ({
        ...prev,
        score: 0,
        level: startLevel,
        lines: 0,
        combo: 0,
        maxCombo: 0,
        backToBack: false,
        singles: 0,
        doubles: 0,
        triples: 0,
        tetrises: 0,
        tspins: 0,
        startTime: Date.now(),
        elapsedSeconds: 0,
        piecesDropped: 0,
      }));

      setGameStatus('PLAYING');
      gameStatusRef.current = 'PLAYING';
    },
    [cancelLockDelay]
  );

  // Pause / Resume game
  const togglePause = useCallback(() => {
    if (gameStatusRef.current === 'PLAYING') {
      setGameStatus('PAUSED');
      gameStatusRef.current = 'PAUSED';
      cancelLockDelay();
    } else if (gameStatusRef.current === 'PAUSED') {
      setGameStatus('PLAYING');
      gameStatusRef.current = 'PLAYING';
    }
  }, [cancelLockDelay]);

  return {
    matrix,
    activePiece,
    ghostY: activePiece ? getGhostY(activePiece, matrix) : null,
    holdPiece,
    canHold,
    nextPieces: queue.slice(0, 5),
    gameStatus,
    stats,
    banners,
    screenShake,
    startGame,
    togglePause,
    moveLeft: () => moveHorizontal(-1),
    moveRight: () => moveHorizontal(1),
    softDrop,
    hardDrop,
    rotateCW: () => rotate('CW'),
    rotateCCW: () => rotate('CCW'),
    hold,
  };
}
