import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, withdrawFromCourse } from "../api/api";
import { BookOpen, Star, FileText, Video } from "lucide-react";

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPopup, setShowPopup] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourse(id);
        setCourse(data);
      } catch (err) {
        console.error("Failed to load course", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const confirmWithdraw = async () => {
    try {
      setWithdrawing(true);
      await withdrawFromCourse(id);
      setShowPopup(false);
      navigate("/myCourses");
    } catch (err) {
      console.error("Failed to withdraw", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-red-500">Failed to load course.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 mt-16 flex gap-8">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md p-4 sticky top-20">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Course Menu</h3>
          <nav className="flex flex-col gap-2">
            {[
              { key: "overview", label: "Overview", icon: BookOpen },
              { key: "reviews", label: "Reviews", icon: Star },
              { key: "notes", label: "Notes", icon: FileText },
              { key: "lectures", label: "Lectures", icon: Video },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl p-8">
        {activeTab === "overview" && (
          <div>
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={course.image}
                alt={course.title}
                className="w-full md:w-72 h-48 object-cover rounded-xl shadow-md"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {course.title}
                </h2>
                <p className="text-gray-600 mt-2">
                  Instructor:{" "}
                  <span className="font-semibold">
                    {course.instructor_name}
                  </span>
                </p>
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {course.description}
                </p>

                {course.is_enrolled && (
                  <button
                    onClick={() => setShowPopup(true)}
                    className="mt-6 px-6 py-2 rounded-lg bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 transition"
                  >
                    Withdraw from Course
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="text-gray-500">Reviews section coming soon...</div>
        )}
        {activeTab === "notes" && (
          <div className="text-gray-500">Notes section coming soon...</div>
        )}
        {activeTab === "lectures" && (
          <div className="text-gray-500">Lectures section coming soon...</div>
        )}
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Confirm Withdrawal
            </h3>
            <p className="text-gray-600 mt-3">
              Are you sure you want to withdraw from{" "}
              <span className="font-semibold">{course.name}</span>?
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmWithdraw}
                disabled={withdrawing}
                className={`px-6 py-2 rounded-lg text-white font-semibold shadow-md transition ${
                  withdrawing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {withdrawing ? "Withdrawing..." : "Yes, Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
