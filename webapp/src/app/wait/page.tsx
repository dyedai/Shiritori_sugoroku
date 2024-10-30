"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WaitScreen() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(5); // Start countdown from 5
  const countdownSound = new Audio("/sounds/3、2、1、0.mp3");

  const users = ["ちーむびー", "ちーむしー", "ちーむえー", "ちーむでぃ"];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerCount((prev) => Math.min(prev + Math.round(Math.random()), 4));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (playerCount === 4) {
      setIsReady(true);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            countdownSound.play(); // Play sound when countdown reaches 0
            router.push("/game"); // Navigate to the game when countdown is finished
            return 0;
          }

          // Play the countdown sound at the beginning of the countdown
          if (prev < 5) {
            countdownSound.play();
          }

          return prev - 1;
        });
      }, 1000);
    }
  }, [playerCount, router]);

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-4 relative">
      <div className="relative max-w-2xl w-full bg-white/90 rounded-lg shadow-xl px-8 pb-10 pt-16 space-y-10">
        <h1 className="text-4xl font-bold text-black text-center mb-16">{isReady ? `${playerCount}人が待機中` : `${playerCount}人が待機中`}</h1>

        <div className="space-y-4">
          {users.map((team, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: index < playerCount ? 1 : 0.3 }}
              className={`flex justify-between items-center text-2xl font-bold py-4 px-6 rounded-md ${index < playerCount ? "bg-gray-400/10" : "bg-gray-400/5"} border-l-8 border-blue-500`}
            >
              <span className="text-black">#{index + 1}</span>
              <span className="text-black">{index < playerCount ? team : "募集中…"}</span>
            </motion.div>
          ))}
        </div>

        <div className="pt-6 w-full">
          <Button variant="outline" onClick={handleHomeClick} className="w-full py-7 text-xl font-bold bg-transparent border-2 border-black text-black hover:bg-black/10">
            ホームに戻る
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isReady && (
          <motion.div initial={{ opacity: 0, scale: 1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-full w-80 h-80 flex items-center justify-center shadow-2xl"
            >
              <div className="text-center p-5">
                <h2 className="text-2xl font-bold mb-6 pt-7 ">ゲームスタートまで</h2>
                <p className="text-7xl font-bold text-blue-600">{countdown}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
