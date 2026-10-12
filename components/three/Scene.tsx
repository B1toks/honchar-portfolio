'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Board } from './Board';
import { PieceComponents } from './pieces';
import { projects, type PieceId } from '@/lib/projects';
import { chessManager } from '@/lib/chessManager';

interface SceneProps {
  onSelect: (id: PieceId) => void;
  selectedId?: PieceId | null;
  /** false = the hero is off-screen, so stop rendering frames */
  active?: boolean;
}

/** Drives the chess manager once per frame before pieces read from it. */
function ManagerTick() {
  useFrame((state) => {
    chessManager.tick(state.clock.getElapsedTime());
  }, -1);
  return null;
}

/**
 * Keeps the frame rate up on weaker GPUs: starts at up to 1.5x pixel density, steps the render
 * resolution down while frames take too long, and back up when there is headroom.
 */
const DPR_MAX = 1.5;
const DPR_MIN = 0.85;
const ceilingDpr = () => Math.min(DPR_MAX, window.devicePixelRatio || 1);

function AdaptiveResolution() {
  const setDpr = useThree((s) => s.setDpr);
  const win = useRef({ t0: 0, frames: 0, calm: 0, dpr: ceilingDpr() });
  useFrame(() => {
    const w = win.current;
    const now = performance.now();
    if (!w.t0 || now - w.t0 > 1500) {
      // first frame, or the loop was paused: start a fresh window
      w.t0 = now;
      w.frames = 0;
      return;
    }
    w.frames++;
    if (now - w.t0 < 600) return;
    const fps = (w.frames * 1000) / (now - w.t0);
    w.t0 = now;
    w.frames = 0;
    if (fps < 46 && w.dpr > DPR_MIN) {
      w.dpr = Math.max(DPR_MIN, w.dpr - 0.2);
      w.calm = 0;
      setDpr(w.dpr);
    } else if (fps > 57) {
      w.calm++;
      if (w.calm >= 8 && w.dpr < ceilingDpr()) {
        w.dpr = Math.min(ceilingDpr(), w.dpr + 0.2);
        w.calm = 0;
        setDpr(w.dpr);
      }
    } else {
      w.calm = 0;
    }
  });
  return null;
}

export function Scene({ onSelect, selectedId, active = true }: SceneProps) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      shadows
      dpr={[1, DPR_MAX]}
      camera={{ position: [5, 6, 8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 12, 24]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* rim lights give the pieces coloured edge highlights */}
      <pointLight position={[-6, 4, -5]} color="#a855f7" intensity={3} distance={14} />
      <pointLight position={[5, 5, -4]}  color="#ec4899" intensity={2} distance={12} />
      <pointLight position={[0, 5, 0]}   color="#6366f1" intensity={1.8} distance={10} />

      <AdaptiveResolution />
      <Suspense fallback={null}>
        <ManagerTick />
        <Board />
        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.4}
          scale={12}
          blur={2.4}
          far={4}
          color="#000000"
        />
        {projects.map((p) => {
          const Component = PieceComponents[p.id];
          return (
            <Component
              key={p.id}
              project={p}
              onSelect={onSelect}
              isSelected={selectedId === p.id}
            />
          );
        })}
        <Environment preset="night" />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minDistance={6}
        maxDistance={16}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
