'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import { Board } from './Board';
import { PieceComponents } from './pieces';
import { projects, type PieceId } from '@/lib/projects';
import { chessManager } from '@/lib/chessManager';

interface SceneProps {
  onSelect: (id: PieceId) => void;
  selectedId?: PieceId | null;
}

/** Drives the chess manager once per frame before pieces read from it. */
function ManagerTick() {
  useFrame((state) => {
    chessManager.tick(state.clock.getElapsedTime());
  }, -1);
  return null;
}

export function Scene({ onSelect, selectedId }: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
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
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* rim lights give the pieces coloured edge highlights */}
      <pointLight position={[-6, 4, -5]} color="#a855f7" intensity={3} distance={14} />
      <pointLight position={[5, 5, -4]}  color="#ec4899" intensity={2} distance={12} />
      <pointLight position={[0, 5, 0]}   color="#6366f1" intensity={1.8} distance={10} />

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
        enableZoom
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
