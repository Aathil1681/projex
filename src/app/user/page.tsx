"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/app/helpers/baseApi";
import Sidebar from "@/app/components/SideBar";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  projectId: string;
  assigneeId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  projects: any[];
  tasks: Task[];
}

const UserProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const res = await api.get("auth/me");
        setUser(res.data.user);
      } catch (err: any) {
        toast.error("Failed to fetch user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTaskStats = () => {
    if (!user)
      return { total: 0, todo: 0, inProgress: 0, inReview: 0, done: 0 };

    return {
      total: user.tasks.length,
      todo: user.tasks.filter((task) => task.status === "TODO").length,
      inProgress: user.tasks.filter((task) => task.status === "IN_PROGRESS")
        .length,
      inReview: user.tasks.filter((task) => task.status === "IN_REVIEW").length,
      done: user.tasks.filter((task) => task.status === "DONE").length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            User Not Found
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header & User Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-2xl font-bold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{user.name}</h1>
                      <p className="text-blue-100">{user.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.total}
                      </div>
                      <div className="text-sm text-gray-600">Total Tasks</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.done}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Account Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Member since</span>
                        <span className="font-medium">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last updated</span>
                        <span className="font-medium">
                          {formatDate(user.updatedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Role</span>
                        <span className="font-medium capitalize">
                          {user.role.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Tasks */}
            <div className="lg:col-span-2 space-y-8">
              {/* Task Overview */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Task Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">
                      {stats.todo}
                    </div>
                    <div className="text-sm text-gray-600">To Do</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.inProgress}
                    </div>
                    <div className="text-sm text-blue-600">In Progress</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.inReview}
                    </div>
                    <div className="text-sm text-yellow-600">In Review</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.done}
                    </div>
                    <div className="text-sm text-green-600">Done</div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Tasks
                  </h2>
                  <button
                    onClick={() => router.push("/tasks")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4 max-h-[200px] overflow-y-auto">
                  {user.tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => router.push(`/task/${task.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {task.description || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 ml-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {formatStatus(task.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(task.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {user.tasks.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg
                          className="w-12 h-12 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600">No tasks assigned yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
