"use client";

import { useState } from "react";

export default function Home() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ひらがな判定関数
  const isHiragana = (text: string) => /^[\u3040-\u309Fー]+$/.test(text);

  const checkWord = async () => {
    if (!word.trim()) {
      setResult("単語を入力してください。");
      return;
    }

    // 入力がひらがなかどうかをチェック
    if (!isHiragana(word)) {
      setResult("ひらがなを入力してください。");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/check-word?word=${encodeURIComponent(word)}`);
      const data = await response.json();

      if (data.exists) {
        setResult("この単語は存在します！");
      } else {
        setResult("この単語は見つかりませんでした。");
      }
    } catch (error) {
      setResult("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">単語の存在チェック</h1>
      <input type="text" value={word} onChange={(e) => setWord(e.target.value)} placeholder="ひらがなで単語を入力してください" className="border rounded-lg p-2 mb-4 w-full max-w-sm" />
      <button onClick={checkWord} disabled={loading} className={`px-4 py-2 text-white rounded-lg ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}>
        {loading ? "確認中..." : "確認する"}
      </button>
      {result && <p className="mt-4 text-lg">{result}</p>}
    </div>
  );
}
