import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  BookOpen,
  LogOut,
  Check,
  XCircle,
  User,
  GraduationCap,
  Home,
  Info,
  Phone,
  Library,
  Video,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const isLoggedIn = !!localStorage.getItem("accessToken");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const username = user?.username || null;
  const role = user?.role || null;

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
    {
      name: "Courses",
      href: "/courses",
      icon: <Library className="h-4 w-4" />,
    },
    {
      name: "Sessions",
      href: "/sessions",
      icon: <Video className="h-4 w-4" />,
    },
    {
      name: "Instructors",
      href: "#",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    { name: "About", href: "/about", icon: <Info className="h-4 w-4" /> },
    { name: "Contact", href: "/contact", icon: <Phone className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TutorFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span className="hidden sm:block">{username}</span>
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                          {role === "instructor" ? "Instructor" : "Student"}
                        </div>
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Profile
                        </a>
                        <a
                          href="/mycourses"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          My Courses
                        </a>
                        <button
                          onClick={() => setShowLogoutConfirm(true)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <a
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </a>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
