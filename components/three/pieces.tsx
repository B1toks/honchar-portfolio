'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/lib/projects';
import { chessManager } from '@/lib/chessManager';

const ACCENT: Record<Project['color'], string> = {
  indigo:  '#6366f1',
  purple:  '#a855f7',
  cyan:    '#22d3ee',
  pink:    '#ec4899',
  emerald: '#10b981',
  amber:   '#f59e0b',
};

/* ============================================================
   LatheGeometry profiles — classic chess silhouettes
   Each is [radius, height] sampled along the vertical axis.
   ============================================================ */

const V = (r: number, h: number) => new THREE.Vector2(r, h);

const PROFILES = {
  pawn: [
    V(0, 0), V(0.30, 0), V(0.36, 0.04), V(0.34, 0.09),
    V(0.18, 0.14), V(0.16, 0.30), V(0.14, 0.42),
    V(0.20, 0.48), V(0.16, 0.54), V(0.13, 0.58),
    V(0.23, 0.68), V(0.22, 0.78), V(0.16, 0.83),
    V(0.05, 0.86), V(0, 0.87),
  ],
  rook: [
    V(0, 0), V(0.34, 0), V(0.40, 0.04), V(0.38, 0.10),
    V(0.24, 0.14), V(0.22, 0.70),
    V(0.30, 0.75), V(0.32, 0.82),
    V(0.28, 0.82), V(0.28, 0.88), V(0, 0.88),
  ],
  bishop: [
    V(0, 0), V(0.32, 0), V(0.38, 0.04), V(0.36, 0.09),
    V(0.18, 0.14), V(0.16, 0.30), V(0.14, 0.48),
    V(0.22, 0.55), V(0.18, 0.60),
    V(0.27, 0.70), V(0.24, 0.78),
    V(0.12, 0.95), V(0.04, 1.02), V(0, 1.02),
  ],
  queen: [
    V(0, 0), V(0.36, 0), V(0.44, 0.04), V(0.42, 0.10),
    V(0.22, 0.15), V(0.20, 0.35), V(0.18, 0.55),
    V(0.26, 0.62), V(0.22, 0.67),
    V(0.30, 0.80), V(0.28, 0.86),
    V(0.16, 0.95), V(0, 1.00),
  ],
  king: [
    V(0, 0), V(0.40, 0), V(0.46, 0.04), V(0.44, 0.10),
    V(0.22, 0.15), V(0.20, 0.35), V(0.18, 0.60),
    V(0.28, 0.66), V(0.24, 0.70),
    V(0.33, 0.84), V(0.31, 0.90),
    V(0.22, 0.98), V(0.10, 1.02), V(0, 1.02),
  ],
  // knight uses lathe only for base
  knightBase: [
    V(0, 0), V(0.34, 0), V(0.40, 0.04), V(0.38, 0.10),
    V(0.22, 0.15), V(0.20, 0.30), V(0.18, 0.38),
    V(0.22, 0.44), V(0.2, 0.48),
  ],
} as const;

interface PieceProps {
  project: Project;
  onSelect: (id: Project['id']) => void;
  isSelected?: boolean;
}

function useMaterials(color: string) {
  return useMemo(() => {
    const c = new THREE.Color(color);
    const base = new THREE.MeshPhysicalMaterial({
      color: c.clone().multiplyScalar(0.85),
      metalness: 0.35,
      roughness: 0.3,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
      emissive: c.clone().multiplyScalar(0.6),
      emissiveIntensity: 0.12,
      envMapIntensity: 0.9,
    });
    const accent = new THREE.MeshPhysicalMaterial({
      color: c.clone().lerp(new THREE.Color('#ffffff'), 0.5),
      metalness: 0.5,
      roughness: 0.2,
      clearcoat: 0.9,
      emissive: c,
      emissiveIntensity: 0.35,
    });
    return { base, accent };
  }, [color]);
}

/* ============================================================
   Piece wrapper — shared hover/click/animation
   ============================================================ */
