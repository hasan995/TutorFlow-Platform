import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourse, withdrawFromCourse, createCourseVideo, createExam, deleteCourse, updateCourse, getCategories } from "../api/api";
import { BookOpen, Star, FileText, Video, Pencil, Trash2, Save, X, Layers, User, Users, Image as ImageIcon, SkipBack, SkipForward, PlayCircle } from "lucide-react";

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
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editedCourse, setEditedCourse] = useState({ title: "", description: "", category: "", price: "", image: null });
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const instructorInitials = useMemo(() => {
    const name = course?.instructor_name || "";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [course?.instructor_name]);

  const currentVideo = useMemo(() => {
    if (!Array.isArray(course?.videos) || course.videos.length === 0) return null;
    const index = Math.min(Math.max(currentVideoIndex, 0), course.videos.length - 1);
    return course.videos[index];
  }, [course, currentVideoIndex]);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    } catch (_) {}
    return null;
  };

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourse(id);
        setCourse(data);
        setPreview(data?.image || null);
      } catch (err) {
        console.error("Failed to load course", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

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

  const beginEdit = () => {
    setEditedCourse({
      title: course?.title || "",
      description: course?.description || "",
      category: categories.find((c) => c.name === course?.category_name)?.id || "",
      price: course?.price || "",
      image: null,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setPreview(course?.image || null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditedCourse((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveUpdate = async () => {
    try {
      setUpdating(true);
      let payload;
      if (editedCourse.image) {
        payload = new FormData();
        payload.append("title", editedCourse.title);
        payload.append("description", editedCourse.description);
        if (editedCourse.category) payload.append("category", editedCourse.category);
        payload.append("price", editedCourse.price);
        payload.append("image", editedCourse.image);
      } else {
        payload = {
          title: editedCourse.title,
          description: editedCourse.description,
          category: editedCourse.category,
          price: editedCourse.price,
        };
      }
      const updated = await updateCourse(course.id, payload);
      setCourse((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update course.");
    } finally {
      setUpdating(false);
    }
  };

  const confirmDeleteCourse = async () => {
    try {
      setDeleting(true);
      await deleteCourse(course.id);
      setShowDeletePopup(false);
      navigate("/myCourses");
    } catch (e) {
      console.error(e);
      alert("Failed to delete course.");
    } finally {
      setDeleting(false);
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
      const payload = {
        title: videoForm.title,
        url: videoForm.url,
        description: videoForm.description,
        order: parseInt(videoForm.order || 0, 10),
      };
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

      {/* Content with fixed height and internal scroll */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 h-[80vh] overflow-y-auto">
        {activeTab === "overview" && (
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
            {isOwnerInstructor && !isEditing && (
              <div className="mb-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={beginEdit}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 shadow"
                  title="Edit course"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeletePopup(true)}
                  disabled={deleting}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-white shadow ${
                    deleting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                  title={deleting ? "Deleting..." : "Delete course"}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="relative">
                <img
                  src={preview || course.image}
                  alt={course.title}
                  className="w-full md:w-80 h-56 object-cover rounded-xl shadow-md ring-2 ring-offset-2 ring-blue-100"
                />
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedCourse.title}
                      onChange={(e) => setEditedCourse((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-xl font-semibold"
                    />
                    <textarea
                      value={editedCourse.description}
                      onChange={(e) => setEditedCourse((prev) => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full border rounded-lg px-3 py-2 text-gray-700"
                    />
                    <input
                      type="text"
                      value={course.instructor_name}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 text-gray-500 bg-gray-50"
                    />
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editedCourse.category}
                        onChange={(e) => setEditedCourse((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Price ($)</label>
                      <input
                        type="number"
                        value={editedCourse.price}
                        onChange={(e) => setEditedCourse((prev) => ({ ...prev, price: e.target.value }))}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter course price"
                      />
                    </div>
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Image</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-32 h-20 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                          {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveUpdate}
                        disabled={updating}
                        title={updating ? "Saving..." : "Save"}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-white ${
                          updating ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        title="Cancel"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-left leading-tight">
                        {course.title}
                      </h1>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow">
                        {instructorInitials}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">Instructor</p>
                        <p className="text-sm font-semibold text-gray-800">{course.instructor_name || "Unknown"}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">About this course</h3>
                      <p className={`mt-2 text-gray-700 leading-relaxed ${showFullDesc ? '' : 'line-clamp-4'}`}>
                        {course.description}
                      </p>
                      {course.description && course.description.length > 220 && (
                        <button
                          type="button"
                          onClick={() => setShowFullDesc((v) => !v)}
                          className="mt-1 text-sm text-blue-600 hover:underline"
                        >
                          {showFullDesc ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                    {course.price !== undefined && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Price</h3>
                        <p className="mt-2 text-2xl font-bold text-green-600">
                          ${Number(course.price).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
                        <Video className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Lectures</p>
                        <p className="text-lg font-semibold">{Array.isArray(course.videos) ? course.videos.length : 0}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 text-purple-600">
                        <User className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Instructor</p>
                        <p className="text-sm font-semibold">{course.instructor_name}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600">
                        <Layers className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-semibold">{course.category_name || "—"}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-600">
                        <Users className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-xs text-gray-500">Enrolled</p>
                        <p className="text-sm font-semibold">{course.enrollments_count ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

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

            {/* moved add video/exam to Lectures */}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="text-gray-500 min-h-[40vh] flex items-center justify-center">
            Reviews section coming soon...
          </div>
        )}
        {activeTab === "notes" && (
          <div className="text-gray-500 min-h-[40vh] flex items-center justify-center">
            Notes section coming soon...
          </div>
        )}
        {activeTab === "lectures" && (
          <div>
            {isOwnerInstructor && (
              <div className="mb-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setAddingVideo((v) => !v)}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
                >
                  {addingVideo ? "Cancel" : "Add Video"}
                </button>
              </div>
            )}

            {isOwnerInstructor && addingVideo && (
              <form onSubmit={handleAddVideo} className="mb-8 grid gap-4 max-w-xl bg-white border rounded-xl p-4 shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video title</label>
                  <input
                    type="text"
                    placeholder="Intro to React"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea
                    placeholder="What will students learn in this video?"
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order (optional)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={videoForm.order}
                      onChange={(e) => setVideoForm({ ...videoForm, order: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      min={0}
                    />
                  </div>
                </div>
                <div>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition">
                    Save Video
                  </button>
                </div>
              </form>
            )}

            {Array.isArray(course.videos) && course.videos.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Player */}
                <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-4">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/5">
                    {currentVideo?.file ? (
                      <video key={currentVideo.file} controls className="w-full h-full" src={currentVideo.file} />
                    ) : currentVideo?.url && getEmbedUrl(currentVideo.url) ? (
                      <iframe
                        key={currentVideo.url}
                        src={getEmbedUrl(currentVideo.url)}
                        title={currentVideo.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : currentVideo?.url ? (
                      <video key={currentVideo.url} controls className="w-full h-full" src={currentVideo.url} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No video source</div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => setCurrentVideoIndex((i) => Math.max(i - 1, 0))}
                      disabled={currentVideoIndex === 0}
                    >
                      <SkipBack className="w-4 h-4" /> Previous
                    </button>
                    <div className="text-sm text-gray-600">
                      {currentVideoIndex + 1} / {course.videos.length}
                    </div>
                    <button
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => setCurrentVideoIndex((i) => Math.min(i + 1, course.videos.length - 1))}
                      disabled={currentVideoIndex >= course.videos.length - 1}
                    >
                      Next <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Video details */}
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {currentVideo?.title || "Untitled video"}
                    </h3>
                    {currentVideo?.description && (
                      <p className="mt-1 text-gray-600">{currentVideo.description}</p>
                    )}
                    <div className="mt-2 text-sm text-gray-500 flex gap-4 flex-wrap">
                      {typeof currentVideo?.order !== "undefined" && (
                        <span>Order: #{currentVideo.order}</span>
                      )}
                      
                    </div>
                  </div>
                </div>

                {/* Playlist */}
                <aside className="bg-white rounded-xl border shadow-sm p-3 max-h-[60vh] overflow-y-auto">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Playlist</div>
                  <div className="space-y-2">
                    {course.videos.map((v, idx) => {
                      const isActive = idx === currentVideoIndex;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setCurrentVideoIndex(idx)}
                          className={`w-full text-left p-2 rounded-lg border flex items-center gap-3 ${isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                        >
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            <PlayCircle className="w-4 h-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{v.title}</p>
                            {typeof v.order !== 'undefined' && (
                              <p className="text-xs text-gray-500">#{v.order}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </aside>
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
      {/* Delete Confirmation Modal */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
            <h3 className="text-lg font-semibold text-gray-800">Delete Course</h3>
            <p className="text-gray-600 mt-2">Are you sure you want to delete <span className="font-semibold">{course.title}</span>? This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCourse}
                disabled={deleting}
                className={`px-4 py-2 rounded-md text-white shadow ${deleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
