import React, { useEffect } from "react";
import { useRef } from "react";
import { Node, Point } from "../lib/Node";
import CanvasContext from "../lib/CanvasContext";

type CanvasProps = {
  containerClassName?: string;
  className?: string;
  file: File | null;
  tabIndex?: number;
  onChanged?: (nodes: Node[]) => void;
  config?: {
    arrowLength: number;
    arrowWidth: number;
    nodeColor: string;
    nodeRadius: number;
    selectedNodeColor: string;
    selectedNodeRadius: number;
    lineColor: string;
    lineWidth: number;
    hoverNodeColor: string;
    hoverNodeRadius: number;
  };
};

type DraggingState = {
  isDragging: boolean;
  node: Node | undefined;
  start: Point;
  end: Point;
};

const noDragging: DraggingState = {
  isDragging: false,
  node: undefined,
  start: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
};

type CanvasState = {
  nodes: Node[];
  selectedNodes: Node[];
  dragging: DraggingState;
};

const Canvas: React.FC<CanvasProps> = ({
  containerClassName,
  className,
  file,
  tabIndex = 0,
  config = {
    arrowLength: 15,
    arrowWidth: 7,
    nodeColor: "red",
    nodeRadius: 5,
    selectedNodeColor: "white",
    selectedNodeRadius: 7,
    lineColor: "red",
    lineWidth: 2,
    hoverNodeColor: "yellow",
    hoverNodeRadius: 7,
  },
  onChanged,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContext = React.useRef<CanvasRenderingContext2D | null>(null);

  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [pointer, setPointer] = React.useState<Point | null>(null);
  const [state, setState] = React.useState<CanvasState>({
    nodes: [],
    selectedNodes: [],
    dragging: noDragging,
  });

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) {
      return;
    }

    if (!image) {
      return;
    }

    const context = new CanvasContext(canvasContext.current!);

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw image
    canvas.width = image.width;
    canvas.height = image.height;

    let scale = Math.min(
      canvas.width / image.width,
      canvas.height / image.height
    );

    context
      .rect(0, 0, image.width * scale, image.height * scale)
      .drawImage(image, 0, 0, image.width * scale, image.height * scale)
      .setFillStyle(config.nodeColor)
      .dot(0, 0, config.nodeRadius);

    if (!state.nodes.length) {
      return;
    }

    const effectiveNodes = state.dragging.isDragging
      ? [
          ...state.nodes.filter((node) => node !== state.dragging.node!),
          {
            ...state.dragging.node!,
            x: state.dragging.end.x,
            y: state.dragging.end.y,
          },
        ]
      : state.nodes;

    effectiveNodes.sort((a, b) => a.order - b.order);

    context
      .setStrokeStyle(config.lineWidth, config.lineColor)
      .polygon(effectiveNodes);

    const c = canvasContext.current!;
    // draw a filled arrow from the first node to the second node
    // arror should be drawn on a half way of the line

    if (effectiveNodes.length > 1) {
      const { x: x1, y: y1 } = effectiveNodes[0];
      const { x: x2, y: y2 } = effectiveNodes[1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);
      const length =
        Math.sqrt(dx * dx + dy * dy) / 2 +
        config.arrowLength -
        config.nodeRadius;

      c.save();
      try {
        c.translate(x1, y1);
        c.rotate(angle);
        c.beginPath();
        c.moveTo(length, 0);
        c.lineTo(length - config.arrowLength, config.arrowWidth);
        c.lineTo(length - config.arrowLength, -config.arrowWidth);
        c.closePath();
        c.fill();
      } finally {
        c.restore();
      }
    }

    let hovered = false;
    state.nodes.forEach((node) => {
      const { x, y } =
        state.dragging.isDragging && hitTestNode(state.dragging.start, node)
          ? state.dragging.end
          : node;

      if (!state.selectedNodes.includes(node)) {
        context.setFillStyle(config.nodeColor).dot(x, y, 5);
      }

      if (pointer) {
        if (!hovered && hitTestNode(pointer, node)) {
          hovered = true;
          context
            .setStrokeStyle(
              Math.max(2, config.hoverNodeRadius - config.nodeRadius),
              config.hoverNodeColor
            )
            .circle(x, y, config.hoverNodeRadius);

          if (!state.selectedNodes.includes(node)) {
            context.text(x, y, `x: ${x}\ny: ${y}`);
          }
        }
      }

      if (state.selectedNodes.includes(node)) {
        const { x, y } =
          state.dragging.isDragging && hitTestNode(state.dragging.start, node)
            ? state.dragging.end
            : node;

        context
          .setFillStyle(config.nodeColor)
          .dot(x, y, 5)
          .setStrokeStyle(
            1,
            pointer && hitTestNode(pointer, node)
              ? config.hoverNodeColor
              : config.selectedNodeColor
          )
          .circle(x, y, config.selectedNodeRadius)
          .text(x, y, `x: ${x}\ny: ${y}`);
      }
    });
  }, [image, pointer, state, config]);

  useEffect(() => {
    const sortedNodes = [...state.nodes].sort((a, b) => a.order - b.order);
    onChanged?.(sortedNodes);
  }, [state.nodes, onChanged]);

  useEffect(() => {
    console.log("file changed, cleanup");
    setImage(null);
    setState({
      nodes: [],
      selectedNodes: [],
      dragging: noDragging,
    });
  }, [file]);

  const hitTestNode = (
    pointer: { x: number; y: number },
    node: Node,
    diff = 3
  ): boolean => {
    const { x: cx, y: cy } = node;
    return (
      pointer.x >= cx - diff &&
      pointer.x <= cx + diff &&
      pointer.y >= cy - diff &&
      pointer.y <= cy + diff
    );
  };

  useEffect(() => {
    const onMouseDownHandler = (e: any) => {
      const canvas = canvasRef?.current;

      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();

      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      // console.log("onMouseDownHandler", x, y);

      setState((oldState) => {
        const found = oldState.nodes.find((node) =>
          hitTestNode({ x, y }, node)
        );
        if (found) {
          return {
            ...oldState,
            dragging: {
              isDragging: false,
              node: found,
              start: { x, y },
              end: { x, y },
            },
          };
        }

        return oldState;
      });
    };

    const onMouseUpHandler = (e: any) => {
      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();

      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      setState((oldState) => {
        if (!e.shiftKey && !e.ctrlKey) {
          if (!oldState.dragging.isDragging && oldState.dragging.node) {
            return {
              ...oldState,
              dragging: noDragging,
              selectedNodes: [oldState.dragging.node],
            };
          }

          return {
            ...oldState,
            dragging: noDragging,
            selectedNodes:
              oldState.dragging.isDragging && oldState.dragging.node
                ? [oldState.dragging.node]
                : [],
            nodes:
              oldState.dragging.isDragging && oldState.dragging.node
                ? [
                    ...oldState.nodes.filter(
                      (node) => node !== oldState.dragging.node
                    ),
                    {
                      ...oldState.dragging.node!,
                      x: oldState.dragging.end.x,
                      y: oldState.dragging.end.y,
                    },
                  ]
                : [
                    ...oldState.nodes,
                    { x, y, order: oldState.nodes.length + 1 },
                  ],
          };
        }

        const found = oldState.nodes.find((node) =>
          hitTestNode({ x, y }, node)
        );
        if (found) {
          return {
            ...oldState,
            dragging: noDragging,
            selectedNodes: [...oldState.selectedNodes, found],
          };
        }

        return oldState;
      });
    };

    const onMouseMoveHandler = (e: any) => {
      const canvas = canvasRef?.current;

      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();

      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      setPointer({ x, y });

      setState((oldState) => {
        if (!oldState.dragging.node) {
          return oldState;
        }

        return {
          ...oldState,
          dragging: {
            ...oldState.dragging,
            isDragging: true,
            end: { x, y },
          },
        };
      });
    };

    const onKeyDownHandler = (e: any) => {
      if (e.key === "Escape" || e.key === "Esc") {
        setState((oldState) => {
          return {
            ...oldState,
            dragging: noDragging,
            selectedNodes: [],
          };
        });
      }

      if (e.key === "Delete") {
        // console.log("delete");
        setState((oldState) => {
          return {
            ...oldState,
            nodes: oldState.nodes.filter(
              (node) => !oldState.selectedNodes.includes(node)
            ),
            selectedNodes: [],
          };
        });
      }

      if (e.key === "a" && e.ctrlKey) {
        // console.log("select all");
        e.preventDefault();
        setState((oldState) => {
          return {
            ...oldState,
            selectedNodes: oldState.nodes,
          };
        });
      }
    };

    const canvas = canvasRef?.current;

    if (canvas) {
      canvasContext.current = canvas.getContext("2d");
      const context = canvasContext.current!;
      context.clearRect(0, 0, canvas.width, canvas.height);

      // canvas.addEventListener("click", onClickHandler);
      canvas.addEventListener("mousedown", onMouseDownHandler);
      canvas.addEventListener("mouseup", onMouseUpHandler);
      canvas.addEventListener("mousemove", onMouseMoveHandler);
      canvas.addEventListener("keydown", onKeyDownHandler);

      file?.arrayBuffer().then((buffer) => {
        const blob = new Blob([buffer]);
        const img = new Image();
        img.src = URL.createObjectURL(blob);

        img.onload = () => {
          setImage(img);
        };
      });

      return () => {
        // canvas.removeEventListener("click", onClickHandler);
        canvas.removeEventListener("mousedown", onMouseDownHandler);
        canvas.removeEventListener("mouseup", onMouseUpHandler);
        canvas.removeEventListener("mousemove", onMouseMoveHandler);
        canvas.removeEventListener("keydown", onKeyDownHandler);
      };
    }
  }, [file, canvasRef]);

  return (
    <div className={containerClassName}>
      <canvas
        tabIndex={tabIndex}
        ref={canvasRef}
        className={className}
        style={{}}
      ></canvas>
    </div>
  );
};

export default Canvas;
