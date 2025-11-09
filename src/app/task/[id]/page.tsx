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
  }, [task]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`auth/me`);
      const userTasks = res.data.user.tasks as Task[];
      const t = userTasks.find((task) => task.id === taskId);
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
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "DONE":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Task Not Found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Task Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            {task.title}
          </h1>
          <p className="text-gray-500 mt-1">
            Project:{" "}
            <span className="text-gray-800 font-medium">
              {project?.title ?? "No project linked"}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Description & Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {task.description ?? "No description"}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Update Status
              </h2>
              <div className="flex gap-4">
                {(["TODO", "IN_PROGRESS", "DONE"] as Task["status"][]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => updateTaskStatus(status)}
                      disabled={updating || task.status === status}
                      className={`flex-1 p-3 rounded-xl text-sm font-medium border text-center transition-all ${
                        task.status === status
                          ? `${getStatusColor(
                              status
                            )} ring-2 ring-offset-1 ring-blue-400`
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      } ${updating ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {formatStatus(status)}
                    </button>
                  )
                )}
              </div>
              {updating && (
                <p className="text-xs text-gray-500 mt-2">Updating status...</p>
              )}
            </div>
          </div>

          {/* Right Column: Task Info */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Task Info
              </h2>
              <div>
                <p className="text-xs text-gray-500">Assignee</p>
                <p className="text-gray-900 font-medium">
                  {task.assignee?.name ?? "Unassigned"}
                </p>
                <p className="text-sm text-gray-600">
                  {task.assignee?.email ?? "N/A"}
                </p>
              </div>
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
