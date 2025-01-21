import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your_secret_key"
);

export async function GET(request: NextRequest) {
  try {
    // リクエストヘッダーまたはクッキーからトークンを取得
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication token is missing" },
        { status: 401 }
      );
    }

    // トークンを検証
    const { payload } = await jwtVerify(token, SECRET_KEY);

    // トークンからユーザーIDを取得
    const userId = payload.id as number;

    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // データベースからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 必要な情報をレスポンスとして返す
    return NextResponse.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
