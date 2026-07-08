import { useCurrentFrame, interpolateColors, interpolate, Easing } from "remotion";
import { SPACING } from "./ContributionGrid";

interface FireExplosionProps {
  targetX: number;
  targetZ: number;
  targetFrame: number;
}

export const FireExplosion: React.FC<FireExplosionProps> = ({ targetX, targetZ, targetFrame }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - targetFrame;

  // Explosion lasts for 30 frames (1 second)
  if (elapsed < 0 || elapsed > 30) return null;

  // Rapid expansion, then slow drift (halved size)
  const scale = interpolate(
    elapsed, 
    [0, 5, 30], 
    [0.05, 2, 2.5], 
    { easing: Easing.out(Easing.quad), extrapolateRight: "clamp" }
  );
  
  // Fade out over the second half
  const opacity = interpolate(
    elapsed, 
    [15, 30], 
    [1, 0], 
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  
  // Flash white -> yellow -> fiery orange -> smoke
  const color = interpolateColors(
    elapsed, 
    [0, 3, 10, 30], 
    ["#ffffff", "#ffff00", "#ff4400", "#222222"]
  );

  const gridWidth = 52 * SPACING;
  const gridDepth = 7 * SPACING;
  const x = targetX * SPACING - gridWidth / 2;
  const z = targetZ * SPACING - gridDepth / 2;
  
  // Shockwave expansion
  const shockwaveScale = interpolate(
    elapsed,
    [0, 15],
    [0, 15],
    { easing: Easing.out(Easing.quad), extrapolateRight: "clamp" }
  );
  
  // Shockwave fade out
  const shockwaveOpacity = interpolate(
    elapsed,
    [0, 3, 15],
    [0, 0.8, 0],
    { extrapolateRight: "clamp" }
  );

  // Dodecahedron looks like a low-poly explosion
  return (
    <group position={[x, 1.5, z]}>
      {/* Expanding Shockwave Ring on the ground */}
      <mesh position={[0, -1.3, 0]} rotation={[Math.PI / 2, 0, 0]} scale={shockwaveScale}>
        <torusGeometry args={[0.5, 0.05, 16, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={shockwaveOpacity} />
      </mesh>
      
      <mesh scale={scale}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity} 
          emissive={color} 
          emissiveIntensity={interpolate(elapsed, [0, 15], [2, 0], { extrapolateRight: "clamp" })} 
        />
      </mesh>
      
      {/* Secondary smaller explosion for volume */}
      <mesh scale={scale * 0.7} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={opacity * 0.8} 
          emissive="#ffffff"
          emissiveIntensity={interpolate(elapsed, [0, 10], [1, 0], { extrapolateRight: "clamp" })} 
        />
      </mesh>
    </group>
  );
};
