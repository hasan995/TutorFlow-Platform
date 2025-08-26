// src/pages/CourseDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourse,
  getCourseReviews,
  enrollInCourse,
  initiatePayment,
  getCourseVideos, // fallback for curriculum if getCourseContent doesn't exist
} from "../api/api";
import {
  BookOpen,
  Star,
  StarHalf,
  Star as StarOutline,
  PlayCircle,
  Share2,
  Gift,
  Heart,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock3,
  FileText,
  Download,
  Smartphone,
  MonitorSmartphone,
  Award,
  ArrowRight,
} from "lucide-react";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const formatCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;
const percentOff = (orig, price) =>
  orig && price && orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
const formatDuration = (mins) => {
  const m = Number(mins || 0);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h <= 0) return `${mm}m`;
  return `${h}h ${mm}m`;
};

const Stars = ({ rating = 0, size = 16, className = "" }) => {
  const r = clamp(rating, 0, 5);
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div
      className={`flex items-center ${className}`}
      aria-label={`${r} out of 5`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`f-${i}`}
          className="text-yellow-500"
          size={size}
          fill="currentColor"
        />
      ))}
      {half === 1 && (
        <StarHalf className="text-yellow-500" size={size} fill="currentColor" />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <StarOutline key={`e-${i}`} className="text-yellow-500" size={size} />
      ))}
    </div>
  );
};

