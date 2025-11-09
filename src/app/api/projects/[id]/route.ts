import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { projectUpdateSchema } from "../../../../lib/schema";
import { verifyToken } from "../../../helpers/verifyToken";

// Helper to extract ID from URL
function getIdFromUrl(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  return segments[segments.length - 1]; // last part of URL
}

// GET project by ID
export async function GET(request: NextRequest) {
  try {
    const id = getIdFromUrl(request);

    if (!id) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { tasks: true, owner: true },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Get Project Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// UPDATE project
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("USER_TOKEN")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    verifyToken(token);

    const id = getIdFromUrl(request);
    if (!id)
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );

    const body = await request.json();
    const data = projectUpdateSchema.parse(body);

    const updated = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Project Error:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

// DELETE project
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("USER_TOKEN")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    verifyToken(token);

    const id = getIdFromUrl(request);
    if (!id)
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return NextResponse.json({ message: "Deletion failed" }, { status: 500 });
  }
}
