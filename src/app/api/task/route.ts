import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { taskCreateSchema } from "../../../lib/schema";
import { verifyToken } from "../../helpers/verifyToken";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: { project: true, assignee: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("USER_TOKEN")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = verifyToken(token);
    if (!userId)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const data = taskCreateSchema.parse(body);

    const task = await prisma.task.create({
      data: { ...data, ownerId: userId },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create Task Error:", error);
    return NextResponse.json(
      { message: "Task creation failed" },
      { status: 500 }
    );
  }
}
