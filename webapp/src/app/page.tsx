"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dice5, Info, LogOut } from "lucide-react";
import Link from "next/link";

export default function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // useRouterフックを使用

  // Function to handle logout confirmation and redirect
  const handleLogout = () => {
    // ログアウト処理後に /login にリダイレクト
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-15">
      <div className="max-w-3xl w-full bg-white bg-opacity-90 rounded-lg shadow-2xl p-12 space-y-12">
        <h1 className="text-5xl font-bold text-center text-primary  duration-1000 pt-6">
          すごろく＆しりとり
        </h1>

        <div className="flex justify-center space-x-8 items-center pb-3">
          <div
            className="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform"
            aria-label="サイコロ（5の目）"
            role="button"
            tabIndex={0}
          >
            <div className="grid grid-cols-3 gap-3">
              {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((dot, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 ${dot ? "bg-white rounded-full" : ""}`}
                ></div>
              ))}
            </div>
          </div>
          <span className="text-5xl font-semibold">→</span>
          <div className="flex items-center">
            <span className="text-5xl font-semibold text-primary animate-pulse">
              ちーむびー
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <Link href="/wait">
            <Button className="w-full text-2xl py-8" size="lg">
              <Dice5 className="mr-4 h-8 w-8" /> ゲームスタート
            </Button>
          </Link>

          {/* Dialog for Game Explanation */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-2xl py-8"
                size="lg"
              >
                <Info className="mr-4 h-8 w-8" /> ゲーム説明
              </Button>
            </DialogTrigger>
            <DialogContent className="p-10">
              <DialogHeader>
                <DialogTitle className="text-2xl">ゲーム説明</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>
                  このゲームは基本ルールをすごろくとし、そこにしりとりの要素を加えたものです。
                </p>
                <ol className="list-decimal ml-5">
                  <li>
                    しりとりは「り」から開始。さいころを振る順番はランダムで決定。
                  </li>
                  <li>
                    サイコロの出目に対応した文字数でしりとりを行う（例：出目が3なら「リンゴ」など）。
                  </li>
                  <li>
                    次の人もサイコロを振って前の人の言葉に応じたしりとりを同様に行う。制限時間は
                    <a className="text-red-500">30秒</a>。
                    <ul className="list-disc ml-5">
                      <li>
                        正しく回答できない、制限時間を超える、指定の文字数で答えられない場合はその人は進めない。
                      </li>
                      <li>
                        辞書APIで判定。不正な回答には「回答が遅い」「文字数が足りない」「辞書にない言葉」がある。
                      </li>
                      <li>
                        正しい回答を行えた場合のみ、出目の数だけ進む。全員が同じ文字で回答できない場合、ランダムで先頭の文字が変更される。
                      </li>
                    </ul>
                  </li>
                  <li>(参加人数)-1人がゴールするとゲーム終了。</li>
                </ol>

                {/* Placeholder for Special Square Effects */}
                <div className="pt-4">
                  <h3 className="text-lg font-semibold">特殊マスの効果</h3>
                  <p>
                    ここに特殊マスの効果を説明します。例えば、特定のマスに止まると○○の効果が発動します。
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Logout button with Alert Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="secondary"
                className="w-full text-2xl py-8"
                size="lg"
              >
                <LogOut className="mr-4 h-8 w-8" /> ログアウト
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ログアウト確認</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="space-y-2">
                <p>ログアウトしてもよろしいですか？</p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  ログアウト
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
