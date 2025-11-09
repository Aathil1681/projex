// app/auth/login/page.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema, UserLoginType } from "../../../lib/schema";
import Link from "next/link";
import Cookie from "js-cookie";
import { cookieKeys } from "../../../config/cookie.config";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input";
import api from "@/app/helpers/baseApi";
import Button from "@/app/components/Button";
import { SiOpenproject } from "react-icons/si";
import { toast } from "sonner";

const LoginPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserLoginType>({
    resolver: zodResolver(userLoginSchema),
  });

  const onSubmit = async (data: UserLoginType) => {
    try {
      const res = await api.post("auth/login", data);
      const token = res.data.token;
      Cookie.set(cookieKeys.USER_TOKEN, token);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  // Icons
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
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-16 xl:px-20 lg:translate-x-10 relative">
        <div className="absolute top-8 left-8 flex items-center group">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-105 group-hover:shadow-xl">
            <SiOpenproject className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="font-serif ml-3 text-2xl font-bold text-gray-900 transition-all duration-300 group-hover:text-blue-600">
            ProjeX
          </span>
        </div>

        <div className="w-full max-w-sm mt-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Enter your password"
              {...register("password")}
              error={errors.password}
              icon={<PasswordIcon />}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Sign in
            </Button>

            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Graphics Panel inside white padding */}
      <div className="hidden lg:flex flex-1  items-center justify-center p-8 lg:-translate-x-15">
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
                    <div className="absolute top-6 left-6 right-6 h-4 bg-white/30 rounded-full"></div>
                    <div className="absolute top-5 left-8 w-16 h-6 bg-white/40 rounded-md"></div>
                    <div className="absolute top-5 right-12 w-10 h-6 bg-white/50 rounded-md"></div>
                    <div className="absolute top-16 left-6 right-6 h-8 bg-white/20 rounded-lg"></div>
                    <div className="absolute top-28 left-6 right-6 h-8 bg-white/20 rounded-lg"></div>
                    <div className="absolute top-40 left-6 right-6 h-8 bg-white/20 rounded-lg"></div>
                    <div className="absolute bottom-16 left-6 right-6 h-2 bg-white/20 rounded-full">
                      <div className="w-3/4 h-full bg-green-400 rounded-full"></div>
                    </div>
                    <div className="absolute top-4 -right-2 w-4 h-4 bg-green-400 rounded-full"></div>
                    <div className="absolute bottom-20 -left-2 w-5 h-5 bg-yellow-400 rounded-full"></div>
                    <div className="absolute bottom-10 right-12 w-2 h-2 bg-pink-400 rounded-full"></div>

                    <div className="absolute bottom-8 left-6 flex space-x-1">
                      <div className="w-6 h-6 bg-white/30 rounded-full"></div>
                      <div className="w-6 h-6 bg-white/40 rounded-full"></div>
                      <div className="w-6 h-6 bg-white/50 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <h2 className="text-4xl font-bold mb-3">Welcome to ProjeX</h2>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  Your comprehensive project management solution. Organize
                  tasks, track progress, and collaborate efficiently.
                </p>

                {/* Feature list  */}
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
                    Deadline Management
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
