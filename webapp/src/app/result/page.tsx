"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Twitter, Instagram } from "lucide-react"; // Icons for social media
import Link from "next/link";

export default function ResultsScreen() {
  const router = useRouter(); // To handle navigation

  // Sample rankings
  const rankings = ["ちーむびー", "ちーむしー", "ちーむえー", "ちーむでぃ"];

  // Share message (this can be dynamic based on rankings)
  const shareMessage = encodeURIComponent("ゲームの結果！1位: " + rankings[0] + " 🎉");

  // Handlers for navigation
  const handleHomeClick = () => {
    router.push("/"); // Redirect to home page
  };

  const handleRetryClick = () => {
    router.push("/game"); // Redirect to game start page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-white bg-opacity-90 rounded-lg shadow-xl px-16 pb-10 pt-16 space-y-10">
        <h1 className="text-4xl font-bold text-center text-primary mb-16">🏆 結果発表</h1>

        <div className="space-y-6">
          {/* Display rankings */}
          {rankings.map((team, index) => (
            <div key={index} className="flex justify-between text-2xl font-semibold border-b-2 border-gray-300 pb-3">
              <span>{index + 1}位</span>
              <span>{team}</span>
            </div>
          ))}
        </div>

        {/* Buttons for Home and Retry */}
        <div className="flex pt-6 space-x-4 w-full">
          <Button variant="ghost" className="text-xl  w-1/2 py-7 border border-black" onClick={handleHomeClick}>
            <Link href="/">ホームに戻る</Link>
          </Button>
          <Button className="text-xl py-7 w-1/2" onClick={handleRetryClick}>
            <Link href="/wait">もう一度プレイ</Link>
          </Button>
        </div>

        {/* Social Media Share Buttons */}
        <div className="pt-3 flex justify-end space-x-4">
          <a href={`https://twitter.com/intent/tweet?text=${shareMessage}`} target="_blank" rel="noopener noreferrer" className="inline-block text-xl text-black ">
            <Twitter className="" />
          </a>
          <a href={`https://www.instagram.com/?url=https://your-game.com`} target="_blank" rel="noopener noreferrer" className="inline-block text-xl text-black">
            <Instagram className="" />
          </a>
        </div>
      </div>
    </div>
  );
}
