import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";

export const Stars: React.FC = () => {
  const frame = useCurrentFrame();

  // Use a highly optimized BufferGeometry to render thousands of stars without lag
  const positions = useMemo(() => {
    const count = 5000;
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create a massive hollow sphere of stars around the scene
      const radius = 200 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  // Very slow, majestic rotation of the galaxy
  const rotationY = frame * 0.0002;
  const rotationZ = frame * 0.0001;

  return (
    <points rotation={[0, rotationY, rotationZ]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={1.2} sizeAttenuation={true} transparent opacity={0.8} />
    </points>
  );
};