export function Piece({
  project,
  onSelect,
  isSelected,
  children,
}: PieceProps & { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const accent = ACCENT[project.color];

  useFrame((state, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const now = state.clock.getElapsedTime();
    // position from manager (handles idle bob + move arc)
    const [x, y, z] = chessManager.getPosition(project.id, now);
    g.position.set(x, y, z);
    g.rotation.y = chessManager.getRotationY(project.id, dt);

    // hover scale
    const target = hovered ? 1.15 : 1;
    g.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        chessManager.pause(project.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        chessManager.resume(project.id);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(project.id);
      }}
    >
      {/* glow halo under piece */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={hovered || isSelected ? 0.55 : 0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {children}
      {hovered && !chessManager.isAnimating(project.id) && (
        <Html position={[0, 1.6, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
          <div className="px-2.5 py-1 rounded-full bg-ink-900/90 border border-white/10 text-[10px] font-mono text-ink-100 whitespace-nowrap backdrop-blur-sm">
            <span className="text-ink-400">{project.pieceLabel} · </span>
            <span className="font-semibold">{project.title}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ============================================================
   Piece implementations
   ============================================================ */

export function King(props: PieceProps) {
  const { base, accent } = useMaterials(ACCENT[props.project.color]);
  return (
    <Piece {...props}>
      <mesh material={base} castShadow>
        <latheGeometry args={[PROFILES.king as unknown as THREE.Vector2[], 32]} />
      </mesh>
      {/* crown cross */}
      <mesh material={accent} position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.07, 0.22, 0.07]} />
      </mesh>
      <mesh material={accent} position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.07, 0.07]} />
      </mesh>
    </Piece>
  );
}

export function Queen(props: PieceProps) {
  const { base, accent } = useMaterials(ACCENT[props.project.color]);
  return (
    <Piece {...props}>
      <mesh material={base} castShadow>
        <latheGeometry args={[PROFILES.queen as unknown as THREE.Vector2[], 32]} />
      </mesh>
      {/* crown points — 6 small cones */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            material={accent}
            position={[Math.cos(a) * 0.16, 1.04, Math.sin(a) * 0.16]}
            castShadow
          >
            <coneGeometry args={[0.05, 0.14, 8]} />
          </mesh>
        );
      })}
      {/* central orb */}
      <mesh material={accent} position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>
    </Piece>
  );
}

export function Bishop(props: PieceProps) {
  const { base, accent } = useMaterials(ACCENT[props.project.color]);
  return (
    <Piece {...props}>
      <mesh material={base} castShadow>
        <latheGeometry args={[PROFILES.bishop as unknown as THREE.Vector2[], 32]} />
      </mesh>
      {/* bishop mitre slit — decorative ring */}
      <mesh material={accent} position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.015, 8, 24]} />
      </mesh>
      <mesh material={accent} position={[0, 1.08, 0]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
      </mesh>
    </Piece>
  );
}

export function Rook(props: PieceProps) {
  const { base, accent } = useMaterials(ACCENT[props.project.color]);
  const crenells = useMemo(() => {
    const list: [number, number, number][] = [];
    const radius = 0.27;
    for (let i = 0; i < 8; i += 2) {
      const a = (i / 8) * Math.PI * 2;
      list.push([Math.cos(a) * radius, 0.94, Math.sin(a) * radius]);
    }
    return list;
  }, []);
  return (
    <Piece {...props}>
      <mesh material={base} castShadow>
        <latheGeometry args={[PROFILES.rook as unknown as THREE.Vector2[], 24]} />
      </mesh>
      {crenells.map((p, i) => (
        <mesh key={i} material={accent} position={p} castShadow>
          <boxGeometry args={[0.11, 0.13, 0.11]} />
        </mesh>
      ))}
    </Piece>
  );
}

export function Pawn(props: PieceProps) {
  const { base } = useMaterials(ACCENT[props.project.color]);
  return (
    <Piece {...props}>
      <mesh material={base} castShadow>
        <latheGeometry args={[PROFILES.pawn as unknown as THREE.Vector2[], 24]} />
      </mesh>
    </Piece>
  );
}

export function Knight(props: PieceProps) {
  const { base, accent } = useMaterials(ACCENT[props.project.color]);
  return (
    <Piece {...props}>
      {/* lathe base */}
      <mesh material={base} castShadow>
        <latheGeometry args={[PROFILES.knightBase as unknown as THREE.Vector2[], 24]} />
      </mesh>
      {/* stylised horse head — neck + skull + snout + ears */}
      <group position={[0, 0.48, 0]}>
        {/* neck (slightly forward-tilted cylinder) */}
        <mesh material={base} position={[0, 0.15, 0.03]} rotation={[-0.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 0.35, 12]} />
        </mesh>
        {/* skull/head — rounded box tilted forward */}
        <mesh material={accent} position={[0, 0.38, 0.12]} rotation={[-0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.22, 0.22, 0.35]} />
        </mesh>
        {/* snout */}
        <mesh material={accent} position={[0, 0.32, 0.32]} rotation={[-0.55, 0, 0]} castShadow>
          <boxGeometry args={[0.14, 0.13, 0.18]} />
        </mesh>
        {/* ears */}
        <mesh material={accent} position={[-0.07, 0.55, 0.02]} rotation={[-0.2, 0, -0.1]} castShadow>
          <coneGeometry args={[0.04, 0.12, 8]} />
        </mesh>
        <mesh material={accent} position={[0.07, 0.55, 0.02]} rotation={[-0.2, 0, 0.1]} castShadow>
          <coneGeometry args={[0.04, 0.12, 8]} />
        </mesh>
        {/* mane suggestion */}
        <mesh material={base} position={[0, 0.42, -0.08]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 0.28, 0.16]} />
        </mesh>
      </group>
    </Piece>
  );
}

export const PieceComponents = {
  king: King,
  queen: Queen,
  knight: Knight,
  rook: Rook,
  bishop: Bishop,
  pawn: Pawn,
} as const;
