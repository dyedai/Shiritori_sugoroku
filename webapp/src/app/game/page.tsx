"use client";
import { useEffect, useRef, useState } from "react";
import Roulette from "../roulette/Roulette";

const goal = 100;
const squareSize = 32;

export default function Game() {
  const [playerPositions, setPlayerPositions] = useState([0, 0, 0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isRouletteLarge, setIsRouletteLarge] = useState(true);
  const [playerImages, setPlayerImages] = useState<HTMLImageElement[]>([]);
  const [rouletteResult, setRouletteResult] = useState<number | null>(null);
  const [word, setWord] = useState<string[]>([]);
  const [wordResult, setWordResult] = useState<string | null>(null);
  const [lastCharacter, setLastCharacter] = useState("り");
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      const sources = [
        "/image/koma/koma1.png",
        "/image/koma/koma2.png",
        "/image/koma/koma3.png",
        "/image/koma/koma4.png",
      ];
      const images = await Promise.all(
        sources.map((src) => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
          });
        })
      );
      setPlayerImages(images);
    };
    loadImages();
  }, []);

  const drawField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const numPlayers = 4;
    const playerSpacing = height / (numPlayers + 1);
    const baseYPos = Array.from(
      { length: numPlayers },
      (_, index) => (index + 1) * playerSpacing
    );

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);

    ctx.font = "14px MS Gothic";

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

  const handleRouletteResult = (result: number) => {
    setRouletteResult(result);
    setWord(Array(result - 1).fill(""));
    setIsRouletteLarge(false);
  };

  const handleInputChange = (value: string, index: number) => {
    if (!/^[\u3040-\u309Fー]?$/.test(value)) return; // Allow only hiragana
    const newWord = [...word];
    newWord[index] = value;
    setWord(newWord);

    if (value && index < word.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !word[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const checkWord = async () => {
    const fullWord = lastCharacter + word.join("");
    if (fullWord.length !== rouletteResult) {
      setWordResult(
        `最後の文字を含めて${rouletteResult}文字を入力してください。`
      );
      return;
    }
    const isHiragana = /^[\u3040-\u309Fー]+$/.test(fullWord);
    if (!isHiragana) {
      setWordResult("ひらがなを入力してください。");
      return;
    }

    if (fullWord.slice(-1) === "ん") {
      setWordResult("最後に「ん」が含まれているため終了です。");
      return;
    }

    setLoading(true);
    setWordResult(null);

    try {
      const response = await fetch(
        `/api/check-word?word=${encodeURIComponent(fullWord)}`
      );
      const data = await response.json();

      if (data.exists) {
        setWordResult("この単語は存在します！");
        setPlayerPositions((prevPositions) => {
          const newPositions = [...prevPositions];
          newPositions[currentPlayer] = Math.min(
            newPositions[currentPlayer] + (rouletteResult || 0),
            goal
          );
          return newPositions;
        });
        setHistory((prevHistory) => [...prevHistory, fullWord]);
        setLastCharacter(fullWord.slice(-1));
      } else {
        setWordResult("この単語は見つかりませんでした。");
      }
    } catch {
      setWordResult("エラーが発生しました。");
    } finally {
      setLoading(false);
      setWord([]);
      setRouletteResult(null);

      setTimeout(() => {
        const nextPlayer = (currentPlayer + 1) % 4;
        setCurrentPlayer(nextPlayer);
        setIsRouletteLarge(true);
      }, 2000); // Delay before next turn
    }
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

      <div className="fixed bottom-0 left-0 w-full bg-gray-100 p-4">
        <h3 className="text-lg font-bold">しりとり履歴:</h3>
        <p className="text-base">{history.join(" → ")}</p>
      </div>

      {rouletteResult !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="mb-2 text-lg font-bold">
              プレイヤー{currentPlayer + 1}が{rouletteResult}
              文字分の単語を入力してください。
            </p>
            <p className="mb-4 text-sm text-gray-600">
              現在の最後の文字: <strong>{lastCharacter}</strong>
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 border rounded bg-gray-200 flex items-center justify-center">
                <span>{lastCharacter}</span>
              </div>
              {word.map((_, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el!)}
                  type="text"
                  value={word[idx]}
                  onChange={(e) => handleInputChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  maxLength={1}
                  className="w-10 h-10 border text-center rounded"
                />
              ))}
            </div>
            <button
              onClick={checkWord}
              disabled={loading}
              className={`mt-4 px-4 py-2 text-white rounded-lg ${
                loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "確認中..." : "確認する"}
            </button>
            {wordResult && <p className="mt-4 text-red-500">{wordResult}</p>}
          </div>
        </div>
      )}

      {isRouletteLarge && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <h2 className="absolute top-8 text-2xl text-white font-bold">
            プレイヤー{currentPlayer + 1}の番
          </h2>
          <Roulette
            onResult={handleRouletteResult}
            currentPlayer={currentPlayer + 1}
            isLarge={true}
          />
        </div>
      )}
    </div>
  );
}
