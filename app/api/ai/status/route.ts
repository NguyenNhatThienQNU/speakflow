import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
/** Cho giao diện biết server đã có sẵn khoá Gemini (biến môi trường) hay chưa */
export async function GET() {
  return NextResponse.json({ serverKey: !!process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
}
