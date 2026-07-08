import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Euler } from "three";
import { getAirplanePosition } from "./Airplane";
import { SPACING } from "./ContributionGrid";

export const MISSILE_FALL_FRAMES = 30;

interface MissileProps {
  targetX: number;
  targetZ: number;
  targetFrame: number;
  flightPath: { x: number; z: number }[];
  durationInFrames: number;
}

export const Missile: React.FC<MissileProps> = ({ targetX, targetZ, targetFrame, flightPath, durationInFrames }) => {
  const frame = useCurrentFrame();
  const spawnFrame = targetFrame - MISSILE_FALL_FRAMES;

  if (frame < spawnFrame || frame > targetFrame) {
    return null; 
  }

  const startPos = getAirplanePosition(spawnFrame, flightPath, durationInFrames);
  
  const gridWidth = 52 * SPACING;
  const gridDepth = 7 * SPACING;
  const endX = targetX * SPACING - gridWidth / 2;
  const endZ = targetZ * SPACING - gridDepth / 2;

  const progress = (frame - spawnFrame) / MISSILE_FALL_FRAMES;
  const currentX = interpolate(progress, [0, 1], [startPos.x, endX]);
  const currentZ = interpolate(progress, [0, 1], [startPos.z, endZ]);
  const currentY = interpolate(progress, [0, 1], [startPos.y, 0], {
    easing: Easing.in(Easing.quad), // Parabolic gravity
  });

  // Calculate instantaneous velocity to tilt the missile dynamically as it falls!
  const vx = endX - startPos.x;
  const vz = endZ - startPos.z;
  
  // Derivative of Easing.quad (t^2) is 2t. 
  // Since we interpolate from startY to 0, vy = -2 * startY * t
  const vy = -2 * startPos.y * progress;
  
  const horizontalDist = Math.sqrt(vx * vx + vz * vz);
  // Positive pitch tilts the nose down (when using Euler YXZ)
  const currentPitch = Math.atan2(-vy, horizontalDist);
  const yaw = Math.atan2(vx, vz);

  return (
    <group position={[currentX, currentY, currentZ]} rotation={new Euler(currentPitch, yaw, 0, 'YXZ')} scale={1}>
      {/* Rotate the internal geometry so its "nose" points towards local +Z instead of +Y */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Missile Body */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 2, 16]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Nose cone */}
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[0.15, 0.4, 16]} />
          <meshPhysicalMaterial color="#FF2222" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Fins */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.05]} />
          <meshPhysicalMaterial color="#FF2222" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.05]} />
          <meshPhysicalMaterial color="#FF2222" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Exhaust glowing trail point */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={5} />
        </mesh>
      </group>
    </group>
  );
};
