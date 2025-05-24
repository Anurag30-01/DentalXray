import React, { useRef, useEffect } from "react";

interface Prediction {
  x: number;       // center x (relative 0-1)
  y: number;       // center y (relative 0-1)
  width: number;   // relative width (0-1)
  height: number;  // relative height (0-1)
  confidence: number;
  class: string;
}

interface ImageWithBoxesProps {
  imageBase64: string;  // base64 string without prefix
  predictions: Prediction[];
  canvasWidth?: number;
  canvasHeight?: number;
}

const ImageWithBoxes: React.FC<ImageWithBoxesProps> = ({
  imageBase64,
  predictions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
  if (!canvasRef.current) return;
  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    canvasRef.current!.width = img.width;   
    canvasRef.current!.height = img.height; 

    ctx.clearRect(0, 0, img.width, img.height);
    ctx.drawImage(img, 0, 0);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.font = "18px Arial";
    ctx.fillStyle = "red";

    predictions.forEach((pred) => {
      // Use absolute pixel values directly
      const x = pred.x - pred.width / 2;  // x and y are center coords, so shift to top-left
      const y = pred.y - pred.height / 2;
      const w = pred.width;
      const h = pred.height;

      ctx.strokeRect(x, y, w, h);
      const label = `${pred.class} ${(pred.confidence * 100).toFixed(1)}%`;
      ctx.font = "48px Arial"; // Increased font size from 18px to 24px
      ctx.fillText(label, x, y > 20 ? y - 5 : y + 25);
    });
  };

  img.src = "data:image/png;base64," + imageBase64;
}, [imageBase64, predictions]);
  return (
    <>
    <h1 className="text-xl font-semibold mb-1">Visualization</h1>
    <canvas ref={canvasRef} style={{ border: "1px solid #ccc", maxWidth: "100%", marginBottom: "25px" }} />
    </>
  );
};

export default ImageWithBoxes;
