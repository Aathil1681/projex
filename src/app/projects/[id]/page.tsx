// app/dashboard/projects/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/helpers/baseApi";
import { toast } from "sonner";

import Modal from "@/app/components/Modal";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskCreateFormSchema, TaskCreateFormType } from "@/lib/schema";
import Sidebar from "@/app/components/SideBar";
import Button from "@/app/components/DashboardButton";
import Input from "@/app/components/DashboardInput";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignee?: { id: string; name?: string; email: string };
  owner?: { id: string; name?: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  owner: { id: string; name?: string; email: string };
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

interface UserOption {
  id: string;
  name?: string;
  email: string;
}

const ProjectDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks">("overview");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskCreateFormType>({
    resolver: zodResolver(taskCreateFormSchema),
    defaultValues: { projectId },
  });

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`projects/${projectId}`);
        setProject(res.data);
      } catch (err: any) {
        toast.error("Failed to fetch project details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Fetch users for assignee dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await api.get("users");
        if (Array.isArray(res.data)) setUsers(res.data);
        else if (Array.isArray(res.data.users)) setUsers(res.data.users);
        else setUsers([]);
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const onSubmit = async (data: TaskCreateFormType) => {
    try {
      const res = await api.post("task", data);
      setProject((prev) =>
        prev
          ? {
              ...prev,
              tasks: [res.data, ...prev.tasks],
            }
          : null
      );
      reset({ projectId });
      setIsTaskModalOpen(false);
      toast.success("Task created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const res = await api.put(`task/${taskId}`, { status });
      setProject((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((task) =>
                task.id === taskId ? res.data : task
              ),
            }
          : null
      );
      toast.success(`Task moved to ${status.replace("_", " ")}`);
    } catch (err: any) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`task/${taskId}`);
      setProject((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.filter((task) => task.id !== taskId),
            }
          : null
      );
      toast.success("Task deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete task");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DONE":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <div className="w-3 h-3 bg-yellow-400 rounded-full" />;
      case "IN_PROGRESS":
        return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case "DONE":
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Project Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              The project you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const todoTasks = project.tasks.filter((task) => task.status === "TODO");
  const inProgressTasks = project.tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  );
  const doneTasks = project.tasks.filter((task) => task.status === "DONE");

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.title}
                </h1>
                <p className="text-gray-500 text-sm">
                  Project details and task management
                </p>
              </div>
            </div>
            <Button onClick={() => setIsTaskModalOpen(true)} size="lg">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Task
            </Button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "tasks"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tasks ({project.tasks.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Project Information Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-900">
                      {project.description || "No description provided"}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Created By
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {project.owner.name?.charAt(0) ||
                            project.owner.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {project.owner.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {project.owner.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Created Date
                      </h3>
                      <p className="text-sm text-gray-900">
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Last Updated
                      </h3>
                      <p className="text-sm text-gray-900">
                        {formatDate(project.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">To Do</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {todoTasks.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        In Progress
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {inProgressTasks.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {doneTasks.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tasks Tab */
            <div className="max-w-6xl mx-auto">
              {/* Task List */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Tasks ({project.tasks.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {project.tasks.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No tasks yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Get started by creating your first task
                      </p>
                      <Button onClick={() => setIsTaskModalOpen(true)}>
                        Create Task
                      </Button>
                    </div>
                  ) : (
                    project.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="mt-1">
                              {getStatusIcon(task.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                  {task.title}
                                </h3>
                                <select
                                  value={task.status}
                                  onChange={(e) =>
                                    updateTaskStatus(
                                      task.id,
                                      e.target.value as Task["status"]
                                    )
                                  }
                                  className={`text-sm font-medium px-3 py-1 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                                    task.status
                                  )}`}
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: "right 0.5rem center",
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "1.5em 1.5em",
                                    paddingRight: "2.5rem",
                                  }}
                                >
                                  <option value="TODO">To Do</option>
                                  <option value="IN_PROGRESS">
                                    In Progress
                                  </option>
                                  <option value="DONE">Done</option>
                                </select>
                              </div>
                              {task.description && (
                                <p className="text-gray-600 mb-3">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                {task.assignee && (
                                  <div className="flex items-center space-x-2">
                                    <span>Assigned to:</span>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-white">
                                        {task.assignee.name?.charAt(0) ||
                                          task.assignee.email
                                            .charAt(0)
                                            .toUpperCase()}
                                      </div>
                                      <span className="font-medium">
                                        {task.assignee.name ||
                                          task.assignee.email}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <span>
                                    Created: {formatDate(task.createdAt)}
                                  </span>
                                </div>
                                {task.updatedAt !== task.createdAt && (
                                  <div>
                                    <span>
                                      Updated: {formatDate(task.updatedAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="!p-2 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="Enter task title"
            {...register("title")}
            error={errors.title}
          />
          <Input
            label="Description"
            placeholder="Enter task description"
            {...register("description")}
            error={errors.description}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            {isLoadingUsers ? (
              <div className="border border-gray-300 rounded-xl px-4 py-3 text-gray-500">
                Loading users...
              </div>
            ) : (
              <select
                {...register("assigneeId")}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue=""
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTaskModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;
