import "./index.css";
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition } from "./Composition";

export interface BombTarget {
  x: number;
  z: number;
  frame: number;
}

export type MyCompositionProps = {
  levels: number[];
  targets: BombTarget[];
  flightPath: { x: number; z: number }[];
  durationInFrames: number;
  username: string;
};

import { Vector3, CatmullRomCurve3 } from "three";
import { SPACING } from "./ContributionGrid";

const EXPLOSION_RADIUS = 2.5; 
const AIRPLANE_SPEED = 0.35; // slower, majestic flight speed

const calculateMetadata: CalculateMetadataFunction<MyCompositionProps> = async ({ props, abortSignal }) => {
  try {
    // Fetch the strict current calendar year (Jan 1 - Dec 31) so it resets every New Year
    const currentYear = new Date().getFullYear();
    const res = await fetch(`https://corsproxy.io/?https://github.com/users/${props.username}/contributions?from=${currentYear}-01-01&to=${currentYear}-12-31&v=${Date.now()}`, {
      signal: abortSignal,
    });
    const html = await res.text();
    
    const levels: number[] = [];
    const regex = /data-level="(\d+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      levels.push(parseInt(match[1], 10));
    }
    
    const COLS = 52;
    const ROWS = 7;

    while (levels.length < COLS * ROWS) {
      levels.push(0);
    }
    const finalLevels = levels.slice(-COLS * ROWS);

    let greenBlocks = [];
    for (let i = 0; i < finalLevels.length; i++) {
      if (finalLevels[i] > 0) {
        const c = Math.floor(i / ROWS);
        const r = i % ROWS;
        if (c < COLS) {
          greenBlocks.push({ x: c, z: r });
        }
      }
    }
    
    // Shuffle blocks completely for a random bombing path
    greenBlocks.sort(() => Math.random() - 0.5);

    const chosenTargets = [];
    while (greenBlocks.length > 0) {
      const target = greenBlocks[0];
      chosenTargets.push(target);
      
      greenBlocks = greenBlocks.filter(block => {
        const dx = block.x - target.x;
        const dz = block.z - target.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        return dist > EXPLOSION_RADIUS;
      });
    }

    const flightPath = [];
    if (chosenTargets.length > 0) {
      // Large sweeping entry point to give the plane room to turn into the grid
      flightPath.push({ x: 26, z: -25 }); 
      
      for (const t of chosenTargets) flightPath.push({ x: t.x, z: t.z });
      
      // Large sweeping exit arc to smoothly loop back to the front
      flightPath.push({ x: 52, z: 15 });
      flightPath.push({ x: 26, z: 25 });
      flightPath.push({ x: 0, z: 15 });
    }

    // Calculate curve physics to find exact target frames
    const gridWidth = 52 * SPACING;
    const gridDepth = 7 * SPACING;
    const curvePoints = flightPath.map(p => 
      new Vector3(p.x * SPACING - gridWidth/2, 8, p.z * SPACING - gridDepth/2)
    );
    const curve = new CatmullRomCurve3(curvePoints, true, "centripetal", 0.5);
    curve.arcLengthDivisions = 3000; // Extremely high resolution to prevent jitter in physics
    const totalLength = curve.getLength();
    const durationInFrames = Math.max(300, Math.ceil(totalLength / AIRPLANE_SPEED));

    const targets: BombTarget[] = chosenTargets.map((t) => {
      const targetVec = new Vector3(t.x * SPACING - gridWidth/2, 8, t.z * SPACING - gridDepth/2);
      let minDistance = Infinity;
      let bestU = 0;
      // High resolution scan to find exact drop frame
      const RESOLUTION = 2000;
      for (let i = 0; i <= RESOLUTION; i++) {
        const u = i / RESOLUTION;
        const p = curve.getPointAt(u);
        const dist = p.distanceTo(targetVec);
        if (dist < minDistance) {
          minDistance = dist;
          bestU = u;
        }
      }
      return { x: t.x, z: t.z, frame: Math.round(bestU * durationInFrames) };
    });

    return {
      durationInFrames,
      props: {
        ...props,
        levels: finalLevels,
        targets,
        flightPath,
        durationInFrames,
        username: props.username,
      },
      width: 1200,
      height: 600,
    };
  } catch (err) {
    console.error("Failed to fetch GitHub contributions", err);
    return {
      durationInFrames: 300,
      props: {
        ...props,
        levels: Array(52 * 7).fill(0),
        targets: [{ x: 25, z: 3, frame: 75 }],
        flightPath: [{x:0, z:0}, {x:25, z:3}, {x:52, z:7}, {x:26, z:14}],
        durationInFrames: 300,
        username: props.username,
      },
      width: 1200,
      height: 600,
    };
  }
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        fps={30}
        defaultProps={{
          levels: [],
          targets: [],
          flightPath: [],
          durationInFrames: 300,
          username: "dhruv-mavani",
        }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
