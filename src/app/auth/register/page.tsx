// app/auth/register/page.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userRegisterSchema, UserRegisterType } from "../../../lib/schema";
import Link from "next/link";
import Cookie from "js-cookie";
import { cookieKeys } from "../../../config/cookie.config";
import { useRouter } from "next/navigation";
import api from "@/app/helpers/baseApi";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import { SiOpenproject } from "react-icons/si";
import { toast } from "sonner";

const RegisterPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterType>({
    resolver: zodResolver(userRegisterSchema),
  });

  const onSubmit = async (data: UserRegisterType) => {
    try {
      const res = await api.post("auth/register", data);
      const token = res.data.token;
      Cookie.set(cookieKeys.USER_TOKEN, token);
      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  // Icons
  const UserIcon = () => (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const EmailIcon = () => (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
      />
    </svg>
  );

  const PasswordIcon = () => (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden fixed top-0 left-0">
      {/* Left Side - Graphics Panel inside white padding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 lg:translate-x-10">
        <div className="bg-white rounded-3xl p-8 w-full h-[120%] flex items-center justify-center">
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800">
            {/* Decorative background circles */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full mix-blend-soft-light -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full mix-blend-soft-light translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center text-white p-10 w-full">
              <div className="max-w-md">
                {/* Graphic illustration */}
                <div className="mb-6 relative">
                  <div className="w-64 h-64 relative">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"></div>

                    {/* Project board */}
                    <div className="absolute top-6 left-6 right-6 h-4 bg-white/30 rounded-full"></div>

                    {/* Team collaboration */}
                    <div className="absolute top-16 left-8 w-8 h-8 bg-white/40 rounded-full"></div>
                    <div className="absolute top-16 left-20 w-8 h-8 bg-white/30 rounded-full"></div>
                    <div className="absolute top-16 left-32 w-8 h-8 bg-white/20 rounded-full"></div>

                    {/* Project cards */}
                    <div className="absolute top-32 left-6 w-24 h-12 bg-white/25 rounded-lg"></div>
                    <div className="absolute top-32 right-6 w-24 h-8 bg-white/35 rounded-lg"></div>
                    <div className="absolute bottom-16 left-6 right-6 h-10 bg-white/20 rounded-lg"></div>

                    {/* Progress indicator */}
                    <div className="absolute bottom-8 left-6 right-6 h-2 bg-white/20 rounded-full">
                      <div className="w-1/2 h-full bg-green-400 rounded-full"></div>
                    </div>

                    {/* Floating elements */}
                    <div className="absolute top-4 -right-2 w-4 h-4 bg-green-400 rounded-full"></div>
                    <div className="absolute bottom-20 -left-2 w-5 h-5 bg-yellow-400 rounded-full"></div>
                    <div className="absolute bottom-10 right-12 w-2 h-2 bg-pink-400 rounded-full"></div>
                  </div>
                </div>

                {/* Text */}
                <h2 className="text-4xl font-bold mb-3">Join ProjeX Today</h2>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  Start your project management journey with our powerful
                  platform. Organize tasks, collaborate with your team, and
                  achieve your project goals efficiently.
                </p>

                {/* Feature list */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-3 h-3 mr-1 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Team Collaboration
                  </div>

                  <div className="flex items-center justify-center">
                    <svg
                      className="w-3 h-3 mr-1 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Task Management
                  </div>

                  <div className="flex items-center justify-center">
                    <svg
                      className="w-3 h-3 mr-1 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Progress Tracking
                  </div>

                  <div className="flex items-center justify-center">
                    <svg
                      className="w-3 h-3 mr-1 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Easy Setup
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-16 xl:px-20  relative">
        {/* Logo moved to top right */}
        <div className="absolute top-8 right-8 flex items-center group">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl shadow-lg transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-105 group-hover:shadow-xl">
            <SiOpenproject className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="font-serif ml-3 text-2xl font-bold text-gray-900 transition-all duration-300 group-hover:text-blue-600">
            ProjeX
          </span>
        </div>

        {/* Scrollable form container */}
        <div className="w-full max-w-sm mt-20 max-h-screen overflow-y-auto pb-10 lg:-translate-x-15">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create account
            </h1>
            <p className="text-gray-600 text-sm">
              Sign up to get started with your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Enter your full name"
              {...register("name")}
              error={errors.name}
              icon={<UserIcon />}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              error={errors.email}
              icon={<EmailIcon />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              {...register("password")}
              error={errors.password}
              icon={<PasswordIcon />}
            />

            <div className="flex items-center text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Terms and Conditions
                </Link>
              </span>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Create account
            </Button>

            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
