import { useCallback, useEffect, useRef } from "react";

interface ResizeHandleProps {
  readonly direction: "horizontal" | "vertical";
  readonly onResize: (delta: number) => void;
}

export function ResizeHandle({ direction, onResize }: ResizeHandleProps) {
  const isDragging = useRef(false);
  const lastPosition = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      const currentPosition =
        direction === "horizontal" ? e.clientX : e.clientY;
      const delta = currentPosition - lastPosition.current;
      lastPosition.current = currentPosition;

      onResize(delta);
    },
    [direction, onResize],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPosition.current =
      direction === "horizontal" ? e.clientX : e.clientY;
    document.body.style.cursor =
      direction === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };

  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={`${
        isHorizontal
          ? "w-1 cursor-col-resize hover:bg-accent/50"
          : "h-1 cursor-row-resize hover:bg-accent/50"
      } bg-border flex-shrink-0 transition-colors`}
      onMouseDown={handleMouseDown}
    />
  );
}
