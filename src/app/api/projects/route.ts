import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { projectCreateSchema } from "../../../lib/schema";
import { verifyToken } from "@/app/helpers/verifyToken";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { owner: true, tasks: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Get Projects Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch projects" },
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
    const data = projectCreateSchema.parse(body);

    const project = await prisma.project.create({
      data: { ...data, ownerId: userId },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json(
      { message: "Project creation failed" },
      { status: 500 }
    );
  }
}
