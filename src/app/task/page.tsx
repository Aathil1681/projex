"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/app/components/SideBar";
import api from "@/app/helpers/baseApi";
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlinePlay,
  HiOutlineCheckCircle,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlinePlus,
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

interface Column {
  id: "TODO" | "IN_PROGRESS" | "DONE";
  title: string;
  color: string;
  bgColor: string;
  icon: React.JSX.Element;
}

const AllTasksPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const columns: Column[] = [
    {
      id: "TODO",
      title: "To Do",
      color: "text-gray-700",
      bgColor: "bg-gray-100 border-gray-200",
      icon: <HiOutlineClock className="w-5 h-5" />,
    },
    {
      id: "IN_PROGRESS",
      title: "In Progress",
      color: "text-blue-700",
      bgColor: "bg-blue-100 border-blue-200",
      icon: <HiOutlinePlay className="w-5 h-5" />,
    },
    {
      id: "DONE",
      title: "Done",
      color: "text-emerald-700",
      bgColor: "bg-emerald-100 border-emerald-200",
      icon: <HiOutlineCheckCircle className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("auth/me");
      const userTasks: Task[] = res.data.user.tasks;

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

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: Column["id"]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Column["id"]) => {
    e.preventDefault();

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    const originalStatus = draggedTask.status;
    const updatedTask = { ...draggedTask, status: newStatus };

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) => (task.id === draggedTask.id ? updatedTask : task))
    );

    try {
      await api.put(`/task/${draggedTask.id}`, { status: newStatus });
      toast.success(
        `Task moved to ${columns.find((col) => col.id === newStatus)?.title}`
      );
    } catch (error) {
      // Revert on error
      setTasks((prev) =>
        prev.map((task) =>
          task.id === draggedTask.id
            ? { ...task, status: originalStatus }
            : task
        )
      );
      toast.error("Failed to update task status");
      console.error(error);
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    // Optimistic update
    setTasks((prev) => prev.filter((task) => task.id !== taskId));

    try {
      await api.delete(`/task/${taskId}`);
      toast.success("Task deleted successfully");
    } catch (error) {
      // Revert on error
      setTasks((prev) => [...prev, taskToDelete]);
      toast.error("Failed to delete task");
      console.error(error);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getTasksByStatus = (status: Column["id"]) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
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
                Task Board
              </h1>
              <p className="text-gray-600">
                Drag and drop tasks to update their status
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                status: "ALL",
                label: "Total Tasks",
                color: "bg-white border-gray-300 text-gray-700",
              },
              {
                status: "TODO",
                label: "To Do",
                color: "bg-white border-gray-300 text-gray-700",
              },
              {
                status: "IN_PROGRESS",
                label: "In Progress",
                color: "bg-white border-blue-300 text-blue-700",
              },
              {
                status: "DONE",
                label: "Completed",
                color: "bg-white border-emerald-300 text-emerald-700",
              },
            ].map(({ status, label, color }) => (
              <div
                key={status}
                className={`border-2 rounded-2xl p-4 shadow-sm ${color}`}
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
                    {status === "ALL" && (
                      <HiOutlineClipboardList className="w-6 h-6" />
                    )}
                    {status === "TODO" && (
                      <HiOutlineClock className="w-6 h-6" />
                    )}
                    {status === "IN_PROGRESS" && (
                      <HiOutlinePlay className="w-6 h-6" />
                    )}
                    {status === "DONE" && (
                      <HiOutlineCheckCircle className="w-6 h-6" />
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {
                    getTaskStats()[
                      status as keyof ReturnType<typeof getTaskStats>
                    ]
                  }
                </div>
                <div className="text-sm text-gray-600 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineClipboardList className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "You don't have any tasks assigned yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex flex-col"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between p-4 rounded-t-2xl border-b-2 ${column.bgColor}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${column.bgColor}`}>
                      {column.icon}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${column.color}`}>
                        {column.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getTasksByStatus(column.id).length} tasks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tasks Container */}
                <div className="flex-1 bg-gray-100/50 rounded-b-2xl p-4 min-h-[400px] transition-all duration-300 hover:bg-gray-200/30">
                  <div className="space-y-4">
                    {getTasksByStatus(column.id).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={() => router.push(`/task/${task.id}`)}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden transform hover:-translate-y-1"
                      >
                        <div className="p-4">
                          {/* Task Header */}
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 mr-2">
                              {task.title}
                            </h4>
                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Task Description */}
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                            {task.description || "No description provided"}
                          </p>

                          {/* Project Info */}
                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <svg
                              className="w-3 h-3 mr-1"
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
                              {projects[task.projectId]?.title ??
                                "Unknown Project"}
                            </span>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              Updated {formatDate(task.updatedAt)}
                            </div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform"></div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State for Column */}
                    {getTasksByStatus(column.id).length === 0 && (
                      <div className="text-center py-8 bg-white/50 rounded-xl border-2 border-dashed border-gray-300">
                        <HiOutlinePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No tasks</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Drag tasks here
                        </p>
                      </div>
                    )}
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
