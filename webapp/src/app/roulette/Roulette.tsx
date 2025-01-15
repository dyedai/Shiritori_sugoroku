"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RouletteProps {
  onSpin: () => void;
  isSpinning: boolean;
  result: number | null;
  currentPlayer: string;
  isCurrentUserTurn: boolean;
  isLarge: boolean;
}

const Roulette: React.FC<RouletteProps> = ({
  onSpin,
  isSpinning,
  result,
  currentPlayer,
  isCurrentUserTurn,
  isLarge,
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
  const [isAnimating, setIsAnimating] = useState(false);

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
    // 表示のちらつき抑制
    setIsAnimating(true);
  }, [result]);

  useEffect(() => {
    if (isSpinning && result !== null) {
      const targetIndex = segments.indexOf(result);
      const anglePerSegment = 360 / segments.length;
      const targetAngle =
        360 - (targetIndex * anglePerSegment + anglePerSegment / 2) + 270;
      const spins = Math.floor(Math.random() * 3 + 5) * 360 + targetAngle;

      setRotation(spins);

      setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
    }
  }, [isSpinning, result]);
  return (
    <div
      className={`${
        isLarge
          ? "flex flex-col items-center justify-center fixed inset-0 bg-gray-800 bg-opacity-75 z-50"
          : "fixed bottom-4 right-4"
      }`}
    >
      <div
        className={`relative ${
          isLarge ? "w-[430px] h-[430px]" : "w-[160px] h-[160px]"
        }`}
      >
        {/* ゴールドの枠 */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-xl`}
        ></div>
        {/* ルーレットホイール */}
        <motion.canvas
          ref={canvasRef}
          width={isLarge ? 400 : 160}
          height={isLarge ? 400 : 160}
          className={`rounded-full absolute  ${
            isLarge ? "top-[16px] left-[16px]" : ""
          }`}
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        ></motion.canvas>
        {/* 中央の装飾 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-lg border-4 border-white flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-inner"></div>
        </div>

        {/* 矢印のマーカー */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
          <div className="w-8 h-8 bg-yellow-500 transform rotate-45 border-2 border-white shadow-lg"></div>
        </div>
      </div>

      {result == null && isAnimating && (
        <>
          {isCurrentUserTurn ? (
            <button
              onClick={onSpin}
              className="mt-6 px-8 py-3 bg-yellow-500 text-white rounded-full font-bold hover:bg-yellow-600 transition duration-300"
              disabled={isSpinning}
            >
              {isSpinning ? "回転中..." : "スタート"}
            </button>
          ) : (
            <div className="mt-6 px-8 py-3 text-3xl  text-white rounded-md font-bold transition duration-300">
              {isSpinning ? "回転中..." : `${currentPlayer} の番`}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Roulette;
