import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userRegisterSchema } from "@/lib/schema";
import generateToken from "@/app/helpers/generateToken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = userRegisterSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Determine role (check adminKey)
    const role =
      body.adminKey && body.adminKey === process.env.ADMIN_KEY
        ? "ADMIN"
        : "USER";

    // Create user with only allowed fields
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role,
      },
    });

    // Generate JWT token
    const token = generateToken(newUser.id);

    return NextResponse.json(
      { user: newUser, token, message: "Registration successful" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
