"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function WaitScreen() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(0);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userName, setUserName] = useState<string>("");

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
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        router.push("/login");
      }
    }

    fetchUser();
  }, [router]);

  // WebSocket connection and events
  useEffect(() => {
    if (!userName) return;

    const ws = new WebSocket("ws://localhost:8080/waiting");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected.");
      ws.send(JSON.stringify({ type: "join", userName }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "playerUpdate") {
        setPlayerCount(data.playerCount);
        setPlayerNames(data.playerNames || []);
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
  }, [router, userName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-4 relative">
      <div className="relative max-w-2xl w-full bg-white/90 rounded-lg shadow-xl px-8 pb-10 pt-16 space-y-10">
        <h1 className="text-4xl font-bold text-black text-center mb-16">
          {playerCount}人が待機中
        </h1>

        <div className="space-y-4">
          {Array(4)
            .fill("募集中…")
            .map((_, index) => (
              <motion.div
                key={index}
                className={`flex justify-between items-center text-2xl font-bold py-4 px-6 rounded-md ${
                  index < playerCount ? "bg-gray-400/10" : "bg-gray-400/5"
                }`}
              >
                <span>#{index + 1}</span>
                <span>{playerNames[index] || `Player ${index + 1}`}</span>
              </motion.div>
            ))}
        </div>
      </div>

      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="bg-white rounded-full w-80 h-80 flex items-center justify-center shadow-2xl">
              <h2 className="text-7xl font-bold text-blue-600">{countdown}</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
