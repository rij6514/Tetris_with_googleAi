# NeoTetris Pro

SRS(Super Rotation System)와 홀드, 고스트 피스, 레벨별 낙하 속도를 지원하는 반응형 웹 테트리스 게임입니다. 키보드와 모바일 터치 조작을 모두 지원하며, 점수·콤보·라인 클리어 통계를 확인할 수 있습니다.

## 주요 기능

- 표준 10×20 보드와 숨겨진 스폰 버퍼
- 7-Bag 방식의 블록 생성 및 최대 5개 다음 블록 미리 보기
- SRS 회전 및 벽차기(Wall Kick), 고스트 피스 표시
- 블록 홀드, 소프트 드롭, 하드 드롭, 착지 지연(Lock Delay)
- 싱글·더블·트리플·테트리스, T-Spin, 콤보 및 백투백 점수
- 10줄을 지울 때마다 레벨 상승, 최대 15레벨까지 낙하 속도 증가
- 최고 점수 브라우저 저장(localStorage)
- 효과음과 배경 음악 켜기/끄기, 게임 일시정지 및 재시작
- 데스크톱 키보드와 모바일 화면 버튼 지원
- 라인 클리어 애니메이션, 액션 알림, 테트리스/레벨 업 시각 효과

## 기술 스택

- React 19, TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide React, Motion, canvas-confetti
- 사운드는 브라우저에서 생성·재생하는 클라이언트 기능으로 구현되어 있습니다.

## 시작하기

### 요구 사항

- Node.js 및 npm, 또는 Bun

### 설치 및 개발 서버

```bash
# 저장소 복제
 git clone https://github.com/rij6514/Tetris_with_googleAi.git
cd Tetris_with_googleAi

# npm 사용
npm install
npm run dev

# 또는 Bun 사용
bun install
bun run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 빌드 및 미리 보기

```bash
npm run build
npm run preview
```

타입 검사:

```bash
npm run lint
```

`npm run lint` 스크립트는 TypeScript 컴파일러를 `--noEmit` 옵션으로 실행합니다.

## 조작 방법

| 동작 | 키보드 |
| --- | --- |
| 왼쪽 / 오른쪽 이동 | `←` / `→` 또는 `A` / `D` |
| 소프트 드롭 | `↓` 또는 `S` |
| 하드 드롭 | `Space` |
| 시계 방향 회전 | `↑`, `W` 또는 `X` |
| 반시계 방향 회전 | `Z` 또는 `Q` |
| 블록 홀드 | `C` 또는 `Shift` |
| 일시정지 / 재개 | `P` 또는 `Esc` |
| 게임 시작 / 재시작 | `R` |

모바일 화면에서는 방향 이동, 소프트·하드 드롭, 회전, 홀드 및 일시정지 버튼을 사용할 수 있습니다.

## 프로젝트 구조

```text
src/
├── App.tsx                  # 게임 화면, 키보드 입력 및 UI 상태
├── main.tsx                 # React 앱 진입점
├── index.css                # 전역 스타일
├── components/              # 보드, 블록 미리 보기, 통계, 모달, 모바일 조작 UI
├── constants/tetris.ts      # 보드·블록·SRS·점수·레벨 속도 설정
├── hooks/useTetris.ts       # 게임 상태와 규칙을 관리하는 핵심 로직
├── types/                   # 게임 상태 및 도메인 타입
└── utils/sound.ts           # 효과음 및 BGM 관리
```

## 환경 변수

일반적인 브라우저 게임 플레이에는 Gemini API 키가 필요하지 않습니다. 저장소에는 AI Studio/Cloud Run 환경을 위한 `.env.example`이 있으며, 해당 배포 환경에서 관련 기능을 사용할 때만 플랫폼 안내에 따라 `GEMINI_API_KEY` 및 `APP_URL`을 설정하세요. 비밀 키를 공개 저장소에 커밋하지 마세요.

## 라이선스

소스 코드 파일에는 Apache-2.0 SPDX 라이선스 표시가 포함되어 있습니다. 저장소에 별도의 `LICENSE` 파일이 있는지 확인하고 해당 라이선스 조건을 따르세요.
