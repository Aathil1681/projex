// app/api/debug/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path to your prisma client

export async function GET() {
  try {
    // print ENV (only the first 80 chars so you don't leak secrets to public logs)
    console.log(
      "process.env.DATABASE_URL:",
      (process.env.DATABASE_URL || "").slice(0, 80)
    );

    await prisma.$connect();
    await prisma.$disconnect();
    return NextResponse.json({ status: "ok", message: "DB connected" });
  } catch (error: any) {
    console.error("DEBUG DB ERROR:", error);
    return NextResponse.json({
      status: "error",
      message: error?.message ?? String(error),
    });
  }
}
