import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET route to fetch users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        users,
        message: "Users fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Users Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
