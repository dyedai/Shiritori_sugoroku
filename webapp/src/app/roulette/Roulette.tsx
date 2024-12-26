"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RouletteProps {
  onResult: (result: number) => void; // 結果を渡すコールバック関数
  currentPlayer: number; // 現在のプレイヤー番号
  isLarge: boolean; // ルーレットが大きく表示されるか
  isPlayerTurn: boolean; // 自分の番かどうか
}

const Roulette: React.FC<RouletteProps> = ({
  onResult,
  currentPlayer,
  isLarge,
  isPlayerTurn,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const segments = [2, 3, 4, 5, 6, 7, 8]; // ルーレットの数字
  const colors = [
    "#FF5733",
    "#FFC300",
    "#28B463",
    "#3498DB",
    "#8E44AD",
    "#F39C12",
    "#C0392B",
    "#1ABC9C",
  ]; // 各セグメントの色

  const drawRouletteWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = isLarge ? 200 : 80;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const anglePerSegment = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    segments.forEach((number, index) => {
      const startAngle = index * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index];
      ctx.fill();

      // 数字を描画
      ctx.fillStyle = "#ffffff";
      ctx.font = isLarge ? "bold 20px Arial" : "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textAngle = startAngle + anglePerSegment / 2;
      const textX = centerX + (radius / 1.5) * Math.cos(textAngle);
      const textY = centerY + (radius / 1.5) * Math.sin(textAngle);
      ctx.fillText(number.toString(), textX, textY);
    });
  };

  const handleStart = () => {
    if (isSpinning || !isPlayerTurn) return;

    setIsSpinning(true);
    setSelectedNumber(null);

    const randomRotation = Math.floor(Math.random() * 360) + 1800; // 少なくとも5回転
    const finalRotation = rotation + randomRotation;
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      calculateSelectedNumber(finalRotation);
    }, 3000);
  };

  const calculateSelectedNumber = (finalRotation: number) => {
    const anglePerSegment = 360 / segments.length;
    const normalizedRotation = ((finalRotation % 360) + 360) % 360;

    const offset = 270; // 矢印の位置
    const arrowAngle = (360 - normalizedRotation + offset) % 360;

    const selectedSegmentIndex = Math.floor(arrowAngle / anglePerSegment);
    const selectedNumber = segments[selectedSegmentIndex];

    setSelectedNumber(selectedNumber);
    onResult(selectedNumber);
  };

  useEffect(() => {
    drawRouletteWheel();
  }, [rotation]);

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
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-xl`}
        ></div>
        <motion.canvas
          ref={canvasRef}
          width={isLarge ? 400 : 160}
          height={isLarge ? 400 : 160}
          className={`rounded-full absolute ${
            isLarge ? "top-[16px] left-[16px]" : ""
          }`}
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        ></motion.canvas>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-lg border-4 border-white flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-inner"></div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
          <div className="w-8 h-8 bg-yellow-500 transform rotate-45 border-2 border-white shadow-lg"></div>
        </div>
      </div>

      {isLarge && isPlayerTurn && (
        <button
          onClick={handleStart}
          className="mt-6 px-8 py-3 bg-yellow-500 text-white rounded-full font-bold hover:bg-yellow-600 transition duration-300"
          disabled={isSpinning}
        >
          {isSpinning ? "回転中..." : "スタート"}
        </button>
      )}
    </div>
  );
};

export default Roulette;
