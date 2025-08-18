import React, { useState } from "react";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { register } from "../api/api"; // ⬅️ from your api.js
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [role, setRole] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ⬅️ Added loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true); // ⬅️ Start loading
      setError("");
      const data = await register({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
        confirm_password: confirmPassword,
        role,
      });
      console.log("Register success:", data);
      navigate("/login");
    } catch (err) {
      console.log("Register failed:", err.response?.data);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false); // ⬅️ End loading
    }
  };

  return (
    <>
      <Navbar />
      {/* Loading Overlay */}
      {/* {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
            <p className="text-white font-medium">Creating your account...</p>
          </div>
        </div>
      )} */}

      <section
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"
        style={{ paddingTop: "120px", paddingBottom: "100px" }}
      >
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Create Account
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* First Name & Last Name */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full outline-none text-gray-700"
                    required
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full outline-none text-gray-700"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full outline-none text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex-1 py-2 rounded-lg border font-medium transition-colors
                    ${
                      role === "student"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-400"
                    }
                  `}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("instructor")}
                  className={`flex-1 py-2 rounded-lg border font-medium transition-colors
                    ${
                      role === "instructor"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-purple-600 shadow"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:border-purple-400"
                    }
                  `}
                >
                  Instructor
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full outline-none text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full outline-none text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full outline-none text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Error message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default RegisterPage;
