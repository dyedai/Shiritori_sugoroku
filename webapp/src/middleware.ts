import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

// 保護するパスのリスト
const protectedRoutes = ["/", "/game", "/result", "/wait"];
const publicRoutes = ["/login", "/register"]; // ログイン済みの場合にリダイレクトを適用するページ

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // リクエストURLのパス名を取得
  const { pathname } = request.nextUrl;

  try {
    if (token) {
      // トークンがある場合: 検証を行う
      await jwtVerify(token, SECRET_KEY);

      // ユーザーがログイン済みかつ publicRoutes にアクセスする場合
      if (publicRoutes.includes(pathname)) {
        // ホームページにリダイレクト
        return NextResponse.redirect(new URL("/", request.url));
      }

      // トークンが有効かつ保護されたルートの場合はそのまま進む
      if (protectedRoutes.includes(pathname)) {
        return NextResponse.next();
      }
    } else {
      // トークンがない場合
      if (protectedRoutes.includes(pathname)) {
        // 保護されたページなら /login にリダイレクト
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  } catch (err) {
    console.error("Token verification failed:", err);

    // トークンが無効の場合も /login にリダイレクト
    if (protectedRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // その他の場合はそのまま進む
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/game", "/result", "/wait", "/login", "/register"], // Middleware を適用するパス
};
