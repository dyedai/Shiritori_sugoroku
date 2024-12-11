"use client";
import { useEffect, useRef, useState } from "react";

// ゲームの初期設定
const goal = 100;
const squareSize = 32;

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPositions, setPlayerPositions] = useState([0, 0, 0, 0]); // プレイヤー4人分
  const [diceValues, setDiceValues] = useState([0, 0, 0, 0]); // プレイヤー4人分
  const [diceImagesLoaded, setDiceImagesLoaded] = useState(false); // サイコロ画像の読み込み状態
  const [playerImagesLoaded, setPlayerImagesLoaded] = useState(false); // プレイヤー画像の読み込み状態
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // サイコロの目の画像を読み込む
  const diceImages = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
  diceImages[0].src = "/image/dice/saikoro-illust1.png";
  diceImages[1].src = "/image/dice/saikoro-illust2.png";
  diceImages[2].src = "/image/dice/saikoro-illust3.png";
  diceImages[3].src = "/image/dice/saikoro-illust4.png";
  diceImages[4].src = "/image/dice/saikoro-illust5.png";
  diceImages[5].src = "/image/dice/saikoro-illust6.png";

  // プレイヤーの画像を読み込む
  const playerImages = [new Image(), new Image(), new Image(), new Image()];
  playerImages[0].src = "/image/koma/koma1.png";
  playerImages[1].src = "/image/koma/koma2.png";
  playerImages[2].src = "/image/koma/koma3.png";
  playerImages[3].src = "/image/koma/koma4.png";

  // サイコロ画像がすべて読み込まれたかを確認
  useEffect(() => {
    let loadedImages = 0;
    const totalImages = diceImages.length;

    diceImages.forEach((img) => {
      img.onload = () => {
        loadedImages += 1;
        if (loadedImages === totalImages) {
          setDiceImagesLoaded(true);
        }
      };
    });
  }, []);

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
    if (diceImagesLoaded && playerImagesLoaded) {
      drawField();
    }
  }, [diceImagesLoaded, playerImagesLoaded]);

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
    if (!ctx || !diceImagesLoaded || !playerImagesLoaded) return; // 画像が読み込まれていない場合は描画しない

    const width = canvas.width;
    const height = canvas.height;

    // プレイヤーの縦の間隔を均等に設定
    const numPlayers = 4;
    const playerSpacing = height / (numPlayers + 1);
    const baseYPos = Array.from({ length: numPlayers }, (_, index) => (index + 1) * playerSpacing);

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
    const charSize = 80;
    playerPositions.forEach((position, index) => {
      const playerX = 50 * position + 70 - charSize / 2;
      const playerY = baseYPos[index];
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
    <div style={{ width: "100vw", height: "100vh" }}>
      <div
        style={{
          overflowX: "scroll",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          width: "100%",
          height: "70vh", // 高さを調整
        }}
      >
        <canvas ref={canvasRef} width={50 * (goal + 1) + 100} height={600} style={{ display: "block", margin: "0 auto" }}></canvas>
      </div>
      <br />
      <button onClick={rollDice}>サイコロをふる</button>
    </div>
  );
}
