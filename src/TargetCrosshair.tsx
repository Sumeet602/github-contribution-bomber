import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SPACING } from "./ContributionGrid";

interface TargetCrosshairProps {
  targetX: number;
  targetZ: number;
  targetFrame: number;
}

export const TargetCrosshair: React.FC<TargetCrosshairProps> = ({ targetX, targetZ, targetFrame }) => {
  const frame = useCurrentFrame();
  
  // Crosshair appears 45 frames before impact, and disappears exactly on impact
  const startFrame = targetFrame - 45;
  if (frame < startFrame || frame >= targetFrame) return null;
  
  const progress = (frame - startFrame) / 45;
  
  // Holographic pulsing opacity
  const pulse = Math.sin(progress * Math.PI * 6) * 0.3 + 0.7; // Pulses between 0.4 and 1.0
  const opacity = interpolate(progress, [0, 0.2, 0.9, 1], [0, pulse, pulse, 0]);
  
  // Locking-in animation (starts large and scales down to target)
  const scale = interpolate(progress, [0, 0.5], [3, 1], { easing: Easing.out(Easing.back()), extrapolateRight: "clamp" });
  
  // Spin the crosshair slowly
  const rotationY = progress * Math.PI;

  const gridWidth = 52 * SPACING;
  const gridDepth = 7 * SPACING;
  const x = targetX * SPACING - gridWidth / 2;
  const z = targetZ * SPACING - gridDepth / 2;

  return (
    <group position={[x, 0.21, z]} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Outer Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.05, 16, 32]} />
        <meshBasicMaterial color="#FF2222" transparent opacity={opacity} />
      </mesh>
      
      {/* Cross lines */}
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[0.08, 0.02, 0.4]} />
        <meshBasicMaterial color="#FF2222" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, -0.5]}>
        <boxGeometry args={[0.08, 0.02, 0.4]} />
        <meshBasicMaterial color="#FF2222" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[0.4, 0.02, 0.08]} />
        <meshBasicMaterial color="#FF2222" transparent opacity={opacity} />
      </mesh>
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.4, 0.02, 0.08]} />
        <meshBasicMaterial color="#FF2222" transparent opacity={opacity} />
      </mesh>
    </group>
  );
};
