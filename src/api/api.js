// src/api.js
import axios from "axios";

// Base instance
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
});

// 🔑 Interceptor to always attach accessToken if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔁 Global response interceptor to handle expired/invalid sessions
let isHandlingUnauthorized = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;
      try {
        // Avoid triggering on the login or auth callback routes
        const currentPath = window?.location?.pathname || "";
        const isAuthRoute = ["/login", "/auth/callback", "/register"].includes(
          currentPath
        );

        // Clear any stored credentials
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        if (!isAuthRoute) {
          // Notify the user and redirect to login
          window.alert("Your session has expired. Please log in again.");
          window.location.href = "/login";
        }
      } finally {
        // Reset the flag after a short delay to prevent rapid duplicate alerts
        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

// ========== AUTH ENDPOINTS ==========

// Register
export const register = async (data) => {
  const res = await api.post("auth/register/", data);
  return res.data;
};

// ========== GOOGLE OAUTH2 ENDPOINTS ==========

// Get Google OAuth2 authorization URL
export const getGoogleAuthUrl = async (redirectUri) => {
  const res = await api.get("oauth2/google/auth-url/", {
    params: { redirect_uri: redirectUri },
  });
  return res.data;
};

// Handle Google OAuth2 callback
export const googleAuthCallback = async (code, redirectUri, role) => {
  const res = await api.post("oauth2/google/callback/", {
    code,
    redirect_uri: redirectUri,
    role,
  });
  return res.data;
};

// Login
export const login = async (data) => {
  const res = await api.post("auth/login/", data);
  return res.data;
};

// Logout
export const logout = async (refreshToken) => {
  const res = await api.post("auth/logout/", { refresh_token: refreshToken });
  return res.data;
};

// Get Profile
export const getProfile = async () => {
  const res = await api.get("auth/profile/");
  return res.data;
};

// Update Profile
export const updateProfile = async (data) => {
  const res = await api.put("auth/profile/update/", data, {
    headers: {
      "Content-Type": "multipart/form-data", // ✅ file uploads
    },
  });
  return res.data;
};

// ========== COURSES ENDPOINTS ==========

// List courses
export const getCourses = async (params = {}) => {
  const res = await api.get("courses/", { params });
  return res.data;
};

// List categories
export const getCategories = async () => {
  const res = await api.get("courses/categories/");
  return res.data;
};

// Create course
export const createCourse = async (data) => {
  const res = await api.post("courses/create/", data, {
    headers: {
      "Content-Type": "multipart/form-data", // ✅ file uploads
    },
  });
  return res.data;
};

// Single course detail
export const getCourse = async (id) => {
  const res = await api.get(`courses/${id}/`);
  return res.data;
};

// ========== PAYMENT ENDPOINTS ==========

// Initiate payment for a course
export const initiatePayment = async (courseId) => {
  const res = await api.post(`courses/${courseId}/payment/initiate/`);
  return res.data;
};

// Complete payment
export const completePayment = async (paymentId) => {
  const res = await api.post(`courses/payment/${paymentId}/complete/`);
  return res.data;
};

// Get payment status
export const getPaymentStatus = async (paymentId) => {
  const res = await api.get(`courses/payment/${paymentId}/status/`);
  return res.data;
};

// ========== ENROLLMENTS ENDPOINTS ==========

// Enroll in a course
export const enrollInCourse = async (courseId) => {
  const res = await api.post(`courses/${courseId}/enroll/`);
  return res.data;
};

// Withdraw from a course
export const withdrawFromCourse = async (courseId) => {
  const res = await api.post(`courses/${courseId}/withdraw/`);
  return res.data;
};

// Get all enrollments for a student
export const getStudentEnrollments = async (studentId) => {
  const res = await api.get(`courses/student/${studentId}/enrollments/`);
  return res.data;
};

// Instructor: list created courses
export const getInstructorCourses = async (instructorId) => {
  const res = await api.get(`courses/instructor/${instructorId}/courses/`);
  return res.data.courses;
};

// Update a course
export const updateCourse = async (id, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.put(`courses/${id}/update/`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
};

// Delete a course
export const deleteCourse = async (id) => {
  const res = await api.delete(`courses/${id}/delete/`);
  return res.data;
};

// ========== VIDEOS ENDPOINTS ==========
export const getCourseVideos = async (courseId) => {
  const res = await api.get(`courses/${courseId}/videos/`);
  return res.data;
};

export const createCourseVideo = async (courseId, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.post(`courses/${courseId}/videos/create/`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
};

export const updateVideo = async (videoId, data) => {
  const isFormData = data instanceof FormData;
  const res = await api.put(`courses/videos/${videoId}/`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
};

export const deleteVideo = async (videoId) => {
  const res = await api.delete(`courses/videos/${videoId}/`);
  return res.data;
};

// ========== EXAMS ENDPOINTS ==========
export const createExam = async (payload) => {
  const res = await api.post(`exams/exams/`, payload);
  return res.data;
};

// ========== SESSIONS ENDPOINTS ==========
export const getSessions = async () => {
  const res = await api.get("live/sessions/");
  return res.data;
};

export const createSession = async (data) => {
  const res = await api.post("live/sessions/create/", data);
  return res.data;
};

export const getSession = async (id) => {
  const res = await api.get(`live/sessions/${id}/`);
  return res.data;
};

export const getJitsiToken = async (roomName) => {
  const res = await api.post("live/jaas-token/", { room_name: roomName });
  return res.data;
};

// ========== REVIEWS ENDPOINTS ==========
export const getCourseReviews = async (courseId, params = {}) => {
  const res = await api.get(`courses/${courseId}/reviews/list/`, { params });
  return res.data;
};

export const createReview = async (courseId, data) => {
  const res = await api.post(`courses/${courseId}/reviews/`, data);
  return res.data;
};

export const editReview = async (reviewId, data) => {
  const res = await api.put(`courses/reviews/${reviewId}/`, data);
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await api.delete(`courses/reviews/${reviewId}/delete/`);
  return res.data;
};

// ========== NOTES ENDPOINTS ==========
export const getCourseNotes = async (courseId, params = {}) => {
  console.log("params", params);
  const res = await api.get(`courses/${courseId}/notes/list/`, { params });
  console.log(res.data);
  return res.data;
};

export const createNote = async (courseId, data) => {
  const res = await api.post(`courses/${courseId}/notes/`, data);
  return res.data;
};

export const editNote = async (noteId, data) => {
  const res = await api.put(`courses/notes/${noteId}/`, data);
  return res.data;
};

export const deleteNote = async (noteId) => {
  const res = await api.delete(`courses/notes/${noteId}/delete/`);
  return res.data;
};

export default api;
