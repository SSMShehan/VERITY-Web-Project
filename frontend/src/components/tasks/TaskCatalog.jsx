import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiClock, FiEdit2, FiFilter, FiSearch, FiTrash2, FiUser } from "react-icons/fi";
import { backendUrl } from "../../App";
import TasksModel from "./TasksModel";
import { queryClient } from "./queryClient";

const courses = [
  {
    id: 1,
    title: "Marketing Training 1 (Competencies)",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Professional Video Editing",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Communication Skills",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Leadership Skill",
    tag: "Marketing",
    progress: 0,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    title: "Marketing Strategies Part 1",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    title: "Digital Marketing Online Visibility",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    title: "Marketing Training 1 (Competencies)",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    title: "Online Course Duration 20 Days",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 9,
    title: "Marketing Training 1 (Competencies)",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 10,
    title: "CSS Essentials",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 11,
    title: "Java Fundamentals",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 12,
    title: "SQL Essentials",
    tag: "Marketing",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=900&q=80",
  },
];

const TaskCatalog = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [embeddedCourseId, setEmbeddedCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [assignmentView, setAssignmentView] = useState("open");
  const [uploadedByTask] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("course_task_uploads") || "{}");
    } catch {
      return {};
    }
  });

  const enrichedCourses = useMemo(
    () =>
      courses.map((course) => ({
        ...course,
        courseCode: `CRS-${String(course.id).padStart(3, "0")}`,
        tag: ["Marketing", "Design", "Leadership", "Development"][course.id % 4],
        lessons: 12 + (course.id % 6) * 2,
        duration: `${3 + (course.id % 4)}h ${15 + course.id * 2}m`,
        level: course.id % 2 === 0 ? "Intermediate" : "Beginner",
        instructor: ["Alex Perera", "Naduni Silva", "Kevin Fernando", "Ishara De Zoysa"][course.id % 4],
        description:
          "Build practical skills with guided lessons, real examples, and step-by-step activities for job-ready outcomes.",
      })),
    []
  );

  const tagOptions = useMemo(
    () => ["all", ...new Set(enrichedCourses.map((course) => course.tag))],
    [enrichedCourses]
  );

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return enrichedCourses.filter((course) => {
      const matchesQuery =
        query.length === 0 ||
        course.title.toLowerCase().includes(query) ||
        course.tag.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.level.toLowerCase().includes(query);

      const matchesTag = selectedTag === "all" || course.tag === selectedTag;
      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;

      return matchesQuery && matchesTag && matchesLevel;
    });
  }, [enrichedCourses, searchTerm, selectedTag, selectedLevel]);

  const urlCourseId = Number(courseId);
  const selectedCourseId = embedded ? embeddedCourseId : Number.isNaN(urlCourseId) ? null : urlCourseId;
  const selectedCourse = enrichedCourses.find((course) => course.id === selectedCourseId) || null;
  const {
    data: tasksData = [],
    isLoading: isTasksLoading,
    isError: isTasksError,
  } = useQuery({
    queryKey: ["tasks_details"],
    queryFn: async () => {
      const res = await fetch(backendUrl);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to load tasks");
      return result;
    },
  });

  const selectedCourseTasks = useMemo(() => {
    if (!selectedCourse) return [];
    const code = selectedCourse.courseCode.toLowerCase();
    const id = String(selectedCourse.id);

    return tasksData.filter((task) => {
      const projectId = String(task.project_id || "").trim().toLowerCase();
      return projectId === code || projectId === id;
    });
  }, [tasksData, selectedCourse]);

  const courseProgressByCode = useMemo(() => {
    const progressMap = {};

    for (const course of enrichedCourses) {
      const code = course.courseCode.toLowerCase();
      const id = String(course.id);
      const linkedTasks = tasksData.filter((task) => {
        const projectId = String(task.project_id || "").trim().toLowerCase();
        return projectId === code || projectId === id;
      });

      const completedCount = linkedTasks.filter(
        (task) => String(task.status || "").trim().toLowerCase() === "completed"
      ).length;

      const percent = linkedTasks.length > 0 ? Math.round((completedCount / linkedTasks.length) * 100) : 0;
      progressMap[course.courseCode] = {
        percent,
        completedCount,
        totalCount: linkedTasks.length,
      };
    }

    return progressMap;
  }, [enrichedCourses, tasksData]);

  const openAssignments = useMemo(
    () =>
      selectedCourseTasks.filter((task) => {
        const isCompleted = String(task.status || "").trim().toLowerCase() === "completed";
        return !uploadedByTask[task.id] && !isCompleted;
      }),
    [selectedCourseTasks, uploadedByTask]
  );

  const submittedAssignments = useMemo(
    () =>
      selectedCourseTasks.filter((task) => {
        const isCompleted = String(task.status || "").trim().toLowerCase() === "completed";
        return Boolean(uploadedByTask[task.id]) || isCompleted;
      }),
    [selectedCourseTasks, uploadedByTask]
  );

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const res = await fetch(`${backendUrl}/${taskId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to delete task");
      return result;
    },
    onSuccess: (_, taskId) => {
      queryClient.setQueryData(["tasks_details"], (current = []) =>
        current.filter((task) => String(task.id) !== String(taskId))
      );

      try {
        const storedUploads = JSON.parse(localStorage.getItem("course_task_uploads") || "{}");
        delete storedUploads[taskId];
        localStorage.setItem("course_task_uploads", JSON.stringify(storedUploads));
      } catch {
        // Ignore malformed local storage and continue refreshing server state.
      }

      queryClient.invalidateQueries({ queryKey: ["tasks_details"] });
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleOpenCourse = (course) => {
    if (embedded) {
      setEmbeddedCourseId(course.id);
      setAssignmentView("open");
      return;
    }
    navigate(`/TaskCatalog/${course.id}`);
  };

  const handleBack = () => {
    if (embedded) {
      setEmbeddedCourseId(null);
      setAssignmentView("open");
      return;
    }
    navigate("/TaskCatalog");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("all");
    setSelectedLevel("all");
  };

  const formatFileSize = (size = 0) => {
    if (!size) return "Unknown size";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
    return `${Math.round(size / 104857.6) / 10} MB`;
  };

  const formatLongDate = (value) =>
    new Date(value).toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const renderTaskDocument = (task) => {
    if (!task.pdf_url) {
      return <p className="text-xs text-slate-400">No task PDF</p>;
    }

    return (
      <a
        href={task.pdf_url}
        download={task.pdf_name || "assignment.pdf"}
        className="inline-flex items-center rounded-md bg-[#eaf8ff] px-2 py-1 text-xs font-semibold text-[#0f84bb] transition hover:bg-[#d9f1ff]"
      >
        {task.pdf_name || "Download PDF"}
      </a>
    );
  };

  const renderAssignmentRows = (tasks, section) =>
    tasks.map((task) => {
      const submission = uploadedByTask[task.id];
      const isSubmitted = Boolean(submission) || String(task.status || "").trim().toLowerCase() === "completed";

      return (
        <tr key={task.id} className="border-t border-slate-200 text-sm text-slate-700">
          <td className="px-3 py-3 text-slate-500">{selectedCourse?.courseCode}</td>
          <td className="px-3 py-3">
            <div className="space-y-2">
              <p className="font-semibold text-[#1f5f9a]">{task.title}</p>
              <p className="text-xs leading-5 text-slate-500">
                {String(task.description || "").trim() || "No description"}
              </p>
              {renderTaskDocument(task)}
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="space-y-1 text-xs">
              <p>
                Due: {task.deadline ? formatLongDate(task.deadline) : "No deadline"}
              </p>
              <p className={isSubmitted ? "text-[#1f5f9a]" : "text-slate-500"}>
                {isSubmitted ? "Download submissions" : "Not submitted"}
              </p>
              <p className="text-slate-500">
                {submission ? new Date(submission.uploadedAt).toLocaleTimeString() : "@ 00:40"}
              </p>
              {submission && (
                <p className="text-[#1f5f9a]">
                  {submission.fileName} ({formatFileSize(submission.fileSize)})
                </p>
              )}
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <TasksModel type="update" data={task}>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <FiEdit2 />
                  Edit
                </button>
              </TasksModel>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this assignment?")) {
                    deleteTaskMutation.mutate(task.id);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              >
                <FiTrash2 />
                Remove
              </button>
            </div>
          </td>
        </tr>
      );
    });

  return (
    <div
      className={`[font-family:'Sora',sans-serif] text-slate-800 ${
        embedded ? "w-full" : "min-h-screen bg-[#f3f4f6] px-4 py-5 sm:px-6 lg:px-8"
      }`}
    >
      <div
        className={`${
          embedded
            ? "w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            : "mx-auto max-w-[1400px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-700">Course catalog</h1>
        </div>

        <div>
          <section className="min-w-0">
            {!selectedCourse && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <label className="relative min-w-[240px] flex-1">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Courses & Category"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full rounded-lg border border-[#8dd2f0] bg-white py-2 pl-9 pr-3 text-xs outline-none ring-0 placeholder:text-slate-400 focus:border-[#30a8dd]"
                  />
                </label>

                <select
                  value={selectedTag}
                  onChange={(event) => setSelectedTag(event.target.value)}
                  className="h-[34px] min-w-[130px] rounded-lg border border-[#8dd2f0] bg-white px-3 text-xs text-slate-600 outline-none"
                >
                  <option value="all">All Tags</option>
                  {tagOptions
                    .filter((tag) => tag !== "all")
                    .map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                </select>

                <select
                  value={selectedLevel}
                  onChange={(event) => setSelectedLevel(event.target.value)}
                  className="h-[34px] min-w-[130px] rounded-lg border border-[#8dd2f0] bg-white px-3 text-xs text-slate-600 outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                </select>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-[#8dd2f0] bg-white text-[#1da8e2]"
                  aria-label="Clear filters"
                  title="Clear filters"
                >
                  <FiFilter />
                </button>
              </div>
            )}

            {!selectedCourse && (
              <p className="mb-3 text-xs text-slate-500">
                Showing {filteredCourses.length} of {enrichedCourses.length} courses
              </p>
            )}

            {selectedCourse ? (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <FiArrowLeft />
                  Back to catalog
                </button>

                <img
                  src={selectedCourse.image}
                  alt={selectedCourse.title}
                  className="h-48 w-full rounded-xl object-cover sm:h-64"
                />

                <div className="mt-4">
                  <p className="mb-2 inline-block rounded-full bg-[#eaf8ff] px-3 py-1 text-xs font-semibold text-[#0f84bb]">
                    {selectedCourse.tag}
                  </p>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
                    Course ID: {selectedCourse.courseCode}
                  </p>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">{selectedCourse.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedCourse.description}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-1 text-xs text-slate-500">Instructor</p>
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <FiUser /> {selectedCourse.instructor}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-1 text-xs text-slate-500">Duration</p>
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <FiClock /> {selectedCourse.duration}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-1 text-xs text-slate-500">Lessons</p>
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <FiBookOpen /> {selectedCourse.lessons} lessons
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded bg-slate-200">
                    <div
                      className="h-full rounded bg-[#1da8e2]"
                      style={{ width: `${courseProgressByCode[selectedCourse.courseCode]?.percent || 0}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs font-semibold text-[#1da8e2]">
                    Progress {courseProgressByCode[selectedCourse.courseCode]?.percent || 0}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Completed {courseProgressByCode[selectedCourse.courseCode]?.completedCount || 0} of{" "}
                    {courseProgressByCode[selectedCourse.courseCode]?.totalCount || 0} tasks
                  </p>

                  <button className="mt-5 rounded-lg bg-[#0f84bb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d739f]">
                    Continue Course
                  </button>
                </div>

                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Course Tasks</h3>
                      <p className="text-xs text-slate-500">
                        Linked by `project_id` = {selectedCourse.courseCode} ({selectedCourseTasks.length} tasks)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <TasksModel
                        initialData={{
                          project_id: selectedCourse.courseCode,
                          title: `${selectedCourse.title} Task`,
                          priority: "medium",
                          status: "in-progress",
                          deadline: new Date().toISOString().slice(0, 10),
                        }}
                      >
                        <button
                          type="button"
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Add Task
                        </button>
                      </TasksModel>
                      <button
                        type="button"
                        onClick={() => setAssignmentView("open")}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          assignmentView === "open"
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Open Assignments
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignmentView("submitted")}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          assignmentView === "submitted"
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Submitted Assignments
                      </button>
                    </div>
                  </div>

                  {isTasksLoading && <p className="text-sm text-slate-500">Loading tasks...</p>}
                  {isTasksError && <p className="text-sm text-red-500">Could not load tasks.</p>}

                  {!isTasksLoading && !isTasksError && selectedCourseTasks.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                      No tasks for this course yet.
                    </div>
                  )}

                  {!isTasksLoading && !isTasksError && selectedCourseTasks.length > 0 && (
                    <div>
                      {assignmentView === "open" ? (
                        <section>
                        <h4 className="mb-3 text-3xl font-bold tracking-tight text-slate-700">Open Assignments</h4>
                        <div className="overflow-x-auto border border-slate-200 bg-white">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-white text-[#1f5f9a]">
                              <tr className="border-b border-slate-200">
                                <th className="px-3 py-2 font-semibold">Module</th>
                                <th className="px-3 py-2 font-semibold">Assignment</th>
                                <th className="px-3 py-2 font-semibold">DeadLine</th>
                                <th className="px-3 py-2 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {openAssignments.length > 0 ? (
                                renderAssignmentRows(openAssignments, "open")
                              ) : (
                                <tr className="border-t border-slate-200 text-sm text-slate-500">
                                  <td colSpan="4" className="px-3 py-4">
                                    No open assignments.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        </section>
                      ) : (
                        <section>
                        <h4 className="mb-3 text-3xl font-bold tracking-tight text-slate-700">Submitted Assignments</h4>
                        <div className="overflow-x-auto border border-slate-200 bg-white">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-white text-[#1f5f9a]">
                              <tr className="border-b border-slate-200">
                                <th className="px-3 py-2 font-semibold">Module</th>
                                <th className="px-3 py-2 font-semibold">Assignment</th>
                                <th className="px-3 py-2 font-semibold">DeadLine</th>
                                <th className="px-3 py-2 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {submittedAssignments.length > 0 ? (
                                renderAssignmentRows(submittedAssignments, "submitted")
                              ) : (
                                <tr className="border-t border-slate-200 text-sm text-slate-500">
                                  <td colSpan="4" className="px-3 py-4">
                                    No submitted assignments yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        </section>
                      )}
                    </div>
                  )}

                </div>
              </section>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {filteredCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => handleOpenCourse(course)}
                      className="overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition hover:shadow-md"
                    >
                      <img src={course.image} alt={course.title} className="h-24 w-full object-cover" loading="lazy" />
                      <div className="space-y-2 p-2.5">
                        <p className="text-[10px] font-semibold tracking-wide text-slate-500">ID: {course.courseCode}</p>
                        <h2 className="line-clamp-2 min-h-[2.3rem] text-[11px] font-semibold leading-[1.1rem] text-slate-700">
                          {course.title}
                        </h2>
                        <p className="text-[10px] text-slate-400">{course.tag}</p>
                        <div className="h-1.5 overflow-hidden rounded bg-slate-200">
                          <div
                            className="h-full rounded bg-[#1da8e2]"
                            style={{ width: `${courseProgressByCode[course.courseCode]?.percent || 0}%` }}
                          />
                        </div>
                        <div className="text-right text-[10px] font-semibold text-[#1da8e2]">
                          {courseProgressByCode[course.courseCode]?.percent || 0}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {filteredCourses.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-700">No courses found</p>
                    <p className="mt-1 text-xs text-slate-500">Try another keyword or clear filters.</p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TaskCatalog;
