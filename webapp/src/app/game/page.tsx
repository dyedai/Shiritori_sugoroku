"use client";
import { useEffect, useRef, useState } from "react";
import Roulette from "../roulette/Roulette";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gamepad2, History } from "lucide-react";

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

    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);

    ctx.font = "14px 'Noto Sans JP', sans-serif";

    for (let i = 0; i <= goal; i++) {
      const xPos0 = 50 * i + 50;

      for (let j = 0; j < 4; j++) {
        ctx.fillStyle = "#d1d5db";
        ctx.fillRect(xPos0, baseYPos[j], squareSize, 8);
        if (i === 0) {
          ctx.fillStyle = "#4b5563";
          ctx.fillText("START", xPos0, baseYPos[j] + 25);
        } else if (i === goal) {
          ctx.fillStyle = "#4b5563";
          ctx.fillText("GOAL", xPos0, baseYPos[j] + 25);
        } else if (i % 10 === 0) {
          ctx.fillStyle = "#9ca3af";
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
    <div className="relative min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex flex-col gap-6 p-6">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-purple-800">
            しりとりゲーム
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto overflow-y-hidden whitespace-nowrap pb-4">
            <canvas
              ref={canvasRef}
              width={50 * (goal + 1) + 100}
              height={300}
              className="mx-auto rounded-lg shadow-inner"
            ></canvas>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {playerPositions.map((position, index) => (
              <div key={index} className="flex flex-col items-center">
                <Avatar className="w-12 h-12 mb-2">
                  <AvatarImage
                    src={`/image/koma/koma${index + 1}.png`}
                    alt={`Player ${index + 1}`}
                  />
                  <AvatarFallback>{index + 1}</AvatarFallback>
                </Avatar>
                <Progress value={(position / goal) * 100} className="w-full" />
                <span className="text-sm font-medium mt-1">
                  {position}/{goal}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {rouletteResult !== null && (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <h3 className="text-xl font-bold text-purple-800 mb-2">
                プレイヤー{currentPlayer + 1}の番
              </h3>
              <p className="text-lg font-medium text-gray-700 mb-4">
                {rouletteResult}文字の単語を入力してください
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-12 h-12 border-2 border-purple-500 rounded-lg bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-800">
                  {lastCharacter}
                </div>
                {word.map((_, idx) => (
                  <Input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el!;
                    }}
                    type="text"
                    value={word[idx]}
                    onChange={(e) => handleInputChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl font-medium border-2 border-purple-300 focus:border-purple-500 rounded-lg"
                  />
                ))}
              </div>
              <Button
                onClick={checkWord}
                disabled={loading}
                className="w-full max-w-xs text-lg font-bold py-6"
                variant={loading ? "secondary" : "default"}
              >
                {loading ? "確認中..." : "確認する"}
              </Button>
              {wordResult && (
                <p
                  className={`mt-4 text-lg font-medium text-center ${
                    wordResult.includes("存在します")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {wordResult}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold text-purple-800 flex items-center gap-2">
            <History className="w-6 h-6" />
            しりとり履歴
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700">{history.join(" → ")}</p>
        </CardContent>
      </Card>

      {isRouletteLarge && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="text-center bg-white rounded-xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-purple-800 mb-6 flex items-center justify-center gap-2">
              <Gamepad2 className="w-8 h-8" />
              プレイヤー{currentPlayer + 1}の番
            </h2>
            <Roulette
              onResult={handleRouletteResult}
              currentPlayer={currentPlayer + 1}
              isLarge={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
