"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RouletteProps {
  onResult: (result: number) => void; // 結果を渡すコールバック関数
  currentPlayer: number; // 現在のプレイヤー番号
  isLarge: boolean; // ルーレットが大きく表示されるか
}

const Roulette: React.FC<RouletteProps> = ({
  onResult,
  currentPlayer,
  isLarge,
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

  // ルーレットホイールを描画する関数
  const drawRouletteWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = isLarge ? 200 : 80; // サイズを切り替え
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
      ctx.font = isLarge ? "bold 20px Arial" : "bold 10px Arial";
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
    onResult(selectedNumber); // 結果を親コンポーネントに渡す
  };

  // コンポーネントがマウントまたは更新されるたびにルーレットホイールを描画
  useEffect(() => {
    drawRouletteWheel();
  }, [rotation]);

  return (
    <div
      className={`${
        isLarge
          ? "flex items-center justify-center fixed inset-0 bg-gray-800 bg-opacity-75 z-50"
          : "fixed bottom-4 right-4"
      }`}
    >
      <div
        className={`relative ${
          isLarge ? "w-[400px] h-[400px]" : "w-[160px] h-[160px]"
        }`}
      >
        {/* ゴールドの枠 */}
        <div
          className={`absolute inset-0 rounded-full ${
            isLarge
              ? "bg-gradient-to-br from-yellow-600 to-yellow-800"
              : "bg-gradient-to-br from-yellow-600 to-yellow-800"
          } shadow-xl`}
        ></div>
        {/* ルーレットホイール */}
        <motion.canvas
          ref={canvasRef}
          width={isLarge ? 400 : 160}
          height={isLarge ? 400 : 160}
          className="rounded-full absolute"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        ></motion.canvas>
        {/* 矢印のマーカー */}
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${
            isLarge ? "w-8 h-8" : "w-4 h-4"
          }`}
        >
          <div className="bg-yellow-500 transform rotate-45 border-2 border-black shadow-lg"></div>
        </div>
      </div>

      {isLarge && (
        <button
          onClick={handleStart}
          className="mt-6 px-8 py-3 bg-yellow-500 text-white rounded-full font-bold hover:bg-yellow-600 transition duration-300"
          disabled={isSpinning}
        >
          {isSpinning ? "回転中..." : "スタート"}
        </button>
      )}

      {selectedNumber !== null && isLarge && (
        <div className="mt-4 text-xl font-bold text-white">
          プレイヤー {currentPlayer} の結果: {selectedNumber}
        </div>
      )}
    </div>
  );
};

export default Roulette;