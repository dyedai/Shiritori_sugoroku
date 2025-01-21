"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation"; // クエリパラメータ取得用
import { Twitter, Instagram } from "lucide-react";

export default function ResultsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams(); // クエリパラメータを取得

  // クエリパラメータからランキングデータを取得
  const rankingsParam = searchParams.get("rankings");
  const rankings = rankingsParam ? JSON.parse(rankingsParam) : ["ちーむびー", "ちーむしー", "ちーむえー", "ちーむでぃ"];

  // シェアメッセージ (1位を基に動的に生成)
  const shareMessage = encodeURIComponent(
    `しりとりすごろくゲームの結果！

    1位: ${rankings[0]} 🎉　
    2位: ${rankings[1]} 
    3位: ${rankings[2]} 
    4位: ${rankings[3]}`
  );

  // ハンドラー
  const handleHomeClick = () => {
    router.push("/"); // ホームページにリダイレクト
  };

  const handleRetryClick = () => {
    router.push("/wait"); // ゲーム開始画面にリダイレクト
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-white bg-opacity-90 rounded-lg shadow-xl px-16 pb-10 pt-16 space-y-10">
        <h1 className="text-4xl font-bold text-center text-primary mb-16">🏆 結果発表</h1>

        <div className="space-y-6">
          {/* ランキングを表示 */}
          {rankings.map((team, index) => (
            <div key={index} className="flex justify-between text-2xl font-semibold border-b-2 border-gray-300 pb-3">
              <span>{index + 1}位</span>
              <span>{team}</span>
            </div>
          ))}
        </div>

        {/* ホームとリトライボタン */}
        <div className="flex pt-6 space-x-4 w-full">
          <Button variant="ghost" className="text-xl w-1/2 py-7 border border-black" onClick={handleHomeClick}>
            ホームに戻る
          </Button>
          <Button className="text-xl py-7 w-1/2" onClick={handleRetryClick}>
            もう一度プレイ
          </Button>
        </div>

        {/* SNSシェアボタン */}
        <div className="pt-3 flex justify-end space-x-4">
          <a href={`https://twitter.com/intent/tweet?text=${shareMessage}`} target="_blank" rel="noopener noreferrer" className="inline-block text-xl text-black">
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
