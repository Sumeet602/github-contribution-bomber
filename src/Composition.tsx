import { AbsoluteFill } from "remotion";
import { Scene } from "./Scene";
import { MyCompositionProps } from "./Root";

export const MyComposition: React.FC<MyCompositionProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d1117" }}>
      <Scene {...props} />
    </AbsoluteFill>
  );
};
