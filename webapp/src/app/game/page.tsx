"use client";
import { useEffect, useRef, useState } from "react";

// ゲームの初期設定
const goal = 100;
const squareSize = 32;

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPositions, setPlayerPositions] = useState([0, 0, 0, 0]); // プレイヤー4人分
  const [diceValues, setDiceValues] = useState([0, 0, 0, 0]); // プレイヤー4人分
  const [diceImagesLoaded, setDiceImagesLoaded] = useState(false); // Image loaded state
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // サイコロの目の画像を読み込む
  const diceImages = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
  diceImages[0].src = "/image/dice/saikoro-illust1.png";
  diceImages[1].src = "/image/dice/saikoro-illust2.png";
  diceImages[2].src = "/image/dice/saikoro-illust3.png";
  diceImages[3].src = "/image/dice/saikoro-illust4.png";
  diceImages[4].src = "/image/dice/saikoro-illust5.png";
  diceImages[5].src = "/image/dice/saikoro-illust6.png";

  // Wait for all dice images to load
  useEffect(() => {
    let loadedImages = 0;
    const totalImages = diceImages.length;

    diceImages.forEach((img) => {
      img.onload = () => {
        loadedImages += 1;
        if (loadedImages === totalImages) {
          setDiceImagesLoaded(true); // Set state when all images are loaded
        }
      };
    });
  }, []);

  // プレイヤーの画像を読み込む
  const playerImages = [new Image(), new Image(), new Image(), new Image()];
  playerImages[0].src = "/image/charactor/1009010201.png"; // プレイヤー1の画像
  playerImages[1].src = "/image/charactor/1010010201.png"; // プレイヤー2の画像
  playerImages[2].src = "/image/charactor/1058010201.png"; // プレイヤー3の画像
  playerImages[3].src = "/image/charactor/1008010201.png"; // プレイヤー4の画像

  // ゲーム開始
  const startGame = () => {
    setGameStarted(true);
    setPlayerPositions([0, 0, 0, 0]);
    setDiceValues([0, 0, 0, 0]);
    drawField();
  };

  // サイコロを振る
  const rollDice = () => {
    const rolls = [0, 0, 0, 0].map(() => Math.floor(Math.random() * 6) + 1); // 4人分のサイコロを振る
    setDiceValues(rolls);

    setPlayerPositions((prevPositions) => prevPositions.map((position, index) => Math.min(position + rolls[index], goal)));

    drawField();
  };

  // フィールド描画
  const drawField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !diceImagesLoaded) return; // Ensure images are loaded

    const width = canvas.width;
    const height = canvas.height;

    // プレイヤーの縦の間隔を均等に設定
    const numPlayers = 4; // プレイヤーの数
    const playerSpacing = height / (numPlayers + 1); // プレイヤー間の間隔を均等に計算

    // プレイヤーの位置を設定（均等に配置）
    const baseYPos = Array.from({ length: numPlayers }, (_, index) => (index + 1) * playerSpacing);

    // 背景の描画
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    ctx.font = "14px MS Gothic";

    // マスの描画（色を統一）
    for (let i = 0; i <= goal; i++) {
      const xPos0 = 50 * i + 50; // 各マスのX位置

      // スタートとゴールのテキスト
      for (let j = 0; j < 4; j++) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(xPos0, baseYPos[j], squareSize, 8);
        if (i === 0) {
          ctx.fillText("START", xPos0, baseYPos[j] + 25);
        } else if (i === goal) {
          ctx.fillText("GOAL", xPos0, baseYPos[j] + 25);
        } else {
          ctx.fillText(i.toString(), xPos0 + 10, baseYPos[j] + 25); // 通常のマスに番号を表示
        }
      }
    }

    // プレイヤーの描画
    const charSize = 80;
    playerPositions.forEach((position, index) => {
      const playerX = 50 * position + 70 - charSize / 2; // プレイヤーX座標（目標位置に合わせる）
      const playerY = baseYPos[index]; // プレイヤーY座標（足元に配置）
      ctx.drawImage(playerImages[index], playerX, playerY - charSize, charSize, charSize);
    });

    // サイコロの目を表示
    playerPositions.forEach((_, index) => {
      showDice(diceValues[index], 10, baseYPos[index] - 64, 40, 40);
    });
  };

  // サイコロの目を描画
  const showDice = (value: number, x: number, y: number, width: number, height: number) => {
    const image = diceImages[value - 1];
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && image) {
      ctx.drawImage(image, x, y, width, height);
    }
  };

  return (
    <div style={{ overflowX: "auto", width: "100vw", height: "100vh" }}>
      <canvas
        ref={canvasRef}
        width={50 * (goal + 1) + 100} // Canvas width based on goal and step size
        height={600} // 高さを増やす
        style={{ display: "block", margin: "0 auto" }}
      ></canvas>
      <br />
      {gameStarted ? <button onClick={rollDice}>サイコロをふる</button> : <button onClick={startGame}>ゲーム開始</button>}
    </div>
  );
}
