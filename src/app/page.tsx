"use client";

import React, { use, useEffect, useRef } from "react";
import Canvas from "./canvas";
import Button from "./button";
import FileInput from "./fileInput";
import { Node } from "../lib/Node";

// declare global {
//   interface CanvasRenderingContext2D {
//     dot(x: number, y: number, color?: string, radius?: number): void;
//   }
// }

// type CanvasProps = {
//   containerClassName?: string;
//   className?: string;
//   file: File | null;
// };

// CanvasRenderingContext2D.prototype.dot = function (
//   x: number,
//   y: number,
//   color: string = "red",
//   radius: number = 5
// ) {
//   this.beginPath();
//   this.arc(x, y, radius, 0, 2 * Math.PI);
//   this.fillStyle = color;
//   this.fill();
// };

// const SimpleCanvasExample: React.FC<CanvasProps> = ({ file }) => {
//   let canvasRef = useRef<HTMLCanvasElement | null>(null);
//   let canvasContext = React.useRef<CanvasRenderingContext2D | null>(null);

//   const [coordinates, setCoordinates] = React.useState<Coordinate[]>(() => []);

//   useEffect(() => {
//     const onClickHandler = (e: MouseEvent) => {
//       const canvas = canvasRef.current!;
//       const context = canvasContext.current!;

//       // if (!canvas) {
//       //   return;
//       // }

//       const rect = canvas.getBoundingClientRect();

//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;

//       context.dot(x, y);

//       // console.log("click", coordinates.length);
//       // const order = coordinates.length + 1;
//       // const newCoordinates = [...coordinates, { x, y, order: order }];
//       setCoordinates((oldCoordinates) => {
//         console.log("click", oldCoordinates.length);

//         const order = oldCoordinates.length + 1;
//         return [...oldCoordinates, { x, y, order: order }];
//       });
//     };

//     // const onClickHandler = (e: MouseEvent) => {
//     //   const canvas = canvasRef?.current;
//     //   const context = canvasCtxRef.current!;
//     //   if (!canvas) {
//     //     return;
//     //   }

//     //   const rect = canvas.getBoundingClientRect();

//     //   const x = e.clientX;
//     //   const y = e.clientY;

//     //   context.beginPath();
//     //   context.arc(x, y, 5, 0, 2 * Math.PI);
//     //   context.stroke();
//     // };

//     // Initialize
//     if (canvasRef.current) {
//       canvasContext.current = canvasRef.current.getContext("2d");
//       let context = canvasContext.current!;

//       context.clearRect(
//         0,
//         0,
//         canvasRef.current!.width,
//         canvasRef.current!.height
//       );

//       // ctx!.beginPath();
//       // ctx!.arc(95, 50, 40, 0, 2 * Math.PI);
//       // ctx!.stroke();

//       file?.arrayBuffer().then((buffer) => {
//         const blob = new Blob([buffer]);
//         const img = new Image();
//         img.src = URL.createObjectURL(blob);
//         img.onload = () => {
//           // scale image to fit canvas
//           canvasRef.current!.width = img.width;
//           canvasRef.current!.height = img.height;

//           let scale = Math.min(
//             canvasRef.current!.width / img.width,
//             canvasRef.current!.height / img.height
//           );

//           // draw an image working area, take inset from the canvas edges from padding
//           // size of the working area is the same as the image size
//           context.beginPath();
//           context.moveTo(0, 0);
//           context.lineTo(img.width * scale, 0);
//           context.lineTo(0 + img.width * scale, 0 + img.height * scale);
//           context.lineTo(0, img.height * scale);
//           context.closePath();
//           context.stroke();

//           // draw a red dot at the origin
//           context.dot(0, 0);

//           // draw image in the working area
//           context.drawImage(img, 0, 0, img.width * scale, img.height * scale);
//         };
//       });
//     }

//     canvasRef.current!.addEventListener("click", onClickHandler);
//     return () => {
//       canvasRef.current!.removeEventListener("click", onClickHandler);
//     };
//   }, [file, canvasRef]);

//   return <canvas ref={canvasRef}></canvas>;
// };

// const CoordinatesContext = React.createContext<Coordinate[]>([]);
// const useCoordinates = () => React.useContext(CoordinatesContext);

const fotmatNodes = (coordinates: Node[]): string => {
  const sorted = coordinates.sort((a, b) => a.order - b.order);
  const values = sorted
    .map(({ x, y }: { x: number; y: number }) => `  { "x": ${x}, "y": ${y} }`)
    .join(",\n");
  const formatted = ["[", values, "]"].join("\n");
  return formatted;
};

export default function Home() {
  const [file, setFile] = React.useState<File | null>(null);
  const [userInput, setUserInput] = React.useState("");
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    if (userInput) {
      try {
        // setCoordinates(JSON.parse(userInput));
        setError(null);
      } catch (error: any) {
        setError(error);
      }
    }
  }, [userInput]);

  // useEffect(() => {
  //   // if (coordinates.length) {
  //   // setUserInput(fotmatCoordinates(coordinates));
  //   // }
  // }, [coordinates]);

  return (
    <main className="flex min-h-screen flex-col items-left p-10 gap-4">
      <div className="flex flex-row items-start justify-between w-full gap-4">
        <div className="flex flex-col items-left justify-between w-full gap-4">
          <FileInput onChange={setFile} />
          {/* <SimpleCanvasExample file={file} /> */}

          <Canvas
            file={file}
            onChanged={(nodes) => {
              setUserInput(fotmatNodes(nodes));
            }}
            containerClassName="border border-gray-600 border-dashed rounded"
            className="m-4 border border-gray-300 bg-gradient-to-b from-white dark:from-zinc-800/30"
          />
        </div>
        <div className="flex flex-col items-left justify-between w-full gap-4">
          <div className="flex flex-row items-center justify-between w-full gap-2">
            <div className="flex-grow" />
            <Button
              caption="Copy"
              onClick={() => {
                // navigator.clipboard.writeText(
                //   // JSON.stringify(coordinates, null, 2)
                // );
              }}
            />
            <Button
              caption="Format"
              onClick={() => {
                // setUserInput(fotmatCoordinates(coordinates));
              }}
            />
            <Button
              caption="Clear"
              onClick={() => {
                // setCoordinates([]);
              }}
            />
          </div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-gray-200"
            rows={10}
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
            }}
          />
          {error && (
            <div className="text-red-500 justify-start">{error.message}</div>
          )}
        </div>
      </div>
    </main>
  );
}
