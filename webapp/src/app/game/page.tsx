"use client";
import { useEffect, useRef, useState } from "react";
import Roulette from "../roulette/Roulette";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const goal = 100;

export default function GamePage() {
  const searchParams = new URLSearchParams(window.location.search);
  const players = JSON.parse(searchParams.get("players") || "[]");
  const roomId = searchParams.get("roomId");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerPositions, setPlayerPositions] = useState<number[]>(
    players.map(() => 0)
  );
  const [rouletteResult, setRouletteResult] = useState<number | null>(null);
  const [isRouletteVisible, setIsRouletteVisible] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

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
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
        window.location.href = "/login";
      }
    }
    fetchUser();
  }, []);

  // Setup WebSocket connection
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

      if (data.type === "rouletteResult") {
        setRouletteResult(data.result);
      }
    };

    ws.onclose = () => console.log("WebSocket closed");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => {
      ws.close();
    };
  }, [roomId, userId, userName]);

  // Trigger roulette spin
  const triggerRouletteSpin = () => {
    if (socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "startRoulette",
        })
      );
    }
  };

  // Handle the end of the roulette spin
  useEffect(() => {
    if (rouletteResult !== null) {
      setTimeout(() => {
        setPlayerPositions((prev) => {
          const updatedPositions = [...prev];
          updatedPositions[currentPlayerIndex] = Math.min(
            updatedPositions[currentPlayerIndex] + rouletteResult,
            goal
          );
          return updatedPositions;
        });

        setResultMessage(
          `${
            players[currentPlayerIndex]?.username || "Player"
          } advanced ${rouletteResult} steps!`
        );

        setTimeout(() => {
          setResultMessage(null);
          setIsRouletteVisible(false);
          setTimeout(() => {
            setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
            setRouletteResult(null);
            setIsRouletteVisible(true);
          }, 1000);
        }, 2000);
      }, 4000); // Wait 4 seconds for the spin to finish
    }
  }, [rouletteResult, currentPlayerIndex, players.length]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200 p-6">
      {/* Player Progress */}
      <div className="flex w-full justify-center gap-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4">
              {playerPositions.map((position, index) => (
                <div key={index} className="text-center">
                  <Avatar className="w-10 h-10 mb-2">
                    <AvatarImage
                      src={`/image/koma/koma${index + 1}.png`}
                      alt={`Player ${index + 1}`}
                    />
                    <AvatarFallback>
                      {players[index]?.username || `Player ${index + 1}`}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-bold">
                    {players[index]?.username || `Player ${index + 1}`}
                  </p>
                  <Progress
                    value={(position / goal) * 100}
                    className="w-32 mt-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roulette */}
      {isRouletteVisible && (
        <Roulette
          onSpin={triggerRouletteSpin}
          isSpinning={rouletteResult !== null}
          result={rouletteResult}
          currentPlayer={players[currentPlayerIndex]?.username || ""}
          isCurrentUserTurn={players[currentPlayerIndex]?.username === userName}
        />
      )}

      {/* Result Message */}
      {resultMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="text-center bg-white p-6 rounded-xl shadow-2xl">
            <h2 className="text-4xl font-bold text-purple-800">
              {resultMessage}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}
