"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RouletteProps {
  onResult: (result: number) => void; // 結果を渡すコールバック関数
  currentPlayer: number; // 現在のプレイヤー番号
}

const Roulette: React.FC<RouletteProps> = ({ onResult, currentPlayer }) => {
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

    const radius = 80; // 半径を調整
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
      ctx.font = "bold 16px Arial"; // フォントサイズを調整
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
    onResult(selectedNumber); // 親コンポーネントに結果を渡す
  };

  // コンポーネントがマウントまたは更新されるたびにルーレットホイールを描画
  useEffect(() => {
    drawRouletteWheel();
  }, [rotation]);

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-gray-100">
      <div className="relative w-[190px] h-[190px]">
        {/* ゴールドの枠 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-xl"></div>
        {/* ルーレットホイール */}
        <motion.canvas
          ref={canvasRef}
          width={160}
          height={160} // Canvasサイズを変更
          className="rounded-full absolute top-[9px] left-[9px] transform -translate-x-1/2 -translate-y-1/2 border-[6px] border-white"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        ></motion.canvas>
        {/* 中央の装飾 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-lg border-2 border-white flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-inner"></div>
        </div>
        {/* 矢印のマーカー */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[5px]">
          <div className="w-4 h-4 bg-yellow-500 transform rotate-45 border-2 border-white shadow-lg"></div>
        </div>
      </div>

      <button
        onClick={handleStart}
        className="mt-6 px-6 py-3 bg-yellow-500 text-white rounded-full font-bold hover:bg-yellow-600 transition duration-300"
        disabled={isSpinning}
      >
        {isSpinning ? "回転中..." : "スタート"}
      </button>

      {selectedNumber !== null && (
        <div className="mt-4 text-xl font-bold">結果: {selectedNumber}</div>
      )}

      <div className="mt-2 text-lg font-bold">
        プレイヤー {currentPlayer} の番
      </div>
    </div>
  );
};

export default Roulette;
