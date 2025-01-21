"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const Roulette: React.FC = () => {
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

  // ルーレットホイールを描画する関数
  const drawRouletteWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = 225;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const anglePerSegment = (2 * Math.PI) / segments.length; // 各セグメントの角度

    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア

    // セグメントごとに描画
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
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textAngle = startAngle + anglePerSegment / 2;
      const textX = centerX + (radius / 1.5) * Math.cos(textAngle);
      const textY = centerY + (radius / 1.5) * Math.sin(textAngle);
      ctx.fillText(number.toString(), textX, textY);
    });
  };

  // スタートボタンが押されたときの処理
  const handleStart = () => {
    if (isSpinning) return; // 回転中は処理しない

    setIsSpinning(true);
    setSelectedNumber(null); // 選択された数字をリセット

    const randomRotation = Math.floor(Math.random() * 360) + 1800; // 少なくとも5回転するように設定
    const finalRotation = rotation + randomRotation;
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      calculateSelectedNumber(finalRotation);
    }, 3000); // 3秒後に停止
  };

  // 矢印が指す数字を計算する関数
  const calculateSelectedNumber = (finalRotation: number) => {
    const anglePerSegment = 360 / segments.length;
    const normalizedRotation = ((finalRotation % 360) + 360) % 360; // 0〜360度に正規化

    const offset = 270; // 矢印の位置を調整するオフセット
    const arrowAngle = (360 - normalizedRotation + offset) % 360; // 矢印が指す角度を計算

    // 矢印が指すセグメントのインデックスを計算
    const selectedSegmentIndex = Math.floor(arrowAngle / anglePerSegment);
    const selectedNumber = segments[selectedSegmentIndex];

    setSelectedNumber(selectedNumber);
  };

  // コンポーネントがマウントまたは更新されるたびにルーレットホイールを描画
  useEffect(() => {
    drawRouletteWheel();
  }, [rotation]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="relative w-[500px] h-[500px]">
        {/* ゴールドの枠 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-xl"></div>

        {/* ルーレットホイール */}
        <motion.canvas
          ref={canvasRef}
          width={450}
          height={450}
          className="rounded-full absolute top-3 left-3 transform -translate-x-1/2 -translate-y-1/2 border-[12px] border-white"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }} // 短い時間で高速回転
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

      <button
        onClick={handleStart}
        className="mt-6 px-8 py-3 bg-yellow-500 text-white rounded-full font-bold hover:bg-yellow-600 transition duration-300"
        disabled={isSpinning}
      >
        {isSpinning ? "回転中..." : "スタート"}
      </button>

      {selectedNumber !== null && (
        <div className="mt-4 text-2xl font-bold">結果: {selectedNumber}</div>
      )}
    </div>
  );
};

export default Roulette;
