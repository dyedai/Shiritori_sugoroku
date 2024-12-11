"use client";
import { useEffect, useRef, useState } from "react";
import Roulette from "../roulette/Roulette";

// ゲームの初期設定
const goal = 100;
const squareSize = 32;

export default function Game() {
  const [playerPositions, setPlayerPositions] = useState([0, 0, 0, 0]); // プレイヤー4人分
  const [currentPlayer, setCurrentPlayer] = useState(0); // 現在のプレイヤー
  const [isRouletteLarge, setIsRouletteLarge] = useState(false); // ルーレットの表示状態
  const [playerImages, setPlayerImages] = useState<HTMLImageElement[]>([]); // プレイヤー画像
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // プレイヤー画像をロード
  useEffect(() => {
    const loadImages = async () => {
      const images: HTMLImageElement[] = [];
      const sources = [
        "/image/koma/koma1.png",
        "/image/koma/koma2.png",
        "/image/koma/koma3.png",
        "/image/koma/koma4.png",
      ];

      for (const src of sources) {
        const img = new Image();
        img.src = src;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        images.push(img);
      }

      setPlayerImages(images);
    };

    loadImages();
  }, []);

  // フィールド描画
  const drawField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // プレイヤーの縦の間隔を均等に設定
    const numPlayers = 4;
    const playerSpacing = height / (numPlayers + 1);
    const baseYPos = Array.from(
      { length: numPlayers },
      (_, index) => (index + 1) * playerSpacing
    );

    // 背景の描画
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);

    ctx.font = "14px MS Gothic";

    // マスの描画（色を統一）
    for (let i = 0; i <= goal; i++) {
      const xPos0 = 50 * i + 50;

      for (let j = 0; j < 4; j++) {
        ctx.fillStyle = "#000";
        ctx.fillRect(xPos0, baseYPos[j], squareSize, 8);
        if (i === 0) {
          ctx.fillText("START", xPos0, baseYPos[j] + 25);
        } else if (i === goal) {
          ctx.fillText("GOAL", xPos0, baseYPos[j] + 25);
        } else {
          ctx.fillText(i.toString(), xPos0 + 10, baseYPos[j] + 25);
        }
      }
    }

    // プレイヤーの描画
    const charSize = 40;
    playerPositions.forEach((position, index) => {
      const playerX = 50 * position + 70 - charSize / 2;
      const playerY = baseYPos[index];
      if (playerImages[index]) {
        ctx.drawImage(
          playerImages[index],
          playerX,
          playerY - charSize,
          charSize,
          charSize
        );
      }
    });
  };

  // ルーレット結果を処理
  const handleRouletteResult = (result: number) => {
    setPlayerPositions((prevPositions) => {
      const newPositions = [...prevPositions];
      newPositions[currentPlayer] = Math.min(
        newPositions[currentPlayer] + result,
        goal
      );
      return newPositions;
    });

    // 次のプレイヤーに切り替える
    setCurrentPlayer((prevPlayer) => (prevPlayer + 1) % 4);

    // ルーレットを小さくする
    setIsRouletteLarge(false);
  };

  // ルーレットを表示する
  const showRoulette = () => {
    setIsRouletteLarge(true);
  };

  useEffect(() => {
    drawField();
  }, [playerPositions, playerImages]);

  return (
    <div className="relative overflow-hidden">
      <div
        style={{
          overflowX: "scroll",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        <canvas
          ref={canvasRef}
          width={50 * (goal + 1) + 100}
          height={300}
          style={{ display: "block", margin: "0 auto" }}
        ></canvas>
      </div>

      <button
        onClick={showRoulette}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded"
      >
        ルーレットを回す
      </button>

      {isRouletteLarge && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <Roulette
            onResult={handleRouletteResult}
            currentPlayer={currentPlayer + 1}
            isLarge={true} // 全画面表示
          />
        </div>
      )}

      {!isRouletteLarge && (
        <div className="fixed bottom-4 right-4">
          <Roulette
            onResult={() => {}} // 小型モードでは結果処理なし
            currentPlayer={currentPlayer + 1}
            isLarge={false} // 小型表示
          />
        </div>
      )}
    </div>
  );
}
