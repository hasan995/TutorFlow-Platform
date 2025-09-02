import React, { useEffect, useMemo, useState } from "react";
import {
  getAdminSummary,
  listUsers,
  listPendingCourses,
  listInstructorRequests,
  approveInstructor,
  rejectInstructor,
  approveCourse,
  rejectCourse,
} from "../../api/api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  BookOpen,
  Home,
  Library,
  Video,
  Trash2,
} from "lucide-react";
import { deleteUser } from "../../api/api.js";
import { useNotifications } from "../../contexts/NotificationContext";
import SalesAnalytics from "../../components/SalesAnalytics";

const Card: React.FC<{ title: string; value: number | string }> = ({
  title,
  value,
}) => (
  <div className="p-6 rounded-xl bg-white shadow">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
  </div>
);

type TabKey = "pending" | "students" | "instructors" | "analytics";
type AdminSummary = {
  totals?: { users?: number; instructors?: number; courses?: number };
  pending?: { instructor_requests?: number; courses?: number };
};
type InstructorRequest = {
  id: number;
  user_id: number;
  email: string;
  name?: string;
  motivation: string;
  status: string;
  created_at?: string;
};
type CourseRequest = {
  id: number;
  title: string;
  instructor?: number;
  instructor_profile?: { username?: string } | null;
  status: string;
};
type StudentUser = {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  enrolled_courses_count?: number;
  status?: "Active" | "Inactive";
};
type InstructorUser = {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  approved_courses_count?: number;
  status?: "Approved" | "Pending";
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  // Pending approvals state
  const [instructorRequests, setInstructorRequests] = useState<
    InstructorRequest[]
  >([]);
  const [pendingCourses, setPendingCourses] = useState<CourseRequest[]>([]);
  const [instructorReqSearch, setInstructorReqSearch] = useState("");
  const [courseReqSearch, setCourseReqSearch] = useState("");

  // Students state
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatus, setStudentStatus] = useState<
    "All" | "Active" | "Inactive"
  >("All");

  // Instructors state
  const [instructors, setInstructors] = useState<InstructorUser[]>([]);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorStatus, setInstructorStatus] = useState<
    "All" | "Approved" | "Pending"
  >("All");
  const { notifications } = useNotifications();
  const [pendingTab, setPendingTab] = useState<
    "instructors" | "courses" | "rejected"
  >("instructors");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminSummary();
        setSummary(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadPending = async () => {
      try {
        const [reqs, courses] = await Promise.all([
          listInstructorRequests(),
          listPendingCourses(),
        ]);
        setInstructorRequests(reqs);
        setPendingCourses(courses);
      } catch {
        // no-op
      }
    };
    loadPending();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await listUsers({ role: "student" });
        setStudents(data);
      } catch {
        // no-op
      }
    };
    const loadInstructors = async () => {
      try {
        const data = await listUsers({ role: "instructor" });
        setInstructors(data);
      } catch {
        // no-op
      }
    };
    loadStudents();
    loadInstructors();
  }, []);

  // Refresh pending lists when relevant notifications arrive
  useEffect(() => {
    if (!notifications?.length) return;
    const latest = notifications[0] as {
      title?: string;
      notification_type?: string;
    };
    const title = latest?.title || "";
    const type = latest?.notification_type || "";
    const isRelevant =
      title.includes("Instructor Request") ||
      title.includes("Course Approval Needed") ||
      type === "course_update";
    if (isRelevant) {
      (async () => {
        try {
          const [reqs, courses] = await Promise.all([
            listInstructorRequests(),
            listPendingCourses(),
          ]);
          setInstructorRequests(reqs);
          setPendingCourses(courses);
        } catch {
          // ignore
        }
      })();
    }
  }, [notifications]);

  // Filters
  const filteredStudents = useMemo(() => {
    return students.filter((u) => {
      const matchesSearch = `${u.first_name || ""} ${u.last_name || ""} ${
        u.email || ""
      }`
        .toLowerCase()
        .includes(studentSearch.toLowerCase());
      const matchesStatus =
        studentStatus === "All" || u.status === studentStatus;
      return matchesSearch && matchesStatus;
    });
  }, [students, studentSearch, studentStatus]);

  const filteredInstructors = useMemo(() => {
    return instructors.filter((u) => {
      const matchesSearch = `${u.first_name || ""} ${u.last_name || ""} ${
        u.email || ""
      }`
        .toLowerCase()
        .includes(instructorSearch.toLowerCase());
      const matchesStatus =
        instructorStatus === "All" || u.status === instructorStatus;
      return matchesSearch && matchesStatus;
    });
  }, [instructors, instructorSearch, instructorStatus]);

  const filteredInstructorRequests = useMemo(() => {
    const q = instructorReqSearch.toLowerCase();
    if (!q) return instructorRequests;
    return instructorRequests.filter((r) =>
      `${r.name || ""} ${r.email || ""}`.toLowerCase().includes(q)
    );
  }, [instructorRequests, instructorReqSearch]);

  const filteredPendingInstructorRequests = useMemo(() => {
    return filteredInstructorRequests.filter(
      (r: InstructorRequest) => (r as InstructorRequest).status === "pending"
    );
  }, [filteredInstructorRequests]);

  const filteredRejectedInstructorRequests = useMemo(() => {
    return filteredInstructorRequests.filter(
      (r: InstructorRequest) => (r as InstructorRequest).status === "rejected"
    );
  }, [filteredInstructorRequests]);

  const filteredCourseRequests = useMemo(() => {
    const q = courseReqSearch.toLowerCase();
    if (!q) return pendingCourses;
    return pendingCourses.filter((c) =>
      `${c.title || ""} ${c.instructor_profile?.username || c.instructor || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [pendingCourses, courseReqSearch]);

  // Approvals handlers with optimistic UI
  const approveInstructorRow = async (id: number) => {
    setInstructorRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await approveInstructor(id);
    } catch {
      // revert on error
      const fresh = await listInstructorRequests();
      setInstructorRequests(fresh);
    }
  };
  const rejectInstructorRow = async (id: number) => {
    setInstructorRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      await rejectInstructor(id, "");
    } catch {
      const fresh = await listInstructorRequests();
      setInstructorRequests(fresh);
    }
  };
  const approveCourseRow = async (id: number) => {
    setPendingCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      await approveCourse(id);
    } catch {
      const fresh = await listPendingCourses();
      setPendingCourses(fresh);
    }
  };
  const rejectCourseRow = async (id: number) => {
    setPendingCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      await rejectCourse(id, "");
    } catch {
      const fresh = await listPendingCourses();
      setPendingCourses(fresh);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent border-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-purple-500 border-l-transparent animate-[spin_1.2s_linear_infinite]"></div>
        </div>
      </div>
    );
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const statusBadge = (status: string) => {
    const normalized = (status || "").toLowerCase();
    const base =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    if (normalized === "approved")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>Approved</span>
      );
    if (normalized === "rejected")
      return (
        <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>
      );
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
    );
  };

  const btnBase =
    "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors whitespace-nowrap";
  const btnApprove = `${btnBase} bg-green-600 text-white hover:bg-green-700 active:bg-green-800`;
  const btnReject = `${btnBase} bg-red-600 text-white hover:bg-red-700 active:bg-red-800`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 md:flex md:gap-6">
        {/* Sidebar navigation to other routes */}
        <aside className="md:w-64 shrink-0 mb-6 md:mb-0">
          <nav className="sticky top-20 bg-white rounded-xl shadow p-4 space-y-1">
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Home className="h-4 w-4" /> Home
            </a>
            <a
              href="/courses"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Library className="h-4 w-4" /> Courses
            </a>
            <a
              href="/sessions"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Video className="h-4 w-4" /> Sessions
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card title="Users" value={summary?.totals?.users || 0} />
            <Card
              title="Instructors"
              value={summary?.totals?.instructors || 0}
            />
            <Card title="Courses" value={summary?.totals?.courses || 0} />
            <Card
              title="Pending Requests"
              value={
                (summary?.pending?.instructor_requests || 0) +
                (summary?.pending?.courses || 0)
              }
            />
          </div>

          <div className="rounded-xl bg-white shadow">
            <div className="border-b px-4">
              <div className="flex gap-4">
                {[
                  { key: "pending", label: "Pending Approvals" },
                  { key: "students", label: "All Students" },
                  { key: "instructors", label: "All Instructors" },
                  { key: "analytics", label: "Sales Analytics" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as TabKey)}
                    className={`relative py-3 px-4 -mb-px font-medium ${
                      activeTab === t.key
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t.label}
                    {activeTab === t.key && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "pending" && (
                  <motion.div
                    key="pending"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="mb-4 border-b px-1">
                      <div className="flex gap-4">
                        {[
                          { key: "instructors", label: "Instructor Requests" },
                          { key: "rejected", label: "Rejected Instructors" },
                          { key: "courses", label: "Course Requests" },
                        ].map((t) => (
                          <button
                            key={t.key}
                            onClick={() => setPendingTab(t.key as any)}
                            className={`relative py-2 px-3 -mb-px text-sm font-medium ${
                              pendingTab === t.key
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {t.label}
                            {pendingTab === t.key && (
                              <motion.div
                                layoutId="pending-underline"
                                className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-1 gap-6">
                      {pendingTab === "instructors" && (
                        <div className="bg-white rounded-xl shadow p-4 md:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                                <UserPlus className="h-5 w-5" />
                              </div>
                              <div>
                                <h2 className="text-base md:text-lg font-semibold leading-tight">
                                  Instructor Requests
                                </h2>
                                <p className="text-xs text-gray-500">
                                  {filteredPendingInstructorRequests.length}{" "}
                                  pending
                                </p>
                              </div>
                            </div>
                            <div className="relative w-full max-w-xs">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                value={instructorReqSearch}
                                onChange={(e) =>
                                  setInstructorReqSearch(e.target.value)
                                }
                                placeholder="Search by user or email"
                                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed">
                              <colgroup>
                                <col className="w-[20%]" />
                                <col className="w-[28%]" />
                                <col className="w-[36%]" />
                                <col className="w-[16%]" />
                              </colgroup>
                              <thead>
                                <tr className="text-gray-600 text-sm">
                                  <th className="py-2">User</th>
                                  <th className="py-2">Email</th>
                                  <th className="py-2">Motivation</th>
                                  <th className="py-2">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <AnimatePresence>
                                  {filteredPendingInstructorRequests.map(
                                    (r) => (
                                      <motion.tr
                                        key={r.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="border-t hover:bg-gray-50 transition-colors"
                                      >
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                          {r.name || r.user_id}
                                        </td>
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                          {r.email}
                                        </td>
                                        <td
                                          className="py-2 pr-3 truncate"
                                          title={r.motivation}
                                        >
                                          {r.motivation}
                                        </td>
                                        <td className="py-2">
                                          <div className="flex gap-2">
                                            <button
                                              className={btnApprove}
                                              onClick={() =>
                                                approveInstructorRow(r.id)
                                              }
                                            >
                                              Approve
                                            </button>
                                            <button
                                              className={btnReject}
                                              onClick={() =>
                                                rejectInstructorRow(r.id)
                                              }
                                            >
                                              Reject
                                            </button>
                                          </div>
                                        </td>
                                      </motion.tr>
                                    )
                                  )}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {pendingTab === "rejected" && (
                        <div className="bg-white rounded-xl shadow p-4 md:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                                <UserPlus className="h-5 w-5" />
                              </div>
                              <div>
                                <h2 className="text-base md:text-lg font-semibold leading-tight">
                                  Rejected Instructors
                                </h2>
                                <p className="text-xs text-gray-500">
                                  {filteredRejectedInstructorRequests.length}{" "}
                                  rejected
                                </p>
                              </div>
                            </div>
                            <div className="relative w-full max-w-xs">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                value={instructorReqSearch}
                                onChange={(e) =>
                                  setInstructorReqSearch(e.target.value)
                                }
                                placeholder="Search by user or email"
                                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed">
                              <colgroup>
                                <col className="w-[20%]" />
                                <col className="w-[28%]" />
                                <col className="w-[36%]" />
                                <col className="w-[16%]" />
                              </colgroup>
                              <thead>
                                <tr className="text-gray-600 text-sm">
                                  <th className="py-2">User</th>
                                  <th className="py-2">Email</th>
                                  <th className="py-2">Motivation</th>
                                  <th className="py-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <AnimatePresence>
                                  {filteredRejectedInstructorRequests.map(
                                    (r) => (
                                      <motion.tr
                                        key={r.id}
                                        layout
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="border-t hover:bg-gray-50 transition-colors"
                                      >
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                          {r.name || r.user_id}
                                        </td>
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                          {r.email}
                                        </td>
                                        <td
                                          className="py-2 pr-3 truncate"
                                          title={r.motivation}
                                        >
                                          {r.motivation}
                                        </td>
                                        <td className="py-2">
                                          {statusBadge(
                                            (r as InstructorRequest).status
                                          )}
                                        </td>
                                      </motion.tr>
                                    )
                                  )}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {pendingTab === "courses" && (
                        <div className="bg-white rounded-xl shadow p-4 md:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <div>
                                <h2 className="text-base md:text-lg font-semibold leading-tight">
                                  Course Requests
                                </h2>
                                <p className="text-xs text-gray-500">
                                  {pendingCourses.length} pending
                                </p>
                              </div>
                            </div>
                            <div className="relative w-full max-w-xs">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                value={courseReqSearch}
                                onChange={(e) =>
                                  setCourseReqSearch(e.target.value)
                                }
                                placeholder="Search by title or instructor"
                                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed">
                              <colgroup>
                                <col className="w-[36%]" />
                                <col className="w-[28%]" />
                                <col className="w-[16%]" />
                                <col className="w-[20%]" />
                              </colgroup>
                              <thead>
                                <tr className="text-gray-600 text-sm">
                                  <th className="py-2">Title</th>
                                  <th className="py-2">Instructor</th>
                                  <th className="py-2">Status</th>
                                  <th className="py-2">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <AnimatePresence>
                                  {filteredCourseRequests.map((c) => (
                                    <motion.tr
                                      key={c.id}
                                      layout
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0 }}
                                      className="border-t hover:bg-gray-50 transition-colors"
                                    >
                                      <td className="py-2">{c.title}</td>
                                      <td className="py-2">
                                        {c.instructor_profile?.username ||
                                          c.instructor}
                                      </td>
                                      <td className="py-2">
                                        {statusBadge(c.status)}
                                      </td>
                                      <td className="py-2">
                                        <div className="flex gap-2">
                                          <button
                                            className={btnApprove}
                                            onClick={() =>
                                              approveCourseRow(c.id)
                                            }
                                          >
                                            Approve
                                          </button>
                                          <button
                                            className={btnReject}
                                            onClick={() =>
                                              rejectCourseRow(c.id)
                                            }
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "students" && (
                  <motion.div
                    key="students"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                      <input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full md:w-80 px-3 py-2 border rounded"
                      />
                      <select
                        value={studentStatus}
                        onChange={(e) =>
                          setStudentStatus(
                            e.target.value as "All" | "Active" | "Inactive"
                          )
                        }
                        className="px-3 py-2 border rounded w-full md:w-48"
                      >
                        <option>All</option>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-600 text-sm">
                          <th className="py-2">Name</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Enrolled Courses</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredStudents.map((s: StudentUser) => (
                            <motion.tr
                              key={s.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="border-t"
                            >
                              <td className="py-2">
                                {`${s.first_name || ""} ${
                                  s.last_name || ""
                                }`.trim() ||
                                  s.username ||
                                  s.email}
                              </td>
                              <td className="py-2">{s.email}</td>
                              <td className="py-2">
                                {s.enrolled_courses_count ?? 0}
                              </td>
                              <td className="py-2">
                                {s.status ||
                                  (s.is_active ? "Active" : "Inactive")}
                              </td>
                              <td className="py-2">
                                <button
                                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
                                  onClick={async () => {
                                    if (
                                      !confirm(
                                        "Delete this user? This cannot be undone."
                                      )
                                    )
                                      return;
                                    const snapshot = [...students];
                                    setStudents((prev) =>
                                      prev.filter((u) => u.id !== s.id)
                                    );
                                    try {
                                      await deleteUser(s.id as number);
                                    } catch (e) {
                                      // revert on failure
                                      setStudents(snapshot as any);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {activeTab === "instructors" && (
                  <motion.div
                    key="instructors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                      <input
                        value={instructorSearch}
                        onChange={(e) => setInstructorSearch(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full md:w-80 px-3 py-2 border rounded"
                      />
                      <select
                        value={instructorStatus}
                        onChange={(e) =>
                          setInstructorStatus(
                            e.target.value as "All" | "Approved" | "Pending"
                          )
                        }
                        className="px-3 py-2 border rounded w-full md:w-48"
                      >
                        <option>All</option>
                        <option>Approved</option>
                        <option>Pending</option>
                      </select>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-600 text-sm">
                          <th className="py-2">Name</th>
                          <th className="py-2">Email</th>
                          <th className="py-2">Approved Courses</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {filteredInstructors.map((i: InstructorUser) => (
                            <motion.tr
                              key={i.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="border-t"
                            >
                              <td className="py-2">
                                {`${i.first_name || ""} ${
                                  i.last_name || ""
                                }`.trim() ||
                                  i.username ||
                                  i.email}
                              </td>
                              <td className="py-2">{i.email}</td>
                              <td className="py-2">
                                {i.approved_courses_count ?? 0}
                              </td>
                              <td className="py-2">{i.status || "Approved"}</td>
                              <td className="py-2">
                                <button
                                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
                                  onClick={async () => {
                                    if (
                                      !confirm(
                                        "Delete this user? This cannot be undone."
                                      )
                                    )
                                      return;
                                    const snapshot = [...instructors];
                                    setInstructors((prev) =>
                                      prev.filter((u) => u.id !== i.id)
                                    );
                                    try {
                                      await deleteUser(i.id as number);
                                    } catch (e) {
                                      // revert on failure
                                      setInstructors(snapshot as any);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </motion.div>
                )}
                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="grid grid-cols-1 gap-6">
                      <SalesAnalytics />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
