"use client";
import { useEffect, useRef, useState } from "react";
import Roulette from "../roulette/Roulette";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gamepad2, History } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const goal = 100;

export default function Game() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const players = JSON.parse(searchParams.get("players") || "[]");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(30);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isRouletteLarge, setIsRouletteLarge] = useState(true);
  const [playerImages, setPlayerImages] = useState<HTMLImageElement[]>([]);
  const [rouletteResult, setRouletteResult] = useState<number | null>(null);
  const [word, setWord] = useState<string[]>([]);
  // const [wordResult, setWordResult] = useState<string | null>(null);
  const [lastCharacter, setLastCharacter] = useState("り");
  const [history, setHistory] = useState<string[]>([]);
  const [timer, setTimer] = useState(30);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [playerPositions, setPlayerPositions] = useState<number[]>(Array(players.length).fill(0));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);

  // WebSocket reference
  const socketRef = useRef<WebSocket | null>(null);
  console.log(players[currentPlayerIndex]?.username);

  // Fetch authenticated user info
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const user = await res.json();
          setUserName(user.username);
          setUserId(user.id);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
        router.push("/login");
      }
    }
    fetchUser();
  }, [router]);

  // Setup WebSocket and handle messages
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/game?roomId=${roomId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "join", userId, userName }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);

      switch (data.type) {
        case "updateGameState":
          updateGameState(data);
          setPlayerPositions(data.playerPositions);
          setCurrentPlayerIndex(data.currentPlayerIndex);
          break;
        case "rouletteResult":
          setRouletteResult(data.result);
          setPlayerPositions(data.playerPositions);
          break;
        case "checkResult":
          handleCheckResult(data);
          break;
        default:
          console.log("Unhandled WebSocket message:", data);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, [roomId, userId, userName]);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          triggerNextTurn();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayerIndex]);

  // const triggerNextTurn = () => {
  //   if (!socketRef.current) return;

  //   setCountdown(30);
  //   setRouletteResult(null);
  //   setIsRouletteSpinning(false);
  //   socketRef.current.send(JSON.stringify({ type: "nextTurn", currentPlayerIndex }));
  // };

  useEffect(() => {
    const loadImages = async () => {
      const sources = ["/image/koma/koma1.png", "/image/koma/koma2.png", "/image/koma/koma3.png", "/image/koma/koma4.png"];
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

  useEffect(() => {
    drawField();
  }, [playerPositions, playerImages]);

  useEffect(() => {
    if (isRouletteLarge || resultMessage) return;
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
          setResultMessage("失敗！");
          triggerNextTurn();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isRouletteLarge, resultMessage]);

  const drawField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const numPlayers = 4;

    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, width, height);

    ctx.font = "14px 'Noto Sans JP', sans-serif";

    for (let i = 0; i <= goal; i++) {
      const xPos = 50 * i + 50;
      for (let j = 0; j < numPlayers; j++) {
        ctx.fillStyle = "#d1d5db";
        ctx.fillRect(xPos, (j + 1) * 60, 32, 8);
        if (i === 0) ctx.fillText("START", xPos, (j + 1) * 60 + 25);
        else if (i === goal) ctx.fillText("GOAL", xPos, (j + 1) * 60 + 25);
        else if (i % 10 === 0) ctx.fillText(i.toString(), xPos + 10, (j + 1) * 60 + 25);
      }
    }

    playerPositions.forEach((pos, index) => {
      if (playerImages[index]) {
        const playerX = 50 * pos + 67 - 15;
        ctx.drawImage(playerImages[index], playerX, (index + 1) * 60 - 30, 30, 30);
      }
    });
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
      setResultMessage(`最後の文字を含めて${rouletteResult}文字を入力してください。`);
      setTimeout(() => {
        setResultMessage(null); // メッセージを消す
      }, 1000);
      return;
    }
    if (!/^[\u3040-\u309Fー]+$/.test(fullWord)) {
      setResultMessage("ひらがなを入力してください！");
      setTimeout(() => {
        setResultMessage(null); // メッセージを消す
      }, 1000);
      return;
    }
    if (fullWord.slice(-1) === "ん") {
      setResultMessage("失敗！「ん」で終わったため終了です。");
      triggerNextTurn(); // 次のターンへ
      return;
    }

    if (!socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        type: "checkWord",
        word: fullWord,
        playerId: currentPlayer,
      })
    );
    setWord([]);

    try {
      const response = await fetch(`/api/check-word?word=${encodeURIComponent(fullWord)}`);
      const data = await response.json();

      if (data.exists) {
        setResultMessage("正解！");
        setTimeout(() => {
          setPlayerPositions((prevPositions) => {
            const newPositions = [...prevPositions];
            newPositions[currentPlayer] = Math.min(newPositions[currentPlayer] + (rouletteResult || 0), goal);
            return newPositions;
          });
          setHistory((prevHistory) => [...prevHistory, fullWord]);
          setLastCharacter(fullWord.slice(-1)); // 最後の文字を次の単語の開始文字に設定
          setResultMessage(null);
          triggerNextTurn(); // 正解後、次のターンへ移行
        }, 2000);
      } else {
        setResultMessage("失敗！この単語は存在しません。");
        triggerNextTurn();
      }
    } catch {
      setResultMessage("エラーが発生しました。");
      triggerNextTurn();
    } finally {
      // setLoading(false);
      setWord([]);
      setRouletteResult(null);
    }
  };

  const handleCheckResult = (data: any) => {
    setResultMessage(data.valid ? "正解！" : "失敗！");
    if (data.valid) {
      setPlayerPositions((prev) => {
        const newPositions = [...prev];
        newPositions[currentPlayer] += rouletteResult || 0;
        return newPositions;
      });
      setHistory((prev) => [...prev, lastCharacter + word.join("")]);
      setLastCharacter((lastCharacter + word.join("")).slice(-1));
    }
    triggerNextTurn();
  };

  const updateGameState = (data: any) => {
    setPlayerPositions(data.players.map((p: any) => p.position));
    setCurrentPlayer(data.currentPlayerIndex);
    setHistory(data.wordHistory);
  };

  const triggerNextTurn = () => {
    setTimeout(() => {
      setResultMessage(null); // メッセージを消す
      const nextPlayer = (currentPlayer + 1) % 4;
      setCurrentPlayer(nextPlayer);
      setIsRouletteLarge(true);
      setTimer(30); // タイマーをリセット
    }, 2000); // 2秒後に次のターンに移行
  };

  const handleRouletteResult = (result: number) => {
    setRouletteResult(result);
    setWord(Array(result - 1).fill(""));
    setIsRouletteLarge(false);
  };

  const isCurrentUserTurn = players[currentPlayerIndex]?.username === userName;

  return (
    <div className="relative min-h-screen w-full items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200 flex flex-col gap-6 p-6">
      <div className="flex flex-col w-fit gap-4">
        <div className="flex w-full items-center justify-center gap-4">
          <Card className="w-full max-w-5xl shadow-lg">
            <CardContent>
              <div className="overflow-x-auto overflow-y-hidden whitespace-nowrap pb-4">
                <canvas ref={canvasRef} width={50 * (goal + 1) + 100} height={300} className="mx-auto rounded-lg shadow-inner"></canvas>
              </div>
            </CardContent>
          </Card>
          <Card className="w-fill h-full shadow-lg">
            <CardContent>
              <div className="grid grid-row-4 w-40 gap-4 mt-4">
                {playerPositions.map((position, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Avatar className="w-9 h-9 mb-2">
                      <AvatarImage src={`/image/koma/koma${index + 1}.png`} alt={`Player ${index + 1}`} />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                    <Progress value={(position / goal) * 100} className="w-full" />
                    <span className="text-sm font-medium mt-1">
                      {position}/{goal}
                      <br />
                      {players[index]?.username}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex w-full h-[300px] justify-center gap-6 items-center">
          <Card className="w-1/2 shadow-lg relative">
            <CardContent className="p-6">
              <div className="absolute top-2 right-4 flex items-center gap-2">
                <span className="text-gray-700 text-sm">残り時間:</span>
                <span className="text-purple-800 text-lg font-bold">{timer}s</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-4">
                <h3 className="text-xl font-bold text-purple-800 mb-2">プレイヤー{players[currentPlayerIndex]?.username}の番</h3>
                <p className="text-lg font-medium text-gray-700 mb-4">{rouletteResult}文字の単語を入力してください</p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-12 h-12 border-2 border-purple-500 rounded-lg bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-800">{lastCharacter}</div>
                  {word.map((_, idx) => (
                    <Input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el!;
                      }}
                      type="text"
                      value={word[idx]}
                      // onChange={(e) => {
                      //   const newWord = [...word];
                      //   newWord[idx] = e.target.value;
                      //   setWord(newWord);
                      // }}
                      onChange={(e) => handleInputChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl font-medium border-2 border-purple-300 focus:border-purple-500 rounded-lg"
                    />
                  ))}
                </div>
                <Button onClick={checkWord} className="w-full max-w-xs text-lg font-bold py-6">
                  確認する
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="w-1/2 h-[300px] shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold text-purple-800 flex items-center gap-2">
                <History className="w-6 h-6" />
                しりとり履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex w-full flex-wrap">{history.join(" → ")}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      {isRouletteLarge && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="text-center bg-white rounded-xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-purple-800 mb-6 flex items-center justify-center gap-2">
              <Gamepad2 className="w-8 h-8" />
              プレイヤー{currentPlayer + 1}の番
            </h2>
            <Roulette onResult={handleRouletteResult} isLarge={true} isCurrentUserTurn={isCurrentUserTurn} currentPlayer={players[currentPlayerIndex]?.username} />
          </div>
        </div>
      )}
      {resultMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="text-center flex items-center justify-center bg-white rounded-xl p-8 shadow-2xl">
            <h2 className="text-5xl font-bold text-purple-800">{resultMessage}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
