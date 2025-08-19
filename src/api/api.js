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

// ========== AUTH ENDPOINTS ==========

// Register
export const register = async (data) => {
  const res = await api.post("auth/register/", data);
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
  const res = await api.get(`courses/instructors/${instructorId}/`);
  return res.data.courses;
};

// Update a course
export const updateCourse = async (id, data) => {
  const res = await api.put(`courses/${id}/update/`, data);
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

export default api;
