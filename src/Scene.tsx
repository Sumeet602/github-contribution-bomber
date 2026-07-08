import React from "react";
import { useVideoConfig, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { ContributionGrid } from "./ContributionGrid";
import { Airplane, getAirplanePosition } from "./Airplane";
import { Missile } from "./Missile";
import { FireExplosion } from "./FireExplosion";
import { TargetCrosshair } from "./TargetCrosshair";
import { Stars } from "./Stars";
import { SolarSystem } from "./SolarSystem";
import { MyCompositionProps, BombTarget } from "./Root";

const POVCamera: React.FC<{ flightPath: { x: number; z: number }[], durationInFrames: number, targets: BombTarget[] }> = ({ flightPath, durationInFrames, targets }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  
  const currentPos = getAirplanePosition(frame, flightPath, durationInFrames);
  // Look ahead to anticipate turns smoothly (matching the airplane's lookahead)
  const nextPos = getAirplanePosition(frame + 25, flightPath, durationInFrames);
  const direction = nextPos.clone().sub(currentPos).normalize();
  
  // Calculate dynamic camera shake on impact!
  let shakeX = 0;
  let shakeY = 0;
  let shakeZ = 0;
  for (const t of targets) {
    // Check if we are within 15 frames of this target's impact (explosion)
    // The explosion starts exactly at t.frame (which is when the missile hits the ground)
    const timeSinceImpact = frame - t.frame;
    if (timeSinceImpact >= 0 && timeSinceImpact < 15) {
      const intensity = (1 - timeSinceImpact / 15) * 1.5; // Starts at 1.5 intensity, fades to 0
      shakeX += (Math.random() - 0.5) * intensity;
      shakeY += (Math.random() - 0.5) * intensity;
      shakeZ += (Math.random() - 0.5) * intensity;
    }
  }

  // Place camera behind and slightly above the plane (Chase Cam), adding shake
  const cameraPos = currentPos.clone().sub(direction.clone().multiplyScalar(15)).add(new Vector3(shakeX, 10 + shakeY, shakeZ));
  camera.position.copy(cameraPos);
  
  // Look down at the grid slightly ahead of the plane
  const lookTarget = currentPos.clone().add(direction.clone().multiplyScalar(30)).sub(new Vector3(0, 8, 0));
  camera.lookAt(lookTarget);
  
  return null;
};

export const Scene: React.FC<MyCompositionProps> = ({ levels, targets, flightPath, durationInFrames }) => {
  const { width, height } = useVideoConfig();

  return (
    <ThreeCanvas 
      width={width} 
      height={height} 
    >
      <color attach="background" args={["#030508"]} />
      <React.Suspense fallback={null}>
        <POVCamera flightPath={flightPath} durationInFrames={durationInFrames} targets={targets} />
        <Stars />
        <SolarSystem />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 20, 10]} intensity={2.5} castShadow />
        
        <group>
          <ContributionGrid levels={levels} targets={targets} durationInFrames={durationInFrames} />
          <Airplane flightPath={flightPath} durationInFrames={durationInFrames} />
          
          {targets.map((t, i) => (
            <React.Fragment key={i}>
              <TargetCrosshair targetX={t.x} targetZ={t.z} targetFrame={t.frame} />
              <Missile targetX={t.x} targetZ={t.z} targetFrame={t.frame} flightPath={flightPath} durationInFrames={durationInFrames} />
              <FireExplosion targetX={t.x} targetZ={t.z} targetFrame={t.frame} />
            </React.Fragment>
          ))}
        </group>
      </React.Suspense>
    </ThreeCanvas>
  );
};
