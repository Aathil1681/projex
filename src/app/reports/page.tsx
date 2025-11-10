// app/reports/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/app/components/SideBar";
import api from "@/app/helpers/baseApi";
import {
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineTrendingUp,
  HiOutlineClock,
  HiOutlineDownload,
} from "react-icons/hi";

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
  project: {
    id: string;
    title: string;
    description: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const ReportsPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("task");
      // Filter only completed tasks (DONE status)
      const completedTasks = res.data.filter(
        (task: Task) => task.status === "DONE"
      );
      setTasks(completedTasks);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch completed tasks");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCompletionStats = () => {
    const totalTasks = tasks.length;
    const completedThisWeek = tasks.filter((task) => {
      const taskDate = new Date(task.updatedAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return taskDate >= oneWeekAgo;
    }).length;

    const avgCompletionTime =
      tasks.reduce((acc, task) => {
        const created = new Date(task.createdAt);
        const updated = new Date(task.updatedAt);
        return acc + (updated.getTime() - created.getTime());
      }, 0) / (tasks.length || 1);

    const avgDays = Math.round(avgCompletionTime / (1000 * 60 * 60 * 24));

    return {
      totalTasks,
      completedThisWeek,
      avgCompletionDays: avgDays,
    };
  };

  const stats = getCompletionStats();

  const getTopPerformers = () => {
    const performerMap = new Map();

    tasks.forEach((task) => {
      const assignee = task.assignee;
      if (performerMap.has(assignee.id)) {
        performerMap.set(assignee.id, {
          ...assignee,
          taskCount: performerMap.get(assignee.id).taskCount + 1,
        });
      } else {
        performerMap.set(assignee.id, {
          ...assignee,
          taskCount: 1,
        });
      }
    });

    return Array.from(performerMap.values())
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 5);
  };

  const topPerformers = getTopPerformers();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="fixed top-0 left-0 bottom-0">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
        <main
          className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 bottom-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <main
        className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Task Reports
              </h1>
              <p className="text-gray-600">
                Analytics and insights for completed tasks
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <button className="bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-sm">
                <HiOutlineDownload className="w-5 h-5" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Completed
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalTasks}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    All time completed tasks
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <HiOutlineCheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed This Week
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.completedThisWeek}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Recent achievements
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <HiOutlineTrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg. Completion
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.avgCompletionDays}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">Days per task</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <HiOutlineClock className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Completed Tasks List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Completed Tasks
                  </h2>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {tasks.length} tasks
                  </span>
                </div>

                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineCheckCircle className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No completed tasks yet
                      </h3>
                      <p className="text-gray-600">
                        Tasks marked as done will appear here
                      </p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => router.push(`/task/${task.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {task.title}
                              </h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {task.description || "No description provided"}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <HiOutlineDocumentText className="w-4 h-4" />
                                <span>{task.project.title}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <HiOutlineUser className="w-4 h-4" />
                                <span>{task.assignee.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <HiOutlineCalendar className="w-4 h-4" />
                                <span>
                                  Completed {formatDate(task.updatedAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <HiOutlineTrendingUp className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Analytics */}
            <div className="space-y-6">
              {/* Top Performers */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HiOutlineChartBar className="w-5 h-5 mr-2 text-blue-600" />
                  Top Performers
                </h3>
                <div className="space-y-3">
                  {topPerformers.map((performer, index) => (
                    <div
                      key={performer.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {performer.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {performer.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {performer.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">
                          {performer.taskCount}
                        </p>
                        <p className="text-xs text-gray-500">tasks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Completion Rate
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>This Week</span>
                      <span>{stats.completedThisWeek} tasks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (stats.completedThisWeek /
                              Math.max(stats.totalTasks, 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Overall</span>
                      <span>{stats.totalTasks} tasks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <HiOutlineTrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Team Performance</p>
                      <p className="text-xs opacity-90">
                        {topPerformers.length} active members
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <HiOutlineClock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Average Speed</p>
                      <p className="text-xs opacity-90">
                        {stats.avgCompletionDays} days per task
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
