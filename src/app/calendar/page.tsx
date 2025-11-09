// app/calendar/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/app/components/SideBar";
import api from "@/app/helpers/baseApi";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlinePlay,
  HiOutlineCheckCircle,
} from "react-icons/hi";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  projectId: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    title: string;
  };
}

const CalendarPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("auth/me");
      const userTasks: Task[] = res.data.user.tasks;
      setTasks(userTasks);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "IN_REVIEW":
        return "bg-purple-100 border-purple-300 text-purple-800";
      case "DONE":
        return "bg-green-100 border-green-300 text-green-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <HiOutlineClock className="w-3 h-3" />;
      case "IN_PROGRESS":
        return <HiOutlinePlay className="w-3 h-3" />;
      case "IN_REVIEW":
        return <HiOutlineCalendar className="w-3 h-3" />;
      case "DONE":
        return <HiOutlineCheckCircle className="w-3 h-3" />;
      default:
        return <HiOutlineCalendar className="w-3 h-3" />;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Previous month's days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(
        currentYear,
        currentMonth - 1,
        prevMonthLastDay - i
      );
      days.push({ date, isCurrentMonth: false });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month's days
    const totalCells = 42; // 6 weeks
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Calendar
              </h1>
              <p className="text-gray-600">
                View and manage your tasks schedule
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button className="bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-sm">
                <HiOutlinePlus className="w-5 h-5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HiOutlineChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <HiOutlineChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-semibold text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, isCurrentMonth }, index) => {
                const dayTasks = getTasksForDate(date);
                const isToday =
                  new Date().toDateString() === date.toDateString();
                const isSelected =
                  selectedDate?.toDateString() === date.toDateString();

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] p-2 border rounded-xl transition-all cursor-pointer
                      ${
                        isCurrentMonth
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                      }
                      ${isToday ? "ring-2 ring-blue-500 ring-opacity-50" : ""}
                      ${
                        isSelected
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }
                    `}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`
                        text-sm font-medium
                        ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                        ${
                          isToday
                            ? "bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                            : ""
                        }
                      `}
                      >
                        {date.getDate()}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Tasks for this day */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={`
                            text-xs p-1.5 rounded border cursor-pointer transition-colors
                            ${getStatusColor(task.status)}
                            hover:opacity-80
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/task/${task.id}`);
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(task.status)}
                            <span className="truncate font-medium">
                              {task.title}
                            </span>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Tasks */}
          {selectedDate && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tasks for {formatDate(selectedDate)}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HiOutlinePlus className="w-5 h-5 transform rotate-45" />
                </button>
              </div>

              <div className="space-y-3">
                {getTasksForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <HiOutlineCalendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No tasks for this date</p>
                  </div>
                ) : (
                  getTasksForDate(selectedDate).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => router.push(`/task/${task.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            getStatusColor(task.status).split(" ")[0]
                          }`}
                        >
                          {getStatusIcon(task.status)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {task.project?.title || "No project"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Created{" "}
                          {new Date(task.createdAt).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
