import React, { useEffect, useState } from "react";
import { getProfile } from "../api/api";
import { User, Mail, BadgeCheck } from "lucide-react"; // ✅ all exist

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        console.log("Profile data: ", data);

        setProfile(data);
      } catch (err) {
        console.log("Failed to load profile", err);
        console.log(localStorage.getItem("accessToken"));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-red-500">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 mt-16">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="h-16 w-16 text-white" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {profile.username}
          </h2>
          <p className="text-gray-500">{profile.email}</p>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <BadgeCheck className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700 font-semibold">First Name</span>
            </div>
            <p className="text-gray-800">{profile.first_name || "—"}</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <BadgeCheck className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700 font-semibold">Last Name</span>
            </div>
            <p className="text-gray-800">{profile.last_name || "—"}</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 font-semibold">Email</span>
            </div>
            <p className="text-gray-800">{profile.email}</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-5 w-5 text-orange-600" />
              <span className="text-gray-700 font-semibold">Username</span>
            </div>
            <p className="text-gray-800">{profile.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
