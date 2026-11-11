/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TETROMINO_COLORS, TETROMINO_SHAPES } from '../constants/tetris';
import { TetrominoType } from '../types/tetris';

interface PiecePreviewProps {
  type: TetrominoType | null;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  size = 'md',
  disabled = false,
}) => {
  if (!type) {
    return (
      <div className="w-full h-16 flex items-center justify-center text-slate-600 text-xs font-mono">
        - 빈 슬롯 -
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[type][0];
  const color = TETROMINO_COLORS[type];

  const cellSizeClass =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div
      className={`flex flex-col items-center justify-center p-2 transition-all ${
        disabled ? 'opacity-40 grayscale' : 'opacity-100'
      }`}
    >
      <div className="grid gap-[2px]">
        {shape.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-[2px]">
            {row.map((val, cIdx) => {
              if (!val) {
                return (
                  <div
                    key={cIdx}
                    className={`${cellSizeClass} bg-transparent`}
                  />
                );
              }

              return (
                <div
                  key={cIdx}
                  className={`${cellSizeClass} rounded-[3px] border border-white/30 shadow-sm relative overflow-hidden`}
                  style={{
                    backgroundColor: color.primary,
                    boxShadow: `0 0 8px ${color.glow}`,
                  }}
                >
                  {/* Subtle 3D bevel specular highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/30 pointer-events-none" />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
