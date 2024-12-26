"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function WaitScreen() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<
    { userId: string; username: string }[]
  >([]); // Updated to store both userId and username
  const [countdown, setCountdown] = useState<number | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  // Fetch authenticated user info
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const user = await res.json();
          setUserName(user.username);
          setUserId(user.id); // Store user ID
          console.log("Authenticated user:", user);
        } else {
          console.error("Failed to fetch user info:", await res.json());
          router.push("/login"); // Redirect if user is not authenticated
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        router.push("/login"); // Redirect if fetch fails
      }
    }

    fetchUser();
  }, [router]);

  // WebSocket connection and events
  useEffect(() => {
    if (!userName || !userId) return;

    const ws = new WebSocket("ws://localhost:8080/waiting");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected.");
      ws.send(
        JSON.stringify({ type: "join", userName: userName, userId: userId }) // Send username and userid to backend
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "playerUpdate") {
        setPlayerCount(data.playerCount);
        setPlayers(data.players || []); // Update the players array from the backend
        if (data.playerCount >= 4) setIsReady(true);
      } else if (data.type === "startGame") {
        setCountdown(5);
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev !== null && prev > 1) return prev - 1;
            clearInterval(interval);
            router.push("/game");
            return null;
          });
        }, 1000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected.");
    };

    return () => {
      ws.close();
    };
  }, [router, userName, userId]);

  const handleHomeClick = () => {
    router.push("/");
  };

  if (!userName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <h1 className="text-xl font-bold">ユーザー情報を取得中...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-4 relative">
      <div className="relative max-w-2xl w-full bg-white/90 rounded-lg shadow-xl px-8 pb-10 pt-16 space-y-10">
        <h1 className="text-4xl font-bold text-black text-center mb-16">
          {playerCount}人が待機中
        </h1>

        <div className="space-y-4">
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: index < playerCount ? 1 : 0.3 }}
                className={`flex justify-between items-center text-2xl font-bold py-4 px-6 rounded-md ${
                  index < playerCount ? "bg-gray-400/10" : "bg-gray-400/5"
                } border-l-8 border-blue-500`}
              >
                <span className="text-black">#{index + 1}</span>
                <span className="text-black">
                  {players[index]?.username || "募集中…"}
                </span>
              </motion.div>
            ))}
        </div>

        <div className="pt-6 w-full">
          <Button
            variant="outline"
            onClick={handleHomeClick}
            className="w-full py-7 text-xl font-bold bg-transparent border-2 border-black text-black hover:bg-black/10"
          >
            ホームに戻る
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isReady && countdown !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-full w-80 h-80 flex items-center justify-center shadow-2xl"
            >
              <div className="text-center p-5">
                <h2 className="text-2xl font-bold mb-6 pt-7 ">
                  ゲームスタートまで
                </h2>
                <p className="text-7xl font-bold text-blue-600">{countdown}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
