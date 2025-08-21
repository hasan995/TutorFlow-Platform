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
      <header
        className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-gray-200"
            : "bg-white/70 backdrop-blur-sm border-transparent"
        }`}
      >
        <div>
          <div className="flex items-center justify-around h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg shadow-md transition-transform duration-300 group-hover:scale-110">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TutorFlow
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 px-2 py-2 text-gray-700 rounded-md relative group hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  {link.icon}
                  {link.name}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
              {isLoggedIn && (
                <a
                  href="/mycourses"
                  className="flex items-center gap-2 px-2 py-2 text-gray-700 rounded-md relative group hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4" /> My Courses
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              )}
              
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {isLoggedIn ? (
                <>
                  {/* Username Pill */}
                  <div
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {username}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-slideDown">
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                >
                  {link.icon}
                  {link.name}
                </a>
              ))}
              {isLoggedIn && (
                <>
                  {/* Mobile Username */}
                  <div
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  >
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-800">
                      {username}
                    </span>
                  </div>
                </>
              )}
              
              <div className="pt-3 border-t border-gray-200">
                {isLoggedIn ? (
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 text-red-600 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center animate-fadeIn">
            <LogOut className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                <Check className="h-4 w-4" /> Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                <XCircle className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
