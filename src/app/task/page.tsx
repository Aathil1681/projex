"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/app/components/SideBar";
import api from "@/app/helpers/baseApi";

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

  return (
    <div className="flex min-h-screen bg-gray-50 ">
      <div className="fixed top-0 left-0 bottom-0 w-64">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <main className="flex-1 p-8 overflow-y-auto ml-64">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">My Tasks</h1>

        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks assigned to you.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/task/${task.id}`)}
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {task.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {task.description}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Project:{" "}
                    <span className="text-gray-800 font-medium">
                      {projects[task.projectId]?.title ?? "Unknown Project"}
                    </span>
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {formatStatus(task.status)}
                  </span>
                  <p className="text-xs text-gray-400">
                    {formatDate(task.updatedAt)}
                  </p>
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
