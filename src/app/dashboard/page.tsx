"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectCreateSchema, ProjectCreateType } from "../../lib/schema";
import api from "../helpers/baseApi";
import Cookie from "js-cookie";
import ProjectCard from "../components/ProjectCard";
import Modal from "../components/Modal";

import { toast } from "sonner";
import Sidebar from "../components/SideBar";
import Button from "../components/DashboardButton";
import Input from "../components/DashboardInput";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import { cookieKeys } from "@/config/cookie.config";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  description?: string;
  tasks: any[];
  createdAt: string;
}

const DashboardPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectCreateType>({
    resolver: zodResolver(projectCreateSchema),
  });

  const fetchProjects = async () => {
    try {
      const res = await api.get("projects");
      // Ensure tasks is always an array
      const dataWithTasks = res.data.map((proj: any) => ({
        ...proj,
        tasks: proj.tasks || [],
      }));
      setProjects(dataWithTasks);
    } catch (err) {
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onSubmit = async (data: ProjectCreateType) => {
    try {
      const res = await api.post("projects", data);
      setProjects((prev) => [
        { ...res.data, tasks: res.data.tasks || [] },
        ...prev,
      ]);
      reset();
      setIsModalOpen(false);
      toast.success("Project created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleLogout = () => {
    Cookie.remove(cookieKeys.USER_TOKEN);

    router.push("/auth/login/");
  };

  const totalTasks = projects.reduce(
    (sum, project) => sum + (project.tasks?.length || 0),
    0
  );

  const completedTasks = projects.reduce(
    (sum, project) =>
      sum +
      (project.tasks?.filter((task: any) => task.status === "DONE")?.length ||
        0),
    0
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
            <div>
              <p className="text-gray-500 text-xl">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsModalOpen(true)} size="lg">
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
                New Project
              </Button>

              {/* Logout Button */}
              <Button
                onClick={() => setIsLogoutModalOpen(true)}
                variant="outline"
                size="lg"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          isOpen={isLogoutModalOpen}
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />

        {/* Stats */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Projects */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Tasks Completed */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tasks Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedTasks}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Tasks */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalTasks}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col ">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Projects
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {projects.length === 0 ? (
                <div className="text-center py-12">
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
                    No projects yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first project
                  </p>
                  <Button onClick={() => setIsModalOpen(true)}>
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      tasks={project.tasks}
                      onProjectUpdate={fetchProjects}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="Enter project title"
            {...register("title")}
            error={errors.title}
          />
          <Input
            label="Description"
            placeholder="Enter project description"
            {...register("description")}
            error={errors.description}
          />
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
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