const SectionHeader = ({ title, id }) => (
  <h2 id={id} className="text-xl font-semibold mb-4 scroll-mt-24">
    {title}
  </h2>
);

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const useScrollSpy = (ids) => {
  const [active, setActive] = useState(ids[0] || "");
  useEffect(() => {
    const observers = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids.join(",")]);
  return [active, setActive];
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [reviews, setReviews] = useState({ results: [], count: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");

  const sections = useMemo(
    () => ["overview", "content", "instructor", "reviews", "faq"],
    []
  );
  const [activeTab] = useScrollSpy(sections);

  // Fetch data
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const c = await getCourse(id);
        if (!mounted) return;
        setCourse(c);
        setIsEnrolled(Boolean(c?.is_enrolled));
      } catch (e) {
        console.error("Failed to load course", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const loadCurriculum = async () => {
      try {
        setLoadingCurriculum(true);
        // Using videos as curriculum if course content API is not available
        const items = await getCourseVideos(id);
        if (!mounted) return;
        // Shape to sections → lectures
        const section = {
          id: 1,
          title: "Course Content",
          lecture_count: Array.isArray(items) ? items.length : 0,
          total_length: Array.isArray(items)
            ? items.reduce((a, v) => a + Number(v.length_minutes || 0), 0)
            : 0,
          lectures: Array.isArray(items)
            ? items.map((v) => ({
                id: v.id,
                title: v.title || "Lecture",
                length: Number(v.length_minutes || 0),
                is_preview: Boolean(v.is_preview),
              }))
            : [],
        };
        setCurriculum([section]);
      } catch (e) {
        console.error("Failed to load curriculum", e);
      } finally {
        setLoadingCurriculum(false);
      }
    };
    loadCurriculum();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const loadReviews = async (page = 1) => {
      try {
        setLoadingReviews(true);
        const data = await getCourseReviews(id, { page, sort: sortBy });
        if (!mounted) return;
        setReviews({
          results: data.results || [],
          count: data.count || 0,
          page,
        });
      } catch (e) {
        console.error("Failed to load reviews", e);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews(1);
    return () => {
      mounted = false;
    };
  }, [id, sortBy]);

  const isInstructor = useMemo(() => {
    return user?.role === "instructor" && course?.instructor?.id === user?.id;
  }, [user, course]);

  const original = Number(course?.original_price || 0);
  const current = Number(course?.price ?? 0);
  const off = percentOff(original, current);

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const data = await initiatePayment(id);
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (e) {
      console.error("Payment initiation failed", e);
      alert("Payment initiation failed. Please try again.");
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setEnrolling(true);
      await enrollInCourse(id);
      setIsEnrolled(true);
      navigate(`/courses/${id}`);
    } catch (e) {
      console.error("Enroll failed", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const scrollTo = (anchor) => {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-16">
      {/* Sticky micro-nav */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="hidden lg:flex items-center gap-4 text-sm">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className={`px-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeTab === s
                    ? "text-blue-700 font-semibold"
                    : "text-gray-600"
                }`}
                aria-current={activeTab === s ? "page" : undefined}
              >
                {s === "content"
                  ? "Curriculum"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate max-w-md">
              {course?.title}
            </p>
            <Stars rating={course?.rating || 0} size={14} />
            <span className="text-xs text-gray-600 whitespace-nowrap">
              ({course?.rating_count || 0})
            </span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="py-6" aria-labelledby="course-hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {loading ? (
              <>
                <Skeleton className="h-8 w-4/5 mb-3" />
                <Skeleton className="h-4 w-2/5 mb-4" />
                <Skeleton className="h-44 w-full rounded-2xl" />
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 line-clamp-2">
                  {course?.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 mb-4">
                  {course?.category_name && (
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      {course.category_name}
                    </span>
                  )}
                  {course?.last_updated && (
                    <span>Last updated {course.last_updated}</span>
                  )}
                  {course?.language && <span>{course.language}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Stars rating={course?.rating || 0} />
                  <span className="text-sm text-gray-700">
                    {Number(course?.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({course?.rating_count || 0} ratings)
                  </span>
                  {typeof course?.students_count === "number" && (
                    <span className="text-sm text-gray-600">
                      {course.students_count} students
                    </span>
                  )}
                </div>
                {/* Media preview */}
                {course?.image && (
                  <div className="relative rounded-2xl overflow-hidden group border">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={() => setPreviewOpen(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition focus:outline-none"
                      aria-label="Preview this course"
                    >
                      <PlayCircle className="h-14 w-14 text-white drop-shadow" />
                    </button>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm flex items-center gap-2"
                    aria-label="Share"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm flex items-center gap-2"
                    aria-label="Gift"
                  >
                    <Gift className="h-4 w-4" /> Gift
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm flex items-center gap-2"
                    aria-label="Wishlist"
                  >
                    <Heart className="h-4 w-4" /> Wishlist
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Sticky purchase card */}
          <aside className="lg:col-span-4 lg:block">
            <div className="lg:sticky lg:top-24">
              {loading ? (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <Skeleton className="h-8 w-40 mb-3" />
                  <Skeleton className="h-10 w-full mb-3" />
                  <Skeleton className="h-10 w-full mb-3" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  {/* Price block */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-extrabold text-gray-900 whitespace-nowrap truncate">
                        {formatCurrency(current)}
                      </span>
                      {original > current && (
                        <>
                          <span className="text-gray-500 line-through whitespace-nowrap truncate">
                            {formatCurrency(original)}
                          </span>
                          {off > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                              -{off}%
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* CTA states */}
                  {isInstructor ? (
                    <button
                      onClick={() => navigate(`/courses/${id}/edit`)}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-black"
                    >
                      Manage Course
                    </button>
                  ) : isEnrolled ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => navigate(`/courses/${id}`)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg"
                      >
                        Go to Course
                      </button>
                      <button
                        onClick={() => navigate(`/courses/${id}`)}
                        className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200"
                      >
                        Resume Lecture
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        You own this course
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleBuyNow}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg"
                      >
                        Buy now
                      </button>
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50"
                      >
                        {enrolling ? "Processing..." : "Enroll (if free)"}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        30-day money-back guarantee
                      </p>
                    </div>
                  )}

                  {/* Includes */}
                  <div className="mt-5">
                    <p className="font-semibold mb-2">This course includes</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />{" "}
                        {formatDuration(curriculum?.[0]?.total_length)}
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Articles
                      </li>
                      <li className="flex items-center gap-2">
                        <Download className="h-4 w-4" /> Downloadable resources
                      </li>
                      <li className="flex items-center gap-2">
                        <MonitorSmartphone className="h-4 w-4" /> Access on
                        mobile and TV
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="h-4 w-4" /> Certificate of completion
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* GRID CONTENT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          {/* Overview - What you'll learn */}
          <div>
            <SectionHeader title="What you'll learn" id="overview" />
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-6" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(course?.what_you_learn || []).slice(0, 8).map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <p className="text-gray-700 line-clamp-2">{b}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Curriculum */}
          <div>
            <SectionHeader title="Course content" id="content" />
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {curriculum?.reduce((a, s) => a + (s.lecture_count || 0), 0)}{" "}
                  lectures •{" "}
                  {formatDuration(
                    curriculum?.reduce((a, s) => a + (s.total_length || 0), 0)
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandAll(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Expand all
                  </button>
                  <button
                    onClick={() => setExpandAll(false)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Collapse all
                  </button>
                </div>
              </div>
              <div className="divide-y">
                {loadingCurriculum
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4">
                        <Skeleton className="h-5 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))
                  : curriculum.map((sec) => (
                      <AccordionSection
                        key={sec.id}
                        section={sec}
                        expandAll={expandAll}
                      />
                    ))}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <SectionHeader title="Requirements" id="requirements" />
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {loading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <ul className="space-y-2">
                  {(course?.requirements || []).map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Description */}
          <ExpandableText
            title="Description"
            id="description"
            text={course?.description || ""}
          />

          {/* Instructor */}
          <InstructorSection id="instructor" course={course} />

          {/* Reviews */}
          <ReviewsSection
            id="reviews"
            reviews={reviews}
            loading={loadingReviews}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onPageChange={(p) => setReviews((prev) => ({ ...prev, page: p }))}
          />

          {/* FAQ */}
          <FAQSection id="faq" items={course?.faq || []} />
        </div>
      </section>

      {/* Mobile bottom bar */}
      {!isInstructor && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-t p-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-gray-900 whitespace-nowrap truncate">
              {formatCurrency(current)}
            </p>
            {original > current && (
              <p className="text-xs text-gray-600 whitespace-nowrap truncate">
                <span className="line-through mr-1">
                  {formatCurrency(original)}
                </span>
                {off > 0 && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                    -{off}%
                  </span>
                )}
              </p>
            )}
          </div>
          {isEnrolled ? (
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
            >
              Go to course
            </button>
          ) : (
            <button
              onClick={handleBuyNow}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
            >
              Buy now
            </button>
          )}
        </div>
      )}

      {/* Preview modal */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-black w-full max-w-3xl aspect-video rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {course?.preview_video_url ? (
              <video
                src={course.preview_video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={course?.image}
                alt={course?.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AccordionSection = ({ section, expandAll }) => {
  const [open, setOpen] = useState(Boolean(expandAll));
  useEffect(() => setOpen(Boolean(expandAll)), [expandAll]);
  return (
    <div>
      <button
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {section.title}
          </p>
          <p className="text-sm text-gray-600">
            {section.lecture_count} lectures •{" "}
            {formatDuration(section.total_length)}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>
      {open && (
        <ul className="px-4 pb-4 space-y-2">
          {(section.lectures || []).map((lec) => (
            <li
              key={lec.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 min-w-0">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="truncate">{lec.title}</span>
                {lec.is_preview && (
                  <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    Preview
                  </span>
                )}
              </span>
              <span className="text-gray-500 whitespace-nowrap">
                {formatDuration(lec.length)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ExpandableText = ({ title, id, text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <SectionHeader title={title} id={id} />
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p
          className={`${
            open ? "" : "line-clamp-5"
          } text-gray-700 whitespace-pre-line`}
        >
          {text}
        </p>
        <button
          className="mt-3 text-blue-600 hover:underline font-medium"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Show less" : "Show more"}
        </button>
      </div>
    </div>
  );
};

const InstructorSection = ({ id, course }) => {
  const PLACEHOLDER_IMAGE = "https://www.gravatar.com/avatar/?d=mp";
  const [open, setOpen] = useState(false);
  return (
    <div>
      <SectionHeader title="Instructor" id={id} />
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <img
            src={course?.instructor?.avatar || PLACEHOLDER_IMAGE}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMAGE;
              e.currentTarget.onerror = null;
            }}
            alt={course?.instructor?.name || "Instructor"}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {course?.instructor?.name || "Instructor"}
            </p>
            {course?.instructor?.headline && (
              <p className="text-sm text-gray-600">
                {course.instructor.headline}
              </p>
            )}
          </div>
        </div>
        {course?.instructor?.bio && (
          <div className="mt-3">
            <p className={`${open ? "" : "line-clamp-3"} text-gray-700`}>
              {course.instructor.bio}
            </p>
            <button
              className="mt-2 text-blue-600 hover:underline"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewsSection = ({
  id,
  reviews,
  loading,
  sortBy,
  onSortChange,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil((reviews?.count || 0) / 10));
  return (
    <div>
      <SectionHeader title="Reviews" id={id} />
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold">Student feedback</p>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
            aria-label="Sort reviews"
          >
            <option value="relevant">Most relevant</option>
            <option value="recent">Most recent</option>
            <option value="high">Highest rating</option>
            <option value="low">Lowest rating</option>
          </select>
        </div>
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </>
        ) : (
          <div className="space-y-4">
            {(reviews?.results || []).map((r) => (
              <div key={r.id} className="border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={
                      r.user?.avatar || "https://www.gravatar.com/avatar/?d=mp"
                    }
                    alt={r.user?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://www.gravatar.com/avatar/?d=mp";
                      e.currentTarget.onerror = null;
                    }}
                  />
                  <p className="font-medium text-gray-800">
                    {r.user?.name || "User"}
                  </p>
                  <Stars rating={r.rating || 0} size={14} />
                  <span className="text-xs text-gray-500">
                    {r.created_at?.slice(0, 10)}
                  </span>
                </div>
                <p className="text-gray-700">{r.comment}</p>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    className={`px-3 py-1 rounded ${
                      reviews?.page === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;

// Simple FAQ accordion section
const FAQSection = ({ id, items = [] }) => {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <SectionHeader title="FAQ" id={id} />
      <div className="bg-white rounded-2xl shadow-lg divide-y">
        {items.length === 0 ? (
          <div className="p-6 text-gray-600">No FAQs yet.</div>
        ) : (
          items.map((q, i) => (
            <div key={i}>
              <button
                className="w-full text-left p-4 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center justify-between"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="pr-4 truncate">
                  {q.question || `Question ${i + 1}`}
                </span>
                {open === i ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-gray-700">
                  {q.answer || "No answer provided."}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
