import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userRegisterSchema } from "../../../../lib/schema";
import generateToken from "../../../helpers/generateToken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userRegisterSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser)
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );

    const hashedPassword = await hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: { ...validatedData, password: hashedPassword },
    });

    const token = generateToken(newUser.id);

    return NextResponse.json(
      { user: newUser, token, message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
