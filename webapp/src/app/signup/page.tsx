"use client";
import Link from "next/link";
import { useState } from "react";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMessage("すべてのフィールドに入力してください");
      return;
    }

    if (password.length < 4) {
      setErrorMessage("パスワードは4文字以上で入力してください");
      return;
    }

    // ログインロジックをここに記述（例：サーバーへデータ送信）
    setErrorMessage(""); // エラーがない場合はリセット
    console.log("ユーザー名:", username);
    console.log("パスワード:", password);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex-col items-center justify-center">
      <div className="mt-16 w-full md:mt-0 md:w-2/5">
        <div className="relative z-10 h-auto overflow-hidden rounded-lg border-b-2 border-gray-300 bg-white  px-10 py-16 shadow-2xl">
          <h3 className="mb-6 text-center text-2xl font-bold">アカウント登録</h3>
          <form onSubmit={handleSubmit}>
            <p className="text-red-500">{errorMessage}</p>
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
              <button className="mt-5 w-full rounded-lg bg-black px-3 py-4 font-medium text-white" type="submit">
                アカウント登録
              </button>
            </div>
          </form>
          <p className="link link-primary m-4 text-center">
            すでにアカウントをお持ちの場合は
            <Link className="text-blue-700 font-bold" href="/login">
              こちら
            </Link>
            からログインしてください
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
