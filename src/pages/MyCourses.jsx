// src/pages/MyCourses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentEnrollments } from "../api/api";
import { Loader2, ArrowRight } from "lucide-react";

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentEnrollments(user.id);
        setEnrollments(data);
        console.log("Enrollments data: ", data);
      } catch (error) {
        console.error("Failed to load enrollments", error);
        console.log("Enrollments data error: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-gray-600 mt-20">
        Please <span className="text-blue-600">log in</span> to view your
        courses.
      </p>
    );
  }

  if (enrollments.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-20">
        You are not enrolled in any courses yet.
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 mt-16">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        📚 My Courses
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => {
          const course = enrollment;
          return (
            <div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
            >
              <img
                src={course.image || "https://via.placeholder.com/400x200"}
                alt={course.title}
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {course.description}
                </p>
                <div className="flex justify-between items-center text-sm text-blue-600 font-medium">
                  <span>{course.category || "Uncategorized"}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCourses;
