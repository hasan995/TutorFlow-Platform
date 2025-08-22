import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, Star, BookOpen } from "lucide-react";
import { getCourses, enrollInCourse } from "../api/api"; // Adjust the import based on your API utility

const ExploreCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const isLoggedIn = !!localStorage.getItem("accessToken");
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses("?limit=6");
        if (!response.ok) {
          console.log(response);
        }
        setCourses(response.results);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses(); // <-- Call the function here, not inside itself
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover a wide range of courses designed to help you master new
            skills and advance your career with hands-on projects and expert
            guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                    <BookOpen className="h-16 w-16 text-indigo-700" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-gray-900">
                    {course.category_name}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  by {course.instructor_name}
                </p>

                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={async () => {
                    if (!isLoggedIn) {
                      navigate("/login");
                      return;
                    }
                    try {
                      await enrollInCourse(course.id);
                      navigate(`/courses/${course.id}`);
                    } catch (e) {
                      console.error(e);
                      alert("Failed to enroll.");
                    }
                  }}
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate("/courses")}
          >
            View All Courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExploreCourses;
