import { useCurrentFrame, interpolate, Easing } from "remotion";

const EXPLOSION_START_FRAME = 80;

export const Bomber: React.FC = () => {
  const frame = useCurrentFrame();

  // If the bomb has already hit and exploded, don't show it anymore
  if (frame > EXPLOSION_START_FRAME) {
    return null;
  }

  // Calculate Y position - starts high, falls down to 0
  const y = interpolate(
    frame,
    [0, EXPLOSION_START_FRAME],
    [50, 0],
    {
      easing: Easing.in(Easing.quad), // Accelerate downwards
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <mesh position={[0, y, 0]}>
      {/* Pointy tip for a missile-like shape */}
      <coneGeometry args={[1, 4, 16]} />
      <meshStandardMaterial color="#ff3333" />
      {/* Adding a subtle glow could be done here, or just sticking to material properties */}
    </mesh>
  );
};
