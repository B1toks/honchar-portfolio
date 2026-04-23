'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Standard 8×8 chessboard.
 * A glowing 2×2 "kinetic" segment at the center pulses + rotates in discrete 90° steps.
 */
export function Board() {
  const segRef = useRef<THREE.Group>(null);
  const SIZE = 8;
  const CELL = 1;
  const HALF = (SIZE * CELL) / 2;   // 4
  const OFFSET = HALF - CELL / 2;   // 3.5

  // kinetic segment at files/ranks 3-4 (center 2x2)
  const SEG_MIN = 3;

  useFrame((state) => {
    if (!segRef.current) return;
    const t = state.clock.getElapsedTime();
    // rotate in 90° discrete pulses every ~8s
    const phase = (t % 12) / 12;
    let target = 0;
    if (phase < 0.4) target = 0;
    else if (phase < 0.5) target = (phase - 0.4) * 10 * (Math.PI / 2);
    else if (phase < 0.9) target = Math.PI / 2;
    else target = Math.PI / 2 - (phase - 0.9) * 10 * (Math.PI / 2);
    segRef.current.rotation.y = THREE.MathUtils.lerp(
      segRef.current.rotation.y,
      target,
      0.12,
    );
  });

  const staticCells = useMemo(() => {
    const list: { key: string; pos: [number, number, number]; isDark: boolean }[] = [];
    for (let x = 0; x < SIZE; x++) {
      for (let z = 0; z < SIZE; z++) {
        // skip kinetic 2x2 segment — rendered inside rotating group
        if (x >= SEG_MIN && x < SEG_MIN + 2 && z >= SEG_MIN && z < SEG_MIN + 2) continue;
        list.push({
          key: `c-${x}-${z}`,
          pos: [x * CELL - OFFSET, 0, z * CELL - OFFSET],
          isDark: (x + z) % 2 === 0,
        });
      }
    }
    return list;
  }, [OFFSET]);

  const segmentCells = useMemo(() => {
    const list: { key: string; local: [number, number, number] }[] = [];
    for (let x = SEG_MIN; x < SEG_MIN + 2; x++) {
      for (let z = SEG_MIN; z < SEG_MIN + 2; z++) {
        list.push({
          key: `s-${x}-${z}`,
          local: [
            (x - (SEG_MIN + 0.5)) * CELL,
            0,
            (z - (SEG_MIN + 0.5)) * CELL,
          ],
        });
      }
    }
    return list;
  }, []);

  const segCenterX = (SEG_MIN + 0.5) * CELL - OFFSET;
  const segCenterZ = (SEG_MIN + 0.5) * CELL - OFFSET;

  return (
    <group>
      {/* base plate */}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[SIZE + 0.6, 0.24, SIZE + 0.6]} />
        <meshStandardMaterial color="#0b0f1a" roughness={0.9} metalness={0.15} />
      </mesh>
      {/* side border subtle glow stripe */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[SIZE / 2 + 0.05, SIZE / 2 + 0.28, 4, 1]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* static cells */}
      {staticCells.map((c) => (
        <mesh key={c.key} position={c.pos} receiveShadow>
          <boxGeometry args={[CELL * 0.96, 0.06, CELL * 0.96]} />
          <meshStandardMaterial
            color={c.isDark ? '#1e293b' : '#334155'}
            roughness={0.55}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* rotating kinetic segment */}
      <group ref={segRef} position={[segCenterX, 0, segCenterZ]}>
        {segmentCells.map((c) => (
          <mesh key={c.key} position={c.local} receiveShadow>
            <boxGeometry args={[CELL * 0.96, 0.06, CELL * 0.96]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={0.5}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        ))}
        {/* subtle central glow orb above the segment */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#a5b4fc" />
        </mesh>
      </group>
    </group>
  );
}
