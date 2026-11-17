import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
/** Cho giao diện biết server đã có sẵn khoá Gemini (biến môi trường) hay chưa */
export async function GET() {
  const model = (process.env.GEMINI_MODEL || "gemini-3.5-flash-lite").replace(/[^\x20-\x7E]/g, "").trim();
  const serverKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.replace(/[^\x20-\x7E]/g, "").trim());
  return NextResponse.json({ serverKey, model });
}
