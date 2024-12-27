"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const playersData = searchParams.get("players");
  const players = playersData
    ? JSON.parse(decodeURIComponent(playersData))
    : [];
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerPositions, setPlayerPositions] = useState<number[]>(
    players.map(() => 0)
  );
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [rouletteResult, setRouletteResult] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(30);

  const goal = 100; // ゴールまでの距離

  // 現在のユーザー情報を取得
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

  // WebSocket接続とゲームロジック
  useEffect(() => {
    if (!roomId || players.length === 0) {
      console.error("Invalid room or players data.");
      router.push("/");
      return;
    }

    const ws = new WebSocket(`ws://localhost:8080/game?roomId=${roomId}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected.");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "gameUpdate") {
        setPlayerPositions(data.positions);
        setCurrentPlayerIndex(data.currentPlayerIndex);
      } else if (data.type === "rouletteResult") {
        setRouletteResult(data.result);
      } else if (data.type === "gameOver") {
        alert(`Game over! Winner: ${players[data.winner].username}`);
        router.push("/");
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed.");
    };

    return () => {
      ws.close();
    };
  }, [roomId, players, router]);

  // カウントダウン処理
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setCurrentPlayerIndex(
            (prevIndex) => (prevIndex + 1) % players.length
          );
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayerIndex, players.length]);

  // ルーレットを回すボタンを押したときの処理
  const handleRouletteSpin = () => {
    if (!socket) return;

    const result = Math.floor(Math.random() * 6) + 1; // 1〜6のランダム値
    setRouletteResult(result);

    const updatedPositions = [...playerPositions];
    updatedPositions[currentPlayerIndex] = Math.min(
      updatedPositions[currentPlayerIndex] + result,
      goal
    );

    setPlayerPositions(updatedPositions);

    // サーバーに更新を送信
    socket.send(
      JSON.stringify({
        type: "updatePosition",
        playerIndex: currentPlayerIndex,
        position: updatedPositions[currentPlayerIndex],
      })
    );

    // 次のプレイヤーに切り替え
    setTimeout(() => {
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      setRouletteResult(null); // リセット
      setCountdown(30); // カウントダウンをリセット
    }, 2000);
  };

  // 現在のユーザーが順番かどうかをチェック
  const isCurrentUserTurn = players[currentPlayerIndex]?.userId === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex flex-col items-center justify-center p-6">
      <div className="relative max-w-4xl w-full bg-white/90 rounded-lg shadow-xl px-8 pb-10 pt-16 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          ゲーム開始！部屋ID: {roomId}
        </h1>

        <div className="text-center text-xl font-bold text-blue-700">
          現在の順番: プレイヤー {players[currentPlayerIndex]?.username}
        </div>

        <div className="flex justify-between items-center mt-6">
          {players.map((player, index) => (
            <div
              key={player.userId}
              className={`flex flex-col items-center ${
                index === currentPlayerIndex ? "text-red-500" : "text-gray-800"
              }`}
            >
              <span className="font-bold">{player.username}</span>
              <span>
                {playerPositions[index]}/{goal}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center mt-8">
          {isCurrentUserTurn && (
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold"
              onClick={handleRouletteSpin}
              disabled={rouletteResult !== null}
            >
              {rouletteResult !== null
                ? `ルーレット結果: ${rouletteResult}`
                : "ルーレットを回す"}
            </button>
          )}
        </div>

        <div className="text-center mt-8">
          <span className="text-gray-600">残り時間: {countdown}秒</span>
        </div>
      </div>
    </div>
  );
}
