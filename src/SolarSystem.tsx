import React from "react";
import { useCurrentFrame, staticFile } from "remotion";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

export const SolarSystem: React.FC = () => {
  const frame = useCurrentFrame();

  const [
    sunMap,
    earthMap,
    marsMap,
    jupiterMap,
    saturnMap,
    saturnRingsMap,
    moonMap
  ] = useLoader(TextureLoader, [
    staticFile("textures/8k_sun.jpg"),
    staticFile("textures/2k_earth.jpg"),
    staticFile("textures/2k_mars.jpg"),
    staticFile("textures/2k_jupiter.jpg"),
    staticFile("textures/2k_saturn.jpg"),
    staticFile("textures/2k_saturn_rings.png"),
    staticFile("textures/moon_1024.jpg")
  ]);

  return (
    <group>
      {/* Sun - huge, glowing, far away */}
      <mesh position={[-120, 60, -180]} scale={30}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={sunMap} emissiveMap={sunMap} emissive="#ffffff" emissiveIntensity={1.5} roughness={1} />
      </mesh>

      {/* Earth & Moon */}
      <group position={[90, 25, -120]}>
        {/* Earth */}
        <mesh scale={6} rotation={[0, frame * 0.01, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial map={earthMap} roughness={0.7} metalness={0.1} />
        </mesh>
        
        {/* Orbiting Moon */}
        <group rotation={[0, frame * 0.05, 0]}>
          <mesh position={[10, 0, 0]} scale={1.5} rotation={[0, frame * 0.02, 0]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial map={moonMap} roughness={1} />
          </mesh>
        </group>
      </group>

      {/* Mars - small, red */}
      <mesh position={[130, -20, -50]} scale={3.5} rotation={[0, frame * 0.008, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={marsMap} roughness={0.9} />
      </mesh>

      {/* Jupiter - huge, gas giant */}
      <mesh position={[-160, 40, 100]} scale={14} rotation={[0, frame * 0.005, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={jupiterMap} roughness={0.7} />
      </mesh>

      {/* Saturn - with iconic rings */}
      <group position={[60, 70, 160]} rotation={[Math.PI / 7, frame * 0.002, 0]}>
        <mesh scale={9}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial map={saturnMap} roughness={0.6} />
        </mesh>
        {/* Rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.1]}>
          <torusGeometry args={[16, 3, 2, 64]} />
          <meshStandardMaterial map={saturnRingsMap} transparent opacity={0.9} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
