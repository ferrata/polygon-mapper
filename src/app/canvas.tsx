import React, { useEffect } from "react";
import { useRef } from "react";
import { Node, Point } from "./node";
import "@/types/CanvasRenderingContext2D";

type CanvasProps = {
  containerClassName?: string;
  className?: string;
  file: File | null;
  tabIndex?: number;
  onClick?: (x: number, y: number) => number; // returns order
  config?: {
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
    nodeColor: "red",
    nodeRadius: 5,
    selectedNodeColor: "white",
    selectedNodeRadius: 7,
    lineColor: "red",
    lineWidth: 2,
    hoverNodeColor: "yellow",
    hoverNodeRadius: 7,
  },
  // onClick,
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
    const context = canvasContext.current!;
    if (!canvas) {
      return;
    }

    if (!image) {
      return;
    }

    // console.log("coordinates count", coordinates.length);

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw image
    canvas.width = image.width;
    canvas.height = image.height;

    let scale = Math.min(
      canvas.width / image.width,
      canvas.height / image.height
    );

    // draw an image working area, take inset from the canvas edges from padding
    // size of the working area is the same as the image size
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(image.width * scale, 0);
    context.lineTo(0 + image.width * scale, 0 + image.height * scale);
    context.lineTo(0, image.height * scale);
    context.closePath();
    context.stroke();

    context.drawImage(image, 0, 0, image.width * scale, image.height * scale);

    // draw a red dot at the origin
    context.fillStyle = config.nodeColor;
    context.dot(0, 0, config.nodeRadius);

    if (!state.nodes.length) {
      return;
    }

    state.nodes.forEach((node) => {
      const { x, y } = node;

      if (!state.selectedNodes.includes(node)) {
        context.dot(x, y, 5);
      }

      if (pointer) {
        if (hitTestNode(pointer, node)) {
          context.strokeStyle = config.hoverNodeColor;
          context.lineWidth = Math.max(
            2,
            config.hoverNodeRadius - config.nodeRadius
          );
          context.circle(x, y, config.hoverNodeRadius);

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
        context.strokeStyle =
          pointer && hitTestNode(pointer, node)
            ? config.hoverNodeColor
            : config.selectedNodeColor;
        context.lineWidth = 1;
        context.dot(x, y, 5);
        context.circle(x, y, config.selectedNodeRadius);
        context.text(x, y, `x: ${x}\ny: ${y}`);
      }
    });

    // if (draggingState.isDragging) {
    //   const { end } = draggingState;
    //   context.strokeStyle = config.lineColor;
    //   context.lineWidth = config.lineWidth;
    //   context.beginPath();
    //   context.moveTo(draggingState.start.x, draggingState.start.y);
    //   // context.lineTo(end.x, end.y);
    //   context.stroke();
    // }

    // draw a black circle around selected nodes
    // selectedNodes.forEach((node) => {
    //   const { x, y } =
    //     draggingState.isDragging && hitTestNode(draggingState.start, node)
    //       ? draggingState.end
    //       : node;
    //   context.strokeStyle =
    //     pointer && hitTestNode(pointer, node)
    //       ? config.hoverNodeColor
    //       : config.selectedNodeColor;
    //   context.lineWidth = 1;
    //   context.dot(x, y, 5);
    //   context.circle(x, y, config.selectedNodeRadius);
    //   context.text(x, y, `x: ${x}\ny: ${y}`);
    // });

    context.strokeStyle = config.lineColor;
    context.lineWidth = config.lineWidth;

    const effectiveNodes = state.dragging.isDragging
      ? [
          ...state.nodes.filter((node) => !state.selectedNodes.includes(node)),
          {
            ...state.dragging.node!,
            x: state.dragging.end.x,
            y: state.dragging.end.y,
          },
        ]
      : state.nodes;

    context.polygon(effectiveNodes);
  }, [image, pointer, state]);

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
    node: Node
  ): boolean => {
    const { x: cx, y: cy } = node;
    return (
      pointer.x >= cx - 10 &&
      pointer.x <= cx + 10 &&
      pointer.y >= cy - 10 &&
      pointer.y <= cy + 10
    );
  };

  useEffect(() => {
    // const onClickHandler = (e: any) => {
    //   const canvas = canvasRef?.current;

    //   if (!canvas) {
    //     return;
    //   }

    //   const rect = canvas.getBoundingClientRect();

    //   const x = Math.round(e.clientX - rect.left);
    //   const y = Math.round(e.clientY - rect.top);

    //   setNodes((oldNodes) => {
    //     // clear selected nodes if shift key or ctrl key is not pressed
    //     if (!e.shiftKey && !e.ctrlKey) {
    //       setSelectedNodes(() => []);
    //     }

    //     const found = oldNodes.find((node) => hitTestNode({ x, y }, node));
    //     if (found) {
    //       setSelectedNodes((oldSelectedNodes) => [...oldSelectedNodes, found]);
    //       return oldNodes;
    //     }

    //     const order = oldNodes.length + 1;
    //     return [...oldNodes, { x, y, order: order }];
    //   });
    // };

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
              isDragging: true,
              start: { x, y },
              end: { x, y },
              node: found,
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
          return {
            ...oldState,
            dragging: noDragging,
            selectedNodes: [],
            nodes: [
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
        if (!oldState.dragging.isDragging) {
          return oldState;
        }

        return {
          ...oldState,
          dragging: {
            ...oldState.dragging,
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
        console.log("delete");
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
