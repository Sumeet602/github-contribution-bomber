import { useCurrentFrame } from "remotion";
import { Vector3, CatmullRomCurve3, Shape } from "three";
import { SPACING } from "./ContributionGrid";

export const AIRPLANE_Y = 8;

interface AirplaneProps {
  flightPath: { x: number; z: number }[];
  durationInFrames: number;
}

let cachedPathLength = -1;
let curve: CatmullRomCurve3 | null = null;

// Return purely the spline position, without bobbing, for stable rotation math
export const getAirplanePosition = (frame: number, flightPath: { x: number; z: number }[], durationInFrames: number): Vector3 => {
  if (!flightPath || flightPath.length < 2) {
    return new Vector3(0, AIRPLANE_Y, 0);
  }

  if (flightPath.length !== cachedPathLength) {
    const gridWidth = 52 * SPACING;
    const gridDepth = 7 * SPACING;

    const points = flightPath.map((p) => {
      const x = p.x * SPACING - gridWidth / 2;
      const z = p.z * SPACING - gridDepth / 2;
      return new Vector3(x, AIRPLANE_Y, z);
    });

    curve = new CatmullRomCurve3(points, true, "centripetal", 0.5);
    curve.arcLengthDivisions = 3000;
    cachedPathLength = flightPath.length;
  }

  // Smoothly wrap around and use getPointAt for constant velocity (proper physics)
  const t = ((frame % durationInFrames) + durationInFrames) % durationInFrames / durationInFrames;
  return curve!.getPointAt(t);
};

// Create the futuristic stealth bomber shape
const bomberShape = new Shape();
bomberShape.moveTo(0, 4);      // Nose
bomberShape.lineTo(2.5, -2);   // Right wing tip
bomberShape.lineTo(1, -2);     // Right inner
bomberShape.lineTo(1, -3);     // Right tail
bomberShape.lineTo(-1, -3);    // Left tail
bomberShape.lineTo(-1, -2);    // Left inner
bomberShape.lineTo(-2.5, -2);  // Left wing tip
bomberShape.lineTo(0, 4);      // Back to Nose

const extrudeSettings = {
  depth: 0.3,
  bevelEnabled: true,
  bevelSegments: 3,
  steps: 1,
  bevelSize: 0.05,
  bevelThickness: 0.05
};

export const Airplane: React.FC<AirplaneProps> = ({ flightPath, durationInFrames }) => {
  const frame = useCurrentFrame();
  
  // Use pure spline points for ultra-stable orientation math
  const currentPos = getAirplanePosition(frame, flightPath, durationInFrames);
  // Look 25 frames ahead for extremely smooth direction (cinematically cuts corners on tight U-turns)
  const nextPos = getAirplanePosition(frame + 25, flightPath, durationInFrames);
  const direction = nextPos.clone().sub(currentPos).normalize();
  
  const rotationY = Math.atan2(direction.x, direction.z);
  
  // Look 50 frames ahead to calculate change in yaw smoothly over a long period
  const nextNextPos = getAirplanePosition(frame + 50, flightPath, durationInFrames);
  const nextDirection = nextNextPos.clone().sub(nextPos).normalize();
  const nextRotationY = Math.atan2(nextDirection.x, nextDirection.z);
  
  let yawDiff = nextRotationY - rotationY;
  if (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
  if (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
  
  // Bank based on turn rate, clamp heavily so random tight loops don't cause wild 360-degree spins
  const maxBank = Math.PI / 2.5;
  const bankZ = Math.max(-maxBank, Math.min(maxBank, yawDiff * -8)); 
  const pitchX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, direction.y * -2)); 

  // Add the bobbing back visually to the final position, without affecting direction calculations
  const bobbingCycles = Math.round(durationInFrames / 30);
  const bobbing = Math.sin((frame / durationInFrames) * Math.PI * 2 * bobbingCycles) * 0.5;
  const finalPos = new Vector3(currentPos.x, currentPos.y + bobbing, currentPos.z);
  
  // Dynamic Thruster flicker effect - smoothed out to avoid strobing
  const thrusterScale = 1 + Math.sin(frame * 0.5) * 0.2 + Math.sin(frame * 0.8) * 0.1;
  const thrusterOpacity = 0.6 + Math.sin(frame * 0.3) * 0.3;

  return (
    <group position={finalPos} rotation={[pitchX, rotationY, bankZ]} scale={0.5}>
      {/* Main Fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <extrudeGeometry args={[bomberShape, extrudeSettings]} />
        <meshPhysicalMaterial 
          color="#FF2222" 
          metalness={0.8} 
          roughness={0.3} 
          clearcoat={0.8} 
          clearcoatRoughness={0.2} 
        />
      </mesh>
      
      {/* Cockpit Glass */}
      <mesh position={[0, 0.4, 1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.3, 1.2]} />
        <meshPhysicalMaterial 
          color="#000000" 
          metalness={0.9} 
          roughness={0} 
          transmission={0.9} 
          thickness={0.5} 
        />
      </mesh>
      
      {/* Dynamic Jet Exhaust / Contrails */}
      <mesh position={[0.6, 0.15, -4.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, thrusterScale, 1]}>
        <cylinderGeometry args={[0.01, 0.2, 2, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} transparent opacity={thrusterOpacity} />
      </mesh>
      <mesh position={[-0.6, 0.15, -4.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, thrusterScale, 1]}>
        <cylinderGeometry args={[0.01, 0.2, 2, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} transparent opacity={thrusterOpacity} />
      </mesh>
    </group>
  );
};

