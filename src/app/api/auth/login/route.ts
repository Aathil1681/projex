import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { userLoginSchema } from "../../../../lib/schema";
import generateToken from "../../../helpers/generateToken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = userLoginSchema.parse(await request.json());

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password)
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid)
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );

    const token = generateToken(user.id);

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });

    response.cookies.set("USER_TOKEN", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
