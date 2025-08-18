import React, { useState } from "react";
import { Lock, Mail } from "lucide-react";
import Navbar from "../components/Navbar";

import { login } from "../api/api"; // ✅ use your api.js

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // login expects data object
      const data = await login({ email, password });

      // Save tokens + user info
      localStorage.setItem("accessToken", data.tokens.access);
      // localStorage.setItem("refreshToken", data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      const token = localStorage.getItem("accessToken");
      // const decoded = JSON.parse(atob(token.split(".")[1]));
      console.log("decoded stuff: ", data);

      // set axios Authorization header for future requests
      // setAuthToken(data.tokens.access);

      // Redirect to homepage
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Welcome Back
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
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
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-purple-500">
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

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
