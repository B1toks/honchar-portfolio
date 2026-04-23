import type { PieceId } from './projects';

export type Square = [number, number]; // [file, rank] each 0-7

interface PieceAnim {
  from: Square;
  to: Square;
  startTime: number; // seconds (clock.getElapsedTime())
  duration: number;
}

interface PieceState {
  id: PieceId;
  square: Square;
  anim?: PieceAnim;
  bobPhase: number;
  yaw: number; // current facing direction (radians)
  yawTarget: number;
}

const BOARD = 8;
const OFFSET = BOARD / 2 - 0.5; // center the board around world origin

/** convert board square [file, rank] → world coords [x, z] */
export function squareToWorld(sq: Square): [number, number] {
  return [sq[0] - OFFSET, sq[1] - OFFSET];
}

const INITIAL: Record<PieceId, Square> = {
  king:   [2, 4],
  queen:  [1, 5],
  knight: [6, 2],
  rook:   [0, 0],
  bishop: [5, 6],
  pawn:   [4, 1],
};

/** movement patterns. Queen/Rook/Bishop are rays, others are discrete jumps. */
const PATTERNS = {
  king:   [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]] as Square[],
  knight: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] as Square[],
  pawn:   [[0,1],[0,-1],[1,0],[-1,0]] as Square[], // relaxed pawn — walks any orthogonal
  // rays
  rook:   [[1,0],[-1,0],[0,1],[0,-1]] as Square[],
  bishop: [[1,1],[1,-1],[-1,1],[-1,-1]] as Square[],
  queen:  [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]] as Square[],
};

const IS_RAY: Record<PieceId, boolean> = {
  king: false, knight: false, pawn: false,
  rook: true, bishop: true, queen: true,
};

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function inBounds([f, r]: Square): boolean {
  return f >= 0 && f < BOARD && r >= 0 && r < BOARD;
}

class ChessManager {
  private pieces = new Map<PieceId, PieceState>();
  private lastMoveTime = 0;
  private nextInterval = 3;
  private pausedIds = new Set<PieceId>();

  constructor() {
    (Object.keys(INITIAL) as PieceId[]).forEach((id) => {
      this.pieces.set(id, {
        id,
        square: [...INITIAL[id]] as Square,
        bobPhase: Math.random() * Math.PI * 2,
        yaw: 0,
        yawTarget: 0,
      });
    });
  }

  pause(id: PieceId) { this.pausedIds.add(id); }
  resume(id: PieceId) { this.pausedIds.delete(id); }

  /** All currently occupied squares (excluding animating pieces' targets). */
  private occupied(excludeId?: PieceId): Set<string> {
    const s = new Set<string>();
    this.pieces.forEach((p) => {
      if (p.id === excludeId) return;
      const sq = p.anim ? p.anim.to : p.square;
      s.add(`${sq[0]},${sq[1]}`);
    });
    return s;
  }

  /** Generate all legal-ish moves for a piece. */
  private legalMoves(p: PieceState): Square[] {
    const occ = this.occupied(p.id);
    const results: Square[] = [];
    const patt = PATTERNS[p.id];
    const isRay = IS_RAY[p.id];

    for (const [df, dr] of patt) {
      if (isRay) {
        // slide until edge or collision
        let f = p.square[0] + df;
        let r = p.square[1] + dr;
        while (inBounds([f, r])) {
          if (occ.has(`${f},${r}`)) break;
          results.push([f, r]);
          f += df;
          r += dr;
        }
      } else {
        const sq: Square = [p.square[0] + df, p.square[1] + dr];
        if (inBounds(sq) && !occ.has(`${sq[0]},${sq[1]}`)) {
          results.push(sq);
        }
      }
    }
    return results;
  }

  /** Runs every frame. Commits finished anims + schedules new moves. */
  tick(now: number) {
    // commit finished animations
    this.pieces.forEach((p) => {
      if (p.anim && now >= p.anim.startTime + p.anim.duration) {
        p.square = p.anim.to;
        p.anim = undefined;
      }
    });

    // any piece still animating? skip scheduling
    let animating = false;
    this.pieces.forEach((p) => { if (p.anim) animating = true; });

    if (!animating && now - this.lastMoveTime > this.nextInterval) {
      this.tryMove(now);
      this.lastMoveTime = now;
      this.nextInterval = 2.5 + Math.random() * 4; // 2.5–6.5s
    }
  }

  private tryMove(now: number) {
    const eligible = Array.from(this.pieces.values()).filter(
      (p) => !this.pausedIds.has(p.id),
    );
    // shuffle
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }

    for (const p of eligible) {
      const moves = this.legalMoves(p);
      if (moves.length === 0) continue;
      const to = moves[Math.floor(Math.random() * moves.length)];
      p.anim = {
        from: [...p.square] as Square,
        to: [...to] as Square,
        startTime: now,
        duration: 0.9,
      };
      // face the target
      const [fx, fz] = squareToWorld(p.square);
      const [tx, tz] = squareToWorld(to);
      p.yawTarget = Math.atan2(tx - fx, tz - fz);
      return;
    }
  }

  /** World-space position (with anim interpolation + idle bob). */
  getPosition(id: PieceId, now: number): [number, number, number] {
    const p = this.pieces.get(id);
    if (!p) return [0, 0, 0];

    const bob = Math.sin(now * 1.8 + p.bobPhase) * 0.04 + 0.04;

    if (p.anim) {
      const t = Math.min((now - p.anim.startTime) / p.anim.duration, 1);
      const e = easeInOutQuad(t);
      const [fx, fz] = squareToWorld(p.anim.from);
      const [tx, tz] = squareToWorld(p.anim.to);
      const x = fx + (tx - fx) * e;
      const z = fz + (tz - fz) * e;
      const dist = Math.hypot(tx - fx, tz - fz);
      const jumpH = 0.35 + Math.min(dist, 6) * 0.12;
      const y = Math.sin(t * Math.PI) * jumpH + bob * 0.3;
      return [x, y, z];
    }
    const [x, z] = squareToWorld(p.square);
    return [x, bob, z];
  }

  /** Smooth yaw (facing) per frame. */
  getRotationY(id: PieceId, dt: number): number {
    const p = this.pieces.get(id);
    if (!p) return 0;
    // smooth toward target
    let diff = p.yawTarget - p.yaw;
    // wrap -PI..PI
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    p.yaw += diff * Math.min(dt * 4, 1);
    return p.yaw;
  }

  isAnimating(id: PieceId): boolean {
    return !!this.pieces.get(id)?.anim;
  }
}

export const chessManager = new ChessManager();
