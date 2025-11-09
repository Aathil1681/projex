import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { cookieKeys } from "./config/cookie.config";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  try {
    const session = (await cookies()).get(cookieKeys.USER_TOKEN)?.value;

    let isSessionValid = false;

    const url = request.nextUrl.pathname;

    const secret = new TextEncoder().encode(process?.env?.JWT_SECRET!);

    if (session) {
      const payload = (await jwtVerify(session, secret)).payload;
      isSessionValid = payload ? true : false;
      console.log({ payload });
    }

    const onlyPublicRoutes = [
      "/register",
      "/login",
      "forgot-password",
      "reset-password",
    ];

    //check if it is not user and requested url is not mentioned in onlyPrivateRoute
    //This will redirect user to requested page after login is completed

    if (!session && !onlyPublicRoutes.includes(url)) {
      //proceed

      let nextUrl = "/login";
      nextUrl += `?redirect_to=${url}`;

      return NextResponse.redirect(new URL(nextUrl, request.url));
    }

    //Avoid login users from regiter page

    if (session && onlyPublicRoutes.includes(url)) {
      //proceed

      let url = "/"; //redirect to home

      return NextResponse.redirect(new URL(url, request.url));
    }
    //Authenticated users can access anywhere
    if (session && !onlyPublicRoutes.includes(url)) {
      NextResponse.next();
    }
  } catch (error) {
    const err: any = error;

    (await cookies()).delete(cookieKeys.USER_TOKEN);

    return NextResponse.redirect(new URL("/login", request.url));
  }
}
export const config = {
  matcher: ["/admin/:paths*", "/register/:paths*", "/login/:paths*"],
};
