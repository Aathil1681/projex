import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { taskUpdateSchema } from "../../../../lib/schema";
import { verifyToken } from "../../../helpers/verifyToken";

// Helper to extract ID from URL
function getIdFromUrl(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  return segments[segments.length - 1]; // last part of URL
}

// GET task by ID
export async function GET(request: NextRequest) {
  try {
    const id = getIdFromUrl(request);

    if (!id) {
      return NextResponse.json(
        { message: "Task ID is required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Get Task Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// UPDATE task
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("USER_TOKEN")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    verifyToken(token);

    const id = getIdFromUrl(request);
    if (!id)
      return NextResponse.json(
        { message: "Task ID is required" },
        { status: 400 }
      );

    const body = await request.json();
    const data = taskUpdateSchema.parse(body);

    const updatedTask = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Update Task Error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("USER_TOKEN")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    verifyToken(token);

    const id = getIdFromUrl(request);
    if (!id)
      return NextResponse.json(
        { message: "Task ID is required" },
        { status: 400 }
      );

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error: any) {
    console.error("Delete Task Error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deletion failed" }, { status: 500 });
  }
}
