import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, withdrawFromCourse, createCourseVideo, createExam } from "../api/api";
import { BookOpen, Star, FileText, Video } from "lucide-react";

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPopup, setShowPopup] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: "", url: "", description: "", order: 0 });

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

  const isOwnerInstructor = user?.role === "instructor" && course?.instructor === user?.id;

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

  const handleCreateExam = async () => {
    const defaultName = course?.title ? `${course.title} Exam` : "Course Exam";
    const name = prompt("Enter exam name:", defaultName);
    if (!name) return;
    try {
      await createExam({ name, course: parseInt(id, 10) });
      alert("Exam created successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to create exam.");
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      let payload;
      const fileInput = e.target.querySelector('input[type="file"]');
      const file = fileInput?.files?.[0];
      if (file) {
        payload = new FormData();
        payload.append('title', videoForm.title);
        if (videoForm.url) payload.append('url', videoForm.url);
        if (videoForm.description) payload.append('description', videoForm.description);
        payload.append('order', String(parseInt(videoForm.order || 0, 10)));
        payload.append('file', file);
      } else {
        payload = {
          title: videoForm.title,
          url: videoForm.url,
          description: videoForm.description,
          order: parseInt(videoForm.order || 0, 10),
        };
      }
      const created = await createCourseVideo(id, payload);
      setCourse((prev) => ({ ...prev, videos: [...(prev.videos || []), created] }));
      setAddingVideo(false);
      setVideoForm({ title: "", url: "", description: "", order: 0 });
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : "Failed to add video.";
      alert(msg);
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
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={course.image}
                alt={course.title}
                className="w-full md:w-72 h-48 object-cover rounded-xl shadow-md"
              />
              <div>
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

                {user?.role === "student" && (
                  <button
                    onClick={() => setShowPopup(true)}
                    className="mt-6 px-6 py-2 rounded-lg bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 transition"
                  >
                    Withdraw from Course
                  </button>
                )}

                {isOwnerInstructor && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => setAddingVideo((v) => !v)}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
                    >
                      {addingVideo ? "Cancel" : "Add Video"}
                    </button>
                    <button
                      onClick={handleCreateExam}
                      className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition"
                    >
                      Create Exam
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isOwnerInstructor && addingVideo && (
              <form onSubmit={handleAddVideo} className="mt-8 grid gap-4 max-w-xl">
                <input
                  type="text"
                  placeholder="Video title"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="url"
                  placeholder="Video URL (e.g. https://...)"
                  value={videoForm.url}
                  onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                />
                <input type="file" accept="video/*" className="border rounded-lg px-3 py-2" />
                <textarea
                  placeholder="Description (optional)"
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  rows={3}
                />
                <input
                  type="number"
                  placeholder="Order (optional)"
                  value={videoForm.order}
                  onChange={(e) => setVideoForm({ ...videoForm, order: e.target.value })}
                  className="border rounded-lg px-3 py-2"
                  min={0}
                />
                <div>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition">
                    Save Video
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="text-gray-500">Reviews section coming soon...</div>
        )}
        {activeTab === "notes" && (
          <div className="text-gray-500">Notes section coming soon...</div>
        )}
        {activeTab === "lectures" && (
          <div>
            {Array.isArray(course.videos) && course.videos.length > 0 ? (
              <div className="space-y-3">
                {course.videos.map((v) => (
                  <div key={v.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{v.title}</p>
                      {v.file ? (
                        <video
                          controls
                          className="w-full max-w-md mt-2 rounded"
                          src={v.file}
                        />
                      ) : (
                        v.url && (
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 text-sm break-all"
                          >
                            {v.url}
                          </a>
                        )
                      )}
                      {v.description && (
                        <p className="text-sm text-gray-600 mt-1">{v.description}</p>
                      )}
                    </div>
                    {typeof v.order !== "undefined" && (
                      <span className="text-xs text-gray-500">#{v.order}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No videos yet.</p>
            )}
          </div>
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
              <span className="font-semibold">{course.title}</span>?
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
