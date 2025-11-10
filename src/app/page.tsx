"use client";
import { useRouter } from "next/navigation";
import { SiOpenproject } from "react-icons/si";
import {
  HiOutlineRocketLaunch,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineCalendar,
} from "react-icons/hi2";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header Logo */}
      <div className="absolute top-10 left-8 flex items-center group">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-105 group-hover:shadow-xl">
          <SiOpenproject className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span className="font-serif ml-3 text-2xl font-bold text-gray-900 transition-all duration-300 group-hover:text-blue-600">
          ProjeX
        </span>
      </div>

      <div className="flex min-h-screen py-10">
        {/* Left Side - Content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 py-20">
          <div className="max-w-lg mx-auto lg:mx-0">
            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Streamline Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Workflow
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                ProjeX helps teams organize tasks, track progress, and achieve
                goals faster. Experience seamless project management with
                powerful collaboration tools.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HiOutlineRocketLaunch className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Fast Setup
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <HiOutlineChartBar className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Real-time Analytics
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HiOutlineUsers className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Team Collaboration
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <HiOutlineCalendar className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Smart Scheduling
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center"
              >
                Get Started
                <HiOutlineRocketLaunch className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => router.push("/auth/register")}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                Create Account
              </button>
            </div>

            {/* Trust Badge */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Trusted by teams worldwide
              </p>
              <div className="flex space-x-6 opacity-60">
                <div className="text-2xl font-bold text-gray-400">500+</div>
                <div className="text-2xl font-bold text-gray-400">Teams</div>
                <div className="text-2xl font-bold text-gray-400">10K+</div>
                <div className="text-2xl font-bold text-gray-400">Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Custom Graphic */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className=" rounded-3xl p-8 w-full h-full flex items-center justify-center -translate-y-20">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
                <div className="absolute bottom-20 right-16 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full animate-pulse delay-500"></div>
              </div>

              {/* Main Dashboard Illustration */}
              <div className="relative z-10 flex flex-col justify-center items-center text-center text-white p-10 w-full h-full">
                <div className="max-w-md">
                  {/* Floating Dashboard Elements */}
                  <div className="mb-8 relative">
                    <div className="w-80 h-64 relative mx-auto">
                      {/* Main Dashboard Card */}
                      <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl"></div>

                      {/* Header Bar */}
                      <div className="absolute top-4 left-4 right-4 h-3 bg-white/30 rounded-full"></div>

                      {/* Progress Bars */}
                      <div className="absolute top-12 left-4 right-4 space-y-3">
                        <div className="h-4 bg-white/20 rounded-full">
                          <div className="w-3/4 h-full bg-green-400 rounded-full shadow-lg"></div>
                        </div>
                        <div className="h-4 bg-white/20 rounded-full">
                          <div className="w-1/2 h-full bg-blue-400 rounded-full shadow-lg"></div>
                        </div>
                        <div className="h-4 bg-white/20 rounded-full">
                          <div className="w-5/6 h-full bg-purple-400 rounded-full shadow-lg"></div>
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="absolute bottom-8 left-4 right-4 flex space-x-3">
                        <div className="flex-1 h-12 bg-white/20 rounded-lg backdrop-blur-sm"></div>
                        <div className="flex-1 h-12 bg-white/20 rounded-lg backdrop-blur-sm"></div>
                        <div className="flex-1 h-12 bg-white/20 rounded-lg backdrop-blur-sm"></div>
                      </div>

                      {/* Floating Icons */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 rounded-full animate-bounce shadow-lg delay-300"></div>
                      <div className="absolute top-1/2 -right-3 w-4 h-4 bg-pink-400 rounded-full animate-bounce shadow-lg delay-700"></div>

                      {/* User Avatars */}
                      <div className="absolute bottom-4 left-4 flex -space-x-2">
                        <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-white"></div>
                        <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                        <div className="w-6 h-6 bg-purple-400 rounded-full border-2 border-white"></div>
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Project Management
                    <br />
                    <span className="text-3xl font-thin">Made Simple</span>
                  </h2>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6">
                    Visualize your team's progress with intuitive dashboards,
                    real-time updates, and smart analytics that drive success.
                  </p>

                  {/* Feature Indicators */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center justify-center bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Live Updates
                    </div>
                    <div className="flex items-center justify-center bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                      Team Sync
                    </div>
                    <div className="flex items-center justify-center bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                      Smart Reports
                    </div>
                    <div className="flex items-center justify-center bg-white/10 rounded-lg py-2 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                      Instant Notifications
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
