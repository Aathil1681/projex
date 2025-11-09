// components/ProjectCard.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskCreateFormSchema, TaskCreateFormType } from "@/lib/schema";
import api from "../helpers/baseApi";
import { toast } from "sonner";
import Button from "./DashboardButton";
import Input from "./DashboardInput";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignee?: { id: string; name?: string; email: string };
  createdAt: string;
}

interface UserOption {
  id: string;
  name?: string;
  email: string;
}

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  tasks: Task[];
  onProjectUpdate: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  tasks: initialTasks,
  onProjectUpdate,
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    setTasks(initialTasks || []);
  }, [initialTasks]);

  // Fetch all users for assignee dropdown
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskCreateFormType>({
    resolver: zodResolver(taskCreateFormSchema),
    defaultValues: { projectId: id },
  });

  const onSubmit = async (data: TaskCreateFormType) => {
    try {
      const res = await api.post("task", data);
      setTasks((prev) => [res.data, ...prev]);
      reset({ projectId: id });
      setIsModalOpen(false);
      toast.success("Task created successfully!");
      onProjectUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const res = await api.put(`task/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
      toast.success(`Task moved to ${status.replace("_", " ")}`);
      onProjectUpdate();
    } catch (err: any) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`task/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully");
      onProjectUpdate();
    } catch (err: any) {
      toast.error("Failed to delete task");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "DONE":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div
        onClick={() => router.push(`/projects/${id}`)}
        className="flex items-start justify-between mb-4"
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
          {tasks?.length || 0}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-sm">{getStatusIcon(task.status)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {task.title.length > 5
                    ? `${task.title.slice(0, 5)}...`
                    : task.title}
                </p>

                {task.assignee && (
                  <p className="text-xs text-gray-500">
                    {task.assignee.name || task.assignee.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={task.status}
                onChange={(e) =>
                  updateTaskStatus(task.id, e.target.value as Task["status"])
                }
                className={`text-xs font-medium px-2 py-1 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                  task.status
                )}`}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="!p-1 hover:bg-red-100 hover:text-red-600"
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
        ))}
      </div>

      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="w-full"
      >
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Task
      </Button>

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
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
              onClick={() => setIsModalOpen(false)}
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

export default ProjectCard;
