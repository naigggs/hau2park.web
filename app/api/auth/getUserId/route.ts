import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("user_id"); // Adjust based on your header structure
  return NextResponse.json({ userId });
}
