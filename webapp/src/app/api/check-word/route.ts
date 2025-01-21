import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "単語を指定してください。" }, { status: 400 });
  }

  try {
    const url = `https://www.weblio.jp/content/${encodeURIComponent(word)}`;
    const response = await axios.get(url);

    // Weblioの応答から単語の存在を判定
    if (response.data.includes("該当する単語が見つかりません")) {
      return NextResponse.json({ exists: false });
    } else {
      return NextResponse.json({ exists: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Weblioへの接続に失敗しました。" }, { status: 500 });
  }
}
