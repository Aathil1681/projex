"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/app/components/SideBar";
import api from "@/app/helpers/baseApi";
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlinePlay,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineSearch,
} from "react-icons/hi";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  title: string;
}

const AllTasksPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("auth/me");
      const userTasks: Task[] = res.data.user.tasks;

      // Fetch all unique project info
      const uniqueProjectIds = Array.from(
        new Set(userTasks.map((t) => t.projectId))
      );
      const projectData: Record<string, Project> = {};

      await Promise.all(
        uniqueProjectIds.map(async (id) => {
          try {
            const projRes = await api.get(`projects/${id}`);
            projectData[id] = projRes.data;
          } catch {
            projectData[id] = { id, title: "Unknown Project" };
          }
        })
      );

      setTasks(userTasks);
      setProjects(projectData);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string) =>
    status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "IN_REVIEW":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DONE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <HiOutlineClock className="w-5 h-5" />;
      case "IN_PROGRESS":
        return <HiOutlinePlay className="w-5 h-5" />;
      case "IN_REVIEW":
        return <HiOutlineEye className="w-5 h-5" />;
      case "DONE":
        return <HiOutlineCheckCircle className="w-5 h-5" />;
      default:
        return <HiOutlineClipboardList className="w-5 h-5" />;
    }
  };

  const getStatsIcon = (status: string) => {
    switch (status) {
      case "ALL":
        return <HiOutlineClipboardList className="w-6 h-6" />;
      case "TODO":
        return <HiOutlineClock className="w-6 h-6" />;
      case "IN_PROGRESS":
        return <HiOutlinePlay className="w-6 h-6" />;
      case "IN_REVIEW":
        return <HiOutlineEye className="w-6 h-6" />;
      case "DONE":
        return <HiOutlineCheckCircle className="w-6 h-6" />;
      default:
        return <HiOutlineClipboardList className="w-6 h-6" />;
    }
  };

  const getStatsColor = (status: string) => {
    switch (status) {
      case "ALL":
        return "bg-white border-gray-300 text-gray-700";
      case "TODO":
        return "bg-white border-gray-300 text-gray-700";
      case "IN_PROGRESS":
        return "bg-white border-blue-300 text-blue-700";

      case "DONE":
        return "bg-white border-emerald-300 text-emerald-700";
      default:
        return "bg-white border-gray-300 text-gray-700";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === "ALL" || task.status === filterStatus;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getTaskStats = () => {
    const stats = {
      ALL: tasks.length,
      TODO: tasks.filter((t) => t.status === "TODO").length,
      IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,

      DONE: tasks.filter((t) => t.status === "DONE").length,
    };
    return stats;
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Tasks
              </h1>
              <p className="text-gray-600">
                Manage and track all your assigned tasks
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm w-64"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineSearch className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Updated Design */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { status: "ALL", label: "Total Tasks" },
              { status: "TODO", label: "To Do" },
              { status: "IN_PROGRESS", label: "In Progress" },

              { status: "DONE", label: "Completed" },
            ].map(({ status, label }) => (
              <div
                key={status}
                className={`border-2 rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  filterStatus === status
                    ? "ring-2 ring-blue-500 ring-opacity-50 border-blue-300 bg-blue-50"
                    : getStatsColor(status)
                } hover:scale-105`}
                onClick={() => setFilterStatus(status)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      status === "ALL"
                        ? "bg-gray-100"
                        : status === "TODO"
                        ? "bg-gray-100"
                        : status === "IN_PROGRESS"
                        ? "bg-blue-100"
                        : "bg-emerald-100"
                    }`}
                  >
                    {getStatsIcon(status)}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats[status as keyof typeof stats]}
                </div>
                <div className="text-sm text-gray-600 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex space-x-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200 w-fit mb-6">
            {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                  filterStatus === status
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{getStatusIcon(status)}</span>
                <span>{formatStatus(status)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineClipboardList className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              {searchTerm || filterStatus !== "ALL"
                ? "Try adjusting your search or filter criteria"
                : "You don't have any tasks assigned yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/task/${task.id}`)}
              >
                {/* Status Header */}
                <div
                  className={`border-b ${
                    getStatusColor(task.status).split(" ")[2]
                  } px-6 py-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {formatStatus(task.status)}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Task Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {task.description || "No description provided"}
                  </p>

                  {/* Project Info */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span className="truncate">
                      {projects[task.projectId]?.title ?? "Unknown Project"}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Updated {formatDate(task.updatedAt)}
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllTasksPage;
