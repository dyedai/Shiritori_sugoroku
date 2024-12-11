"use client";
import { useEffect, useRef, useState } from "react";
import Roulette from "../roulette/Roulette";

// ゲームの初期設定
const goal = 100;
const squareSize = 32;

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPositions, setPlayerPositions] = useState([0, 0, 0, 0]); // プレイヤー4人分
  const [currentPlayer, setCurrentPlayer] = useState(0); // 現在のプレイヤー
  const [diceImagesLoaded, setDiceImagesLoaded] = useState(false); // サイコロ画像の読み込み状態
  const [playerImagesLoaded, setPlayerImagesLoaded] = useState(false); // プレイヤー画像の読み込み状態
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // プレイヤーの画像を読み込む
  const playerImages = [new Image(), new Image(), new Image(), new Image()];
  playerImages[0].src = "/image/koma/koma1.png";
  playerImages[1].src = "/image/koma/koma2.png";
  playerImages[2].src = "/image/koma/koma3.png";
  playerImages[3].src = "/image/koma/koma4.png";

  // プレイヤー画像がすべて読み込まれたかを確認
  useEffect(() => {
    let loadedImages = 0;
    const totalImages = playerImages.length;

    playerImages.forEach((img) => {
      img.onload = () => {
        loadedImages += 1;
        if (loadedImages === totalImages) {
          setPlayerImagesLoaded(true);
        }
      };
    });
  }, []);

  // 初期描画を行う
  useEffect(() => {
    if (playerImagesLoaded) {
      drawField();
    }
  }, [playerImagesLoaded, playerPositions]);

  // フィールド描画
  const drawField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !playerImagesLoaded) return;

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
      ctx.drawImage(
        playerImages[index],
        playerX,
        playerY - charSize,
        charSize,
        charSize
      );
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
  };

  return (
    <div className="overflow-hidden">
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
      <div className="w-full flex justify-end items-center">
        <Roulette
          onResult={handleRouletteResult}
          currentPlayer={currentPlayer + 1} // 1-based index
        />
      </div>
    </div>
  );
}
