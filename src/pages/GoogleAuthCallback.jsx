import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { googleAuthCallback } from "../api/api";
import RoleSelectionModal from "../components/RoleSelectionModal";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [authCode, setAuthCode] = useState("");
  const [googleUserInfo, setGoogleUserInfo] = useState(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setError("Authentication failed. Please try again.");
      setLoading(false);
      return;
    }

    if (!code) {
      setError("No authorization code received.");
      setLoading(false);
      return;
    }

    setAuthCode(code);
    
    // Extract user info from URL parameters (Google sends some basic info)
    const email = searchParams.get("email") || "";
    const name = searchParams.get("name") || "";
    
    setGoogleUserInfo({ email, name });
    setShowRoleModal(true);
    setLoading(false);
  }, [searchParams]);

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);
      setError("");

      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await googleAuthCallback(authCode, redirectUri, role);

      // Save tokens and user info
      localStorage.setItem("accessToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Close modal and redirect
      setShowRoleModal(false);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Please try again.");
      setShowRoleModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowRoleModal(false);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <RoleSelectionModal
        isOpen={showRoleModal}
        onRoleSelect={handleRoleSelect}
        onClose={handleCloseModal}
        userEmail={googleUserInfo?.email || ""}
        userName={googleUserInfo?.name || ""}
      />
    </>
  );
};

export default GoogleAuthCallback;
