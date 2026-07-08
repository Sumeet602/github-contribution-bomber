import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";

export const Birds: React.FC = () => {
  const frame = useCurrentFrame();

  const flockData = useMemo(() => {
    const f = [];
    for (let i = 0; i < 4; i++) {
      // Starting positions spread out
      const startX = (Math.random() - 0.5) * 150;
      const startZ = (Math.random() - 0.5) * 150;
      const altitude = Math.random() * 10 + 5; // Low altitude
      
      // Speed and direction
      const speed = Math.random() * 0.05 + 0.05;
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vz = Math.sin(angle) * speed;

      // Generate a V formation of birds
      const birds = [];
      const numBirds = Math.floor(Math.random() * 4) + 3; // 3 to 6 birds
      for (let j = 0; j < numBirds; j++) {
        if (j === 0) {
          birds.push({ offsetX: 0, offsetZ: 0 }); // Lead bird
        } else {
          const side = j % 2 === 0 ? 1 : -1;
          const rank = Math.ceil(j / 2);
          birds.push({ 
            offsetX: -rank * 1.5, // back
            offsetZ: side * rank * 1.5 // left/right
          });
        }
      }

      f.push({ startX, startZ, altitude, angle, vx, vz, birds });
    }
    return f;
  }, []);

  return (
    <group>
      {flockData.map((flock, i) => {
        // Animate position along vector
        const cx = flock.startX + flock.vx * frame;
        const cz = flock.startZ + flock.vz * frame;

        // Bobbing up and down gently
        const cy = flock.altitude + Math.sin(frame * 0.1 + i) * 1.5;

        return (
          <group key={i} position={[cx, cy, cz]} rotation={[0, -flock.angle, 0]}>
            {flock.birds.map((bird, j) => (
              <group key={j} position={[bird.offsetX, 0, bird.offsetZ]}>
                {/* Flapping wings animation */}
                <group rotation={[Math.sin(frame * 0.5 + i + j) * 0.5, 0, 0]}>
                  <mesh position={[0.2, 0, 0.2]} rotation={[0, Math.PI / 4, 0]}>
                    <boxGeometry args={[0.5, 0.05, 0.1]} />
                    <meshBasicMaterial color="#111111" />
                  </mesh>
                </group>
                <group rotation={[-Math.sin(frame * 0.5 + i + j) * 0.5, 0, 0]}>
                  <mesh position={[0.2, 0, -0.2]} rotation={[0, -Math.PI / 4, 0]}>
                    <boxGeometry args={[0.5, 0.05, 0.1]} />
                    <meshBasicMaterial color="#111111" />
                  </mesh>
                </group>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};
