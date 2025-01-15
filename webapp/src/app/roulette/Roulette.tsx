"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface RouletteProps {
  onSpin: () => void;
  isSpinning: boolean;
  result: number | null;
  currentPlayer: string;
  isCurrentUserTurn: boolean;
}

const Roulette: React.FC<RouletteProps> = ({
  onSpin,
  isSpinning,
  result,
  currentPlayer,
  isCurrentUserTurn,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const segments = [2, 3, 4, 5, 6, 7, 8];
  const colors = [
    "#FF5733",
    "#FFC300",
    "#28B463",
    "#3498DB",
    "#8E44AD",
    "#F39C12",
    "#C0392B",
    "#1ABC9C",
  ];

  const drawRouletteWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = 200;
    const anglePerSegment = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    segments.forEach((number, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(200, 200);
      ctx.arc(200, 200, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index];
      ctx.fill();

      const textX =
        200 + (radius / 1.5) * Math.cos(startAngle + anglePerSegment / 2);
      const textY =
        200 + (radius / 1.5) * Math.sin(startAngle + anglePerSegment / 2);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "bold 20px Arial";
      ctx.fillText(number.toString(), textX, textY);
    });
  };

  useEffect(() => {
    drawRouletteWheel();
  }, []);

  useEffect(() => {
    if (isSpinning && result !== null) {
      const targetIndex = segments.indexOf(result);
      const anglePerSegment = 360 / segments.length;
      const targetAngle =
        360 - (targetIndex * anglePerSegment + anglePerSegment / 2) + 270;
      const spins = Math.floor(Math.random() * 3 + 5) * 360 + targetAngle;

      setRotation(spins);
    }
  }, [isSpinning, result]);

  return (
    <div className="flex flex-col items-center">
      <motion.canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="rounded-full"
        animate={{ rotate: rotation }}
        transition={{ duration: 3, ease: "easeOut" }}
      />
      {isCurrentUserTurn && !isSpinning && (
        <button
          className="mt-4 px-4 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600"
          onClick={onSpin}
        >
          Start
        </button>
      )}
    </div>
  );
};

export default Roulette;
