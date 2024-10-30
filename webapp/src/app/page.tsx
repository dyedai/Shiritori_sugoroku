"use client";

import { Button } from "@/components/ui/button";
import { Dice5, Info, LogOut } from "lucide-react";
import Link from "next/link";

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-br flex flex-col items-center justify-center p-15">
      <div className="max-w-3xl w-full bg-white bg-opacity-90 rounded-lg shadow-2xl p-12 space-y-12">
        <h1 className="text-6xl font-bold text-center text-primary animate-bounce duration-1000 pt-6 ">すごろく＆しりとり</h1>

        <div className="flex justify-center space-x-8 items-center pb-3">
          <div
            className="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform"
            aria-label="サイコロ（5の目）"
            role="button"
            tabIndex={0}
          >
            <div className="grid grid-cols-3 gap-3">
              {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((dot, index) => (
                <div key={index} className={`w-6 h-6 ${dot ? "bg-white rounded-full" : ""}`}></div>
              ))}
            </div>
          </div>
          <span className="text-5xl font-semibold">→</span>
          <div className="flex items-center">
            <span className="text-5xl font-semibold text-primary animate-pulse">ちーむびー</span>
          </div>
        </div>

        <div className="space-y-6">
          <Button className="w-full text-2xl py-8" size="lg">
            <Dice5 className="mr-4 h-8 w-8" /> ゲームスタート
          </Button>
          <Button variant="outline" className="w-full text-2xl py-8" size="lg">
            <Info className="mr-4 h-8 w-8" /> <Link href="/explanation">ゲーム説明</Link>
          </Button>
          <Button variant="secondary" className="w-full text-2xl py-8" size="lg">
            <LogOut className="mr-4 h-8 w-8" /> <Link href="/login">ログアウト</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
