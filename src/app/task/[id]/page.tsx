"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/app/helpers/baseApi";
import Sidebar from "@/app/components/SideBar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId: string;
  assigneeId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
}

const TaskDetailPage = () => {
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    if (task?.projectId) fetchProject(task.projectId);
    if (task?.assigneeId) fetchAssignee(task.assigneeId);
  }, [task]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`auth/me`);
      const userTasks = res.data.user.tasks as Task[];
      const t = userTasks.find((t) => t.id === taskId);
      setTask(t ?? null);
    } catch (err: any) {
      toast.error("Failed to fetch task");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async (id: string) => {
    try {
      const res = await api.get(`projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to fetch project", err);
      setProject(null);
    }
  };

  const fetchAssignee = async (id: string) => {
    try {
      const res = await api.get(`users/${id}`);
      setTask((prev) => (prev ? { ...prev, assignee: res.data } : prev));
    } catch (err) {
      console.error("Failed to fetch assignee", err);
    }
  };

  const updateTaskStatus = async (status: Task["status"]) => {
    if (!task) return;
    setUpdating(true);
    try {
      const res = await api.put(`task/${task.id}`, { status });
      setTask(res.data);
      toast.success(`Task status updated to ${formatStatus(status)}`);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    } finally {
      setUpdating(false);
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
        return "bg-red-300 text-red-700";
      case "IN_PROGRESS":
        return "bg-blue-300 text-blue-700";
      case "DONE":
        return "bg-green-300 text-green-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Task Not Found</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar fixed */}
      <div
        className={`fixed top-0 left-0 bottom-0 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content scrollable */}
      <main className={`flex-1 ml-64 p-8 overflow-y-auto `}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{task.title}</h1>
          <p className="mt-2 text-gray-500">
            Project:{" "}
            <span className="font-medium text-gray-800">
              {project?.title ?? "No project linked"}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description card */}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700">{task.description}</p>
            </div>

            {/* Status update card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Update Status
              </h2>
              <div className="flex flex-wrap gap-2">
                {(["TODO", "IN_PROGRESS", "DONE"] as Task["status"][]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => updateTaskStatus(status)}
                      disabled={updating || task.status === status}
                      className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          border-2 flex items-center space-x-2
          ${
            task.status === status
              ? `${getStatusColor(status)} border-current text-white`
              : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
          }
          ${updating ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
        `}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.status === status
                            ? "bg-white"
                            : getStatusColor(status)
                        }`}
                      ></div>
                      <span>{formatStatus(status)}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right column: Task info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Task Info</h2>

              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-gray-900">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDate(task.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetailPage;
