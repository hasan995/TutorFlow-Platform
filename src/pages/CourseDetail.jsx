// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourse,
  getCourses,
  enrollInCourse,
  withdrawFromCourse,
  getStudentEnrollments,
} from "../api/api";
import { BookOpen, GraduationCap, Loader2, ArrowRight } from "lucide-react";
import CourseUpdateButton from "../components/CourseUpdateButton";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")); // ✅ contains id + role

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // fetch course
        const data = await getCourse(id);
        setCourse(data);

        // fetch related courses
        if (data?.category?.id) {
          const related = await getCourses({ category: data.category.id });
          setRelatedCourses(
            related.results.filter((c) => c.id !== parseInt(id))
          );
        }

        // check if user is already enrolled
        if (user?.id) {
          const enrollments = await getStudentEnrollments(user.id);
          const enrolled = enrollments.some(
            (en) => en.course?.id === parseInt(id)
          );
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to load course", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      console.log("User not logged in, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(id);
      setIsEnrolled(true);
      // You can add a success toast notification here
      console.log("Successfully enrolled in course");
    } catch (error) {
      console.error("❌ Something went wrong, please try again.", error);
      // You can add an error toast notification here
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <p className="text-center text-gray-600">Course not found.</p>;
  }

  const isInstructor =
    user?.role === "instructor" && course.instructor?.id === user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 mt-16">
      {/* Course Hero */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-100">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 flex items-center justify-center bg-indigo-50">
            <BookOpen className="h-20 w-20 text-indigo-700" />
          </div>
        )}
        <div className="p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {course.title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-8">
            <span className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <BookOpen className="h-4 w-4" />{" "}
              {course.category_name || "Uncategorized"}
            </span>

            <button
              onClick={() =>
                navigate(`/instructor/${course.instructor?.id || ""}`)
              }
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition"
            >
              <GraduationCap className="h-4 w-4" />
              {course.instructor?.name || "View Instructor"}
            </button>

            {course.price !== undefined && (
              <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-lg font-bold">
                ${Number(course.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Enroll/Withdraw button */}
            <button
              onClick={handleEnroll}
              // disabled={enrolling}
              className={`px-8 py-3 rounded-xl font-semibold text-white shadow-md transition-all duration-300 transform ${
                enrolling
                  ? "bg-gray-400 cursor-not-allowed"
                  : isEnrolled
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {enrolling ? "Processing..." : "Enroll Now"}
            </button>

            {/* Notification Button for Instructors */}
            <CourseUpdateButton
              courseId={parseInt(id)}
              courseTitle={course.title}
              isInstructor={isInstructor}
            />
          </div>
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Related Courses
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCourses.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/courses/${rel.id}`)}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
              >
                {rel.image_url ? (
                  <img
                    src={rel.image_url}
                    alt={rel.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center bg-indigo-50">
                    <BookOpen className="h-12 w-12 text-indigo-700" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {rel.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {rel.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-blue-600 font-medium mb-3">
                    <span>{rel.category?.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  {rel.price !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ${Number(rel.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
