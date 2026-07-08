import React, { useMemo } from "react";

export const Mountains: React.FC = () => {
  const mountainData = useMemo(() => {
    const m = [];
    const radius = 120;
    const numMountains = 30;
    for (let i = 0; i < numMountains; i++) {
      const angle = (i / numMountains) * Math.PI * 2 + Math.random() * 0.2;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 10;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 10;
      const height = Math.random() * 25 + 15;
      const radiusBase = Math.random() * 15 + 15;
      m.push({ x, z, height, radiusBase, rotation: Math.random() * Math.PI });
    }
    return m;
  }, []);

  return (
    <group>
      {mountainData.map((m, i) => (
        <mesh key={i} position={[m.x, m.height / 2 - 1.5, m.z]} rotation={[0, m.rotation, 0]}>
          <coneGeometry args={[m.radiusBase, m.height, 4]} />
          <meshStandardMaterial color="#4a6478" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
