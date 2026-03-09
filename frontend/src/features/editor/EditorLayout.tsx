import { useCallback, useState } from "react";
import { TopBar } from "./TopBar";
import { LeftPanel } from "./LeftPanel";
import { Canvas } from "./Canvas";
import { RightPanel } from "./RightPanel";
import { BottomPanel } from "./BottomPanel";
import { ResizeHandle } from "./ResizeHandle";

const DEFAULT_LEFT_WIDTH = 256;
const DEFAULT_RIGHT_WIDTH = 288;
const DEFAULT_BOTTOM_HEIGHT = 256;

const MIN_LEFT_WIDTH = 180;
const MAX_LEFT_WIDTH = 400;
const MIN_RIGHT_WIDTH = 200;
const MAX_RIGHT_WIDTH = 480;
const MIN_BOTTOM_HEIGHT = 120;
const MAX_BOTTOM_HEIGHT = 500;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function EditorLayout() {
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT_WIDTH);
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT_WIDTH);
  const [bottomHeight, setBottomHeight] = useState(DEFAULT_BOTTOM_HEIGHT);

  const handleLeftResize = useCallback((delta: number) => {
    setLeftWidth((w) => clamp(w + delta, MIN_LEFT_WIDTH, MAX_LEFT_WIDTH));
  }, []);

  const handleRightResize = useCallback((delta: number) => {
    setRightWidth((w) => clamp(w - delta, MIN_RIGHT_WIDTH, MAX_RIGHT_WIDTH));
  }, []);

  const handleBottomResize = useCallback((delta: number) => {
    setBottomHeight((h) =>
      clamp(h + delta, MIN_BOTTOM_HEIGHT, MAX_BOTTOM_HEIGHT),
    );
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg text-text-primary font-sans overflow-hidden">
      <TopBar />

      <div className="flex flex-1 min-h-0">
        <div style={{ width: leftWidth }} className="flex-shrink-0">
          <LeftPanel />
        </div>

        <ResizeHandle direction="horizontal" onResize={handleLeftResize} />

        <Canvas />

        <ResizeHandle direction="horizontal" onResize={handleRightResize} />

        <div style={{ width: rightWidth }} className="flex-shrink-0">
          <RightPanel />
        </div>
      </div>

      <BottomPanel height={bottomHeight} onResize={handleBottomResize} />
    </div>
  );
}
