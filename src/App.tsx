import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CoursesPage from "./pages/CoursesPage";
import Profile from "./pages/ProfilePage";
import CourseDetail from "./pages/CourseDetail";
import CreateCourse from "./pages/CreateCourse";
import MyCourses from "./pages/MyCourses";
import Sessions from "./pages/LiveSessions";
import SessionDetail from "./pages/SessionDetail";
import CreateSession from "./pages/createSession";
import EnrolledCourseDetais from "./pages/EnrolledCoursePage";
import "./App.css"; // Assuming you have a global CSS file for styles

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/courses/create" element={<CreateCourse />} />
          <Route path="/mycourses" element={<MyCourses />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/sessions/create" element={<CreateSession />} />
          <Route path="/courses/:id" element={<EnrolledCourseDetais />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
