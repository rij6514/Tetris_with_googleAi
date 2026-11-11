/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Check, ShieldCheck, X } from 'lucide-react';

interface ControlsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-arcade font-bold tracking-wide text-white">
              게임 가이드 & SRS 조작법
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs md:text-sm text-slate-300">
          {/* Controls table */}
          <div>
            <h3 className="font-arcade font-bold text-cyan-300 text-sm mb-2 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-cyan-400" /> 기본 키보드 조작
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono block">좌 / 우 이동</span>
                <span className="font-bold text-white font-mono">← / → 또는 A / D</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono block">소프트 드롭 (빠른 낙하)</span>
                <span className="font-bold text-amber-300 font-mono">↓ 또는 S</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono block">하드 드롭 (즉시 낙하 & 고정)</span>
                <span className="font-bold text-cyan-300 font-mono">Space (스페이스바)</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono block">홀드 (피스 보관 / 교체)</span>
                <span className="font-bold text-yellow-300 font-mono">C 또는 Shift</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono block">시계방향 회전 (우회전)</span>
                <span className="font-bold text-purple-300 font-mono">↑ 또는 X / W</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono block">반시계방향 회전 (좌회전)</span>
                <span className="font-bold text-pink-300 font-mono">Z 또는 Q</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono block">일시정지 / 재개</span>
                <span className="font-bold text-slate-200 font-mono">P 또는 ESC</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-mono block">게임 재시작</span>
                <span className="font-bold text-red-300 font-mono">R 키</span>
              </div>
            </div>
          </div>

          {/* SRS Explanation */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h3 className="font-arcade font-bold text-purple-300 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              SRS (슈퍼 로테이션 시스템) & 벽차기 (Wall Kick)
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              본 게임은 정식 테트리스 가이드라인의 <strong>Super Rotation System (SRS)</strong>을 정밀 구현했습니다.
              벽이나 바닥, 인접한 블록에 걸려 일반 회전이 불가능할 때 최대 5단계의 벽차기 오프셋 벡터를 순서대로 판정하여 부드럽고 전략적인 회전이 가능합니다.
            </p>
            <ul className="list-disc list-inside text-slate-400 text-xs space-y-1">
              <li><strong>I 피스</strong>: 고유의 5단계 벽차기 오프셋 테이블 적용</li>
              <li><strong>J, L, S, T, Z 피스</strong>: 3x3 박스 표준 SRS 오프셋 적용</li>
              <li><strong>T-Spin 감지</strong>: 3코너 룰 판정으로 고득점의 T-스핀 보너스 획득 가능</li>
            </ul>
          </div>

          {/* Hold & Level rules */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h3 className="font-arcade font-bold text-emerald-300 text-sm">
              홀드 & 레벨별 난이도 상승
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              - <strong>홀드(Hold)</strong>: 현재 피스를 보관함에 넣고 대기 큐의 다음 피스를 꺼냅니다. 한 번 잠그기(Lock) 전까지는 1회만 홀드할 수 있습니다.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              - <strong>레벨별 가속</strong>: 10줄을 클리어할 때마다 레벨이 1씩 상승하며, 레벨 1(800ms)부터 레벨 15(28ms)까지 중력 가속도가 기하급수적으로 빨라집니다.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              - <strong>7-Bag 룰</strong>: 7개의 서로 다른 미노(I, J, L, O, S, T, Z)가 한 주머니에서 셔플되어 지급되므로 긴 블록 가뭄 없이 균등하게 출현합니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-arcade font-bold text-xs tracking-wider cursor-pointer active:scale-95 transition-all"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
