import React, { useMemo, useState } from "react";
import {
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiList,
  FiSearch,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { RiFolder3Line } from "react-icons/ri";
import TaskCatalog from "./TaskCatalog";
import TasksModel from "./TasksModel";
import TasksTable from "./TasksTable";

const navItems = [
  { key: "catalog", label: "Dashboard", icon: FiGrid },
  { key: "tasks", label: "Tasks", icon: FiList },
  { key: "projects", label: "Projects", icon: RiFolder3Line },
  { key: "schedule", label: "Schedule", icon: FiCalendar },
];

const StatCard = ({ title, value, note, icon, cardClass }) => (
  <article className={`rounded-2xl px-5 py-4 text-white shadow-md ${cardClass}`}>
    <div className="mb-3 flex items-start justify-between">
      <p className="text-xs uppercase tracking-[0.12em] text-white/85">{title}</p>
      <div className="rounded-xl bg-white/20 p-2">{icon}</div>
    </div>
    <p className="text-3xl font-extrabold tracking-tight">{value}</p>
    <p className="mt-1 text-sm text-white/90">{note}</p>
  </article>
);

const TasksDashboard = ({ data = [] }) => {
  const [activeView, setActiveView] = useState("catalog");

  const stats = useMemo(() => {
    const totalTasks = data.length;
    const completedTasks = data.filter((task) => task.status === "completed").length;
    const inProgressTasks = data.filter((task) => task.status === "in-progress").length;
    const overdueTasks = data.filter((task) => {
      if (!task.deadline || task.status === "completed") return false;
      return new Date(task.deadline) < new Date();
    }).length;

    const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, inProgressTasks, overdueTasks, completionPercent };
  }, [data]);

  const donutStyle = {
    background: `conic-gradient(#2563eb 0% ${stats.completionPercent}%, #dbeafe ${stats.completionPercent}% 100%)`,
  };

  const chartBars = [54, 82, 46, 67, 93, 61, 74, 58, 86, 49, 79, 64];
  const isCatalogView = activeView === "catalog";

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#eef3ff_0%,#eaf4ff_45%,#f7f9ff_100%)] [font-family:'Sora',sans-serif] text-slate-900">
      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/70 bg-white/75 p-6 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <FiGrid />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Verity</p>
              <p className="text-3xl font-extrabold leading-tight tracking-tight">Task Hub</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                (item.key === "catalog" && isCatalogView) || (item.key === "tasks" && !isCatalogView);

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (item.key === "catalog") setActiveView("catalog");
                    if (item.key === "tasks") setActiveView("tasks");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition ${
                    active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.14em] text-blue-200">Quick Actions</p>
            <p className="mt-2 text-sm text-slate-200">Create and assign tasks from one place.</p>
            <TasksModel>
              <button className="mt-4 w-full rounded-xl bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-400">
                New Task
              </button>
            </TasksModel>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {isCatalogView ? "Course Catalog Dashboard" : "Tasks Main Dashboard"}
              </h1>
              <p className="text-sm text-slate-500">
                {isCatalogView
                  ? "Browse and discover off-the-shelf courses"
                  : "Operational view of workload, progress, and deadlines"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <FiSearch className="text-slate-400" />
                <input
                  type="text"
                  placeholder={isCatalogView ? "Search courses..." : "Search tasks..."}
                  className="w-40 bg-transparent text-sm outline-none sm:w-52"
                />
              </label>
              <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100">
                <FiBell />
              </button>
              <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100">
                <FiSettings />
              </button>
              <div className="rounded-xl bg-slate-900 p-2 text-white">
                <FiUser />
              </div>
            </div>
          </header>

          {isCatalogView ? (
            <TaskCatalog embedded />
          ) : (
            <>
              <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Tasks"
                  value={stats.totalTasks}
                  note="All registered tasks"
                  icon={<FiList />}
                  cardClass="bg-gradient-to-br from-blue-600 to-blue-500"
                />
                <StatCard
                  title="In Progress"
                  value={stats.inProgressTasks}
                  note="Currently being worked on"
                  icon={<FiClock />}
                  cardClass="bg-gradient-to-br from-amber-500 to-orange-500"
                />
                <StatCard
                  title="Completed"
                  value={stats.completedTasks}
                  note="Closed this cycle"
                  icon={<FiCheckCircle />}
                  cardClass="bg-gradient-to-br from-violet-600 to-indigo-600"
                />
                <StatCard
                  title="Overdue"
                  value={stats.overdueTasks}
                  note="Needs immediate attention"
                  icon={<FiCalendar />}
                  cardClass="bg-gradient-to-br from-rose-600 to-red-500"
                />
              </section>

              <section className="mb-6 grid gap-4 lg:grid-cols-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Task Throughput</h2>
                  <div className="flex h-48 items-end gap-3">
                    {chartBars.map((height, idx) => (
                      <div key={idx} className="flex-1">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-400"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Completion Ratio</h2>
                  <div className="grid place-items-center pt-3">
                    <div style={donutStyle} className="grid h-40 w-40 place-items-center rounded-full">
                      <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
                        <p className="text-2xl font-black text-slate-900">{stats.completionPercent}%</p>
                        <p className="text-xs text-slate-500">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Weekly Trend</h2>
                  <svg viewBox="0 0 140 120" className="h-44 w-full">
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M8 100 L30 82 L50 90 L70 44 L92 66 L114 34 L132 58 L132 112 L8 112 Z"
                      fill="url(#trendFill)"
                    />
                    <path
                      d="M8 100 L30 82 L50 90 L70 44 L92 66 L114 34 L132 58"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between px-2">
                  <h2 className="text-lg font-bold tracking-tight">Task Registry</h2>
                  <TasksModel>
                    <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                      Add New Task
                    </button>
                  </TasksModel>
                </div>
                <TasksTable data={data} embedded />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TasksDashboard;
