import React from "react";
import { ArrowRight, Play, Star, Users, BookOpen, Award } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-700">
                <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                Trusted by 50,000+ Students
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                Learn Skills That
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Transform{" "}
                </span>
                Your Career
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="text-xl text-gray-600 leading-relaxed max-w-lg"
              >
                Master in-demand skills with expert-led courses. Join thousands
                of learners advancing their careers through our comprehensive
                online education platform.
              </motion.p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(79,70,229,.25)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                onClick={() => (window.location.href = "/courses")}
              >
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>

              {/* <button className="flex items-center justify-center px-8 py-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button> */}
            </div>

            {/* Stats */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12 },
                },
              }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200"
            >
              {[{
                icon: <Users className="h-6 w-6 text-blue-600 mr-2" />, label: "Active Students", value: "50K+",
              }, {
                icon: <BookOpen className="h-6 w-6 text-purple-600 mr-2" />, label: "Expert Courses", value: "200+",
              }, {
                icon: <Award className="h-6 w-6 text-green-600 mr-2" />, label: "Success Rate", value: "95%",
              }].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: idx * 0.05 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    {stat.icon}
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="relative z-10"
            >
              <img
                src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students learning online"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, y: -8, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  Live Classes
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
              className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  4.9/5 Rating
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
