"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginRequest, ErrorResponse } from "@/types/auth";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const body: LoginRequest = { username, password };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData: ErrorResponse = await res.json();
        throw new Error(errorData.message);
      }

      // ログイン成功後にリダイレクト
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex-col items-center justify-center">
      <div className="mt-16 w-full md:mt-0 md:w-2/5">
        <div className="relative z-10 h-auto overflow-hidden rounded-lg border-b-2 border-gray-300 bg-white px-10 py-16 shadow-2xl">
          <h3 className="mb-6 text-center text-2xl font-bold">ログイン</h3>
          <form onSubmit={handleLogin}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <label>
              ユーザー名
              <input
                type="text"
                className="mb-4 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="ユーザー名を入力"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              パスワード
              <input
                type="password"
                className="mb-4 block w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <div className="block">
              <button
                className="mt-5 w-full rounded-lg bg-black px-3 py-4 font-medium text-white"
                type="submit"
              >
                ログイン
              </button>
            </div>
          </form>
          <p className="link link-primary m-4 text-center">
            アカウントをお持ちでない方は
            <Link className="text-blue-700 font-bold" href="/signup">
              こちら
            </Link>
            から登録してください
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
