import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";

export const Clouds: React.FC = () => {
  const frame = useCurrentFrame();

  // Generate static random clouds scattered across a massive area
  const cloudData = useMemo(() => {
    const clouds = [];
    for (let i = 0; i < 60; i++) {
      // Spread clouds over a huge 200x200 area, mostly high up
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      const y = Math.random() * 30 + 15; // Altitudes between 15 and 45
      const scale = Math.random() * 4 + 2; // Size between 2 and 6
      const rotation = Math.random() * Math.PI * 2;
      
      // Each cloud is a cluster of 3-5 spheres
      const puffCount = Math.floor(Math.random() * 3) + 3;
      const puffs = [];
      for (let j = 0; j < puffCount; j++) {
        puffs.push({
          px: (Math.random() - 0.5) * 2,
          py: (Math.random() - 0.5) * 1.5,
          pz: (Math.random() - 0.5) * 2,
          pscale: Math.random() * 0.5 + 0.5,
        });
      }
      
      clouds.push({ x, y, z, scale, rotation, puffs });
    }
    return clouds;
  }, []);

  // Parallax: slightly move the clouds horizontally to make the world feel alive
  const driftOffset = frame * 0.02;

  return (
    <group>
      {/* Sun */}
      <mesh position={[60, 45, -90]} scale={15}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ffdd44" emissive="#ffaa00" emissiveIntensity={1.5} roughness={0} />
      </mesh>

      {/* Drifting Clouds */}
      <group position={[driftOffset, 0, driftOffset * 0.5]}>
        {cloudData.map((cloud, i) => (
          <group key={i} position={[cloud.x, cloud.y, cloud.z]} rotation={[0, cloud.rotation, 0]} scale={cloud.scale}>
            {cloud.puffs.map((puff, j) => (
              <mesh key={j} position={[puff.px, puff.py, puff.pz]} scale={puff.pscale}>
                {/* Low poly look for aesthetic */}
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#d4f1f9" emissive="#add8e6" emissiveIntensity={0.3} transparent opacity={0.7} roughness={0.6} />
              </mesh>
          ))}
          </group>
        ))}
      </group>
    </group>
  );
};
