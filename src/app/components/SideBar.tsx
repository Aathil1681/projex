"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiOpenproject } from "react-icons/si";
import {
  HiOutlineHome,
  HiOutlineFolder,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import api from "@/app/helpers/baseApi";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  taskCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const router = useRouter();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("auth/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    router.push("/user");
  };

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <HiOutlineHome />,
      path: "/dashboard",
    },
    {
      id: "projects",
      name: "Projects",
      icon: <HiOutlineFolder />,
      path: null,
      hasChildren: true,
    },
    {
      id: "tasks",
      name: "My Tasks",
      icon: <HiOutlineCheckCircle />,
      path: "/task",
    },
    {
      id: "calendar",
      name: "Calendar",
      icon: <HiOutlineCalendar />,
      path: "/calendar",
    },
    {
      id: "reports",
      name: "Reports",
      icon: <HiOutlineChartBar />,
      path: "/reports",
    },
    { id: "team", name: "Team", icon: <HiOutlineUsers />, path: "/team" },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("projects");
        console.log("Projects API Response:", res.data); // Debug log

        // Fix: Map the title to name correctly
        const mappedProjects = res.data.map((p: any) => ({
          id: p.id,
          name: p.title, // This is the key fix - use p.title
          taskCount: p.tasks?.length || 0,
        }));

        console.log("Mapped Projects:", mappedProjects); // Debug log
        setProjects(mappedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };

    fetchProjects();
  }, []);

  const handleItemClick = (item: any) => {
    if (item.hasChildren) {
      setExpandedProject(expandedProject === item.id ? null : item.id);
    } else if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <div
      className={`
        bg-white border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
        flex flex-col h-screen shadow-lg
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl shadow-md">
            <SiOpenproject className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="ml-3 text-xl font-bold text-gray-900">ProjeX</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <HiOutlineChevronRight
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* User Profile - Updated Section */}
      <div className="p-4 border-b border-gray-200">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : ""
          } cursor-pointer hover:bg-gray-50 rounded-lg transition-colors p-2 -m-2`}
          onClick={handleProfileClick}
        >
          {loading ? (
            // Loading state
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
              {!isCollapsed && (
                <div className="ml-3 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 animate-pulse"></div>
                </div>
              )}
            </div>
          ) : (
            // User data loaded
            <>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user ? getUserInitials(user.name) : "U"}
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                    {user ? user.name : "Guest User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[140px]">
                    {user ? user.email : "Not logged in"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              className={`
                w-full flex items-center rounded-xl px-3 py-3 text-left transition-all duration-200
                hover:bg-blue-50 hover:text-blue-600
                ${
                  expandedProject === item.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="ml-3 font-medium">{item.name}</span>
                  {item.hasChildren && (
                    <span className="ml-auto">
                      {expandedProject === item.id ? (
                        <HiOutlineChevronDown className="w-4 h-4" />
                      ) : (
                        <HiOutlineChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Project Dropdown */}
            {item.hasChildren &&
              expandedProject === item.id &&
              !isCollapsed && (
                <div className="ml-4 mt-1 space-y-1 animate-slide-down">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="w-full flex items-center rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      <span className="flex-1 text-gray-600">
                        {project.name}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {project.taskCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
