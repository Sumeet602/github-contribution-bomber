import { useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";
import { BombTarget } from "./Root";

// GitHub Light Mode contribution colors shifted one tone darker for better contrast
const COLORS = ["#6b7280", "#40c463", "#30a14e", "#216e39", "#144620"];
const COLS = 52;
const ROWS = 7;
export const SPACING = 1.2;
const EXPLOSION_POWER = 0.5;
export const EXPLOSION_RADIUS = 2.5;

interface CubeProps {
  x: number;
  z: number;
  level: number;
  targets: BombTarget[];
  durationInFrames: number;
}

const Cube: React.FC<CubeProps> = ({ x, z, level, targets, durationInFrames }) => {
  const frame = useCurrentFrame();

  const gridWidth = COLS * SPACING;
  const gridDepth = ROWS * SPACING;
  const initialX = x * SPACING - gridWidth / 2;
  const initialZ = z * SPACING - gridDepth / 2;
  
  const greenHeight = level === 0 ? 0 : level * 0.8;
  const initialY = 0.2 + greenHeight / 2;

  const destroyingTarget = useMemo(() => {
    if (level === 0) return null;
    
    let earliest: (BombTarget & { delay: number }) | null = null;
    for (const t of targets) {
      const dx = x - t.x;
      const dz = z - t.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= EXPLOSION_RADIUS) {
        const delay = dist * 2; 
        if (!earliest || (t.frame + delay) < (earliest.frame + earliest.delay)) {
          earliest = { ...t, delay };
        }
      }
    }
    return earliest;
  }, [x, z, targets, level]);

  const REGROW_START_FRAME = durationInFrames - 150;

  // If we are in the regrowth phase, ignore all explosion physics
  if (frame > REGROW_START_FRAME && level > 0) {
    const regrowProgress = (frame - REGROW_START_FRAME) / 100;
    const clampedProgress = Math.min(1, Math.max(0, regrowProgress));
    
    // Elastic ease out
    const c4 = (2 * Math.PI) / 3;
    const easeOutElastic = clampedProgress === 0 ? 0 : clampedProgress === 1 ? 1 : Math.pow(2, -10 * clampedProgress) * Math.sin((clampedProgress * 10 - 0.75) * c4) + 1;
    
    const currentGreenHeight = greenHeight * easeOutElastic;
    const currentY = 0.2 + currentGreenHeight / 2;

    return (
      <group>
        <mesh position={[initialX, 0.1, initialZ]}>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color={COLORS[0]} />
        </mesh>
        
        <mesh 
          position={[initialX, currentY, initialZ]} 
          rotation={[0, 0, 0]}
        >
          <boxGeometry args={[1, currentGreenHeight, 1]} />
          <meshStandardMaterial color={COLORS[level]} />
        </mesh>
      </group>
    );
  }

  // Shrink the block into nothingness as it falls apart
  const elapsed = destroyingTarget && frame > destroyingTarget.frame + destroyingTarget.delay 
    ? frame - (destroyingTarget.frame + destroyingTarget.delay) 
    : 0;
  const scale = Math.max(0, 1 - elapsed * 0.03); // Disappears completely in ~33 frames

  return (
    <group>
      {/* Static Base */}
      <mesh position={[initialX, 0.1, initialZ]}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color={COLORS[0]} />
      </mesh>
      
      {/* Exploding Green Block - Sliced into floors for collapse effect */}
      {level > 0 && scale > 0 && Array.from({ length: 4 }).map((_, i) => {
        const SLICES = 4;
        const sliceHeight = greenHeight / SLICES;
        const sliceStartY = 0.2 + sliceHeight / 2 + i * sliceHeight;
        
        let sx = initialX;
        let sy = sliceStartY;
        let sz = initialZ;
        let sRotX = 0;
        let sRotY = 0;
        let sRotZ = 0;
        
        if (elapsed > 0) {
            const targetX = destroyingTarget!.x * SPACING - gridWidth / 2;
            const targetZ = destroyingTarget!.z * SPACING - gridDepth / 2;
            
            const dx = initialX - targetX;
            const dz = initialZ - targetZ;
            
            const dist = Math.sqrt(dx * dx + dz * dz);
            const dirX = dist === 0 ? (Math.random() - 0.5) : dx / dist;
            const dirZ = dist === 0 ? (Math.random() - 0.5) : dz / dist;
            
            // Higher slices get pushed much harder (building shearing apart)
            const shear = 1 + i * 1.5; 
            const randX = (Math.sin(x * 12.3 + z * 4.5 + i * 3.1) - 0.5) * 2;
            const randZ = (Math.cos(x * 7.8 + z * 9.2 + i * 1.4) - 0.5) * 2;
            
            const vx = dirX * EXPLOSION_POWER * 3 * shear + randX * EXPLOSION_POWER;
            const vz = dirZ * EXPLOSION_POWER * 3 * shear + randZ * EXPLOSION_POWER;
            const vy = EXPLOSION_POWER * (1 + i * 0.8); 
            
            const gravity = 0.6; // Fall heavily
            
            sx = initialX + vx * elapsed;
            sz = initialZ + vz * elapsed;
            
            const unconstrainedY = sliceStartY + vy * elapsed - 0.5 * gravity * elapsed * elapsed;
            const floorY = 0.2 + (sliceHeight / 2) * scale;
            
            if (unconstrainedY <= floorY) {
                sy = floorY;
                sRotX = randX * Math.PI; // Tumble on the ground
                sRotZ = randZ * Math.PI;
            } else {
                sy = unconstrainedY;
                sRotX = elapsed * 0.2 * randX;
                sRotZ = elapsed * 0.2 * randZ;
            }
            sRotY = elapsed * 0.15 * shear * (randX > 0 ? 1 : -1);
        }
        
        return (
          <mesh 
            key={i}
            position={[sx, sy, sz]} 
            rotation={[sRotX, sRotY, sRotZ]}
            scale={[scale, scale, scale]}
          >
            <boxGeometry args={[1, sliceHeight, 1]} />
            <meshStandardMaterial color={COLORS[level]} />
          </mesh>
        );
      })}
    </group>
  );
};

export const ContributionGrid: React.FC<{ levels: number[], targets: BombTarget[], durationInFrames: number }> = ({ levels, targets, durationInFrames }) => {
  const gridData = useMemo(() => {
    const data: { x: number; z: number; level: number }[] = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const index = c * ROWS + r;
        const level = levels[index] || 0;
        data.push({ x: c, z: r, level });
      }
    }
    return data;
  }, [levels]);

  return (
    <group>
      {gridData.map((d) => (
        <Cube key={`${d.x}-${d.z}`} x={d.x} z={d.z} level={d.level} targets={targets} durationInFrames={durationInFrames} />
      ))}
    </group>
  );
};
