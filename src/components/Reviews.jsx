import React, { useEffect, useState } from "react";
import {
  getCourseReviews,
  createReview,
  editReview,
  deleteReview,
  getCourse,
} from "../api/api"; // adjust path if needed
import { Star, Loader2 } from "lucide-react";

const CourseReviewsSection = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ New pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchReviews(page);
    checkIfInstructor();
  }, [page]); // ✅ refetch when page changes

  const fetchReviews = async (currentPage = 1) => {
    setLoading(true);
    try {
      const data = await getCourseReviews(courseId, {
        page: currentPage,
        limit: 5,
      });
      setReviews(data.results || []); // ✅ backend likely returns results
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
    setLoading(false);
  };

  const checkIfInstructor = async () => {
    try {
      const course = await getCourse(courseId);
      setIsInstructor(course.instructor === user?.id);
    } catch (err) {
      console.error("Error checking instructor:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await editReview(editingId, { content, rating });
      } else {
        await createReview(courseId, { content, rating });
      }
      setContent("");
      setRating(5);
      setEditingId(null);
      fetchReviews(page); // ✅ refresh current page
    } catch (err) {
      console.error("Error submitting review:", err);
    }
    setSubmitting(false);
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setContent(review.content);
    setRating(review.rating);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteReview(id);
      fetchReviews(page);
    } catch (err) {
      console.error("Error deleting review:", err);
    }
    setDeletingId(null);
  };

  const userReview = reviews.find((r) => r.rater === user?.id);

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 mt-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Course Reviews
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      ) : (
        <>
          {/* Reviews list */}
          <div className="space-y-5 mb-8">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-100 rounded-xl bg-gray-50 p-5 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col items-start">
                      <p className="font-semibold text-gray-900">
                        {review.rater_first_name} {review.rater_last_name}
                      </p>
                      <p className="mt-2 text-gray-700">{review.content}</p>
                    </div>
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating
                              ? "fill-yellow-400"
                              : "fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.rater === user?.id && (
                    <div className="flex gap-4 mt-3">
                      <button
                        className="px-4 py-1 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium shadow hover:shadow-md transition disabled:opacity-50"
                        onClick={() => handleEdit(review)}
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-1 rounded-md bg-red-500 text-white text-sm font-medium shadow hover:bg-red-600 transition disabled:opacity-50"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                      >
                        {deletingId === review.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>

          {/* ✅ Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Form */}
          {!isInstructor && (!userReview || editingId) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={content}
                maxLength={100}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts about this course..."
                required
              />
              <div className="flex gap-2 items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 cursor-pointer ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => setRating(i + 1)}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating} / 5</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting
                  ? editingId
                    ? "Updating..."
                    : "Posting..."
                  : editingId
                  ? "Update Review"
                  : "Post Review"}
              </button>
            </form>
          )}

          {isInstructor && (
            <p className="text-gray-500 italic">
              You are the instructor of this course and cannot post reviews.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CourseReviewsSection;
