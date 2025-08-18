import React from "react";
import { Clock, Users, Star, TrendingUp } from "lucide-react";

const recommendedCourses = [
  {
    title: "React & TypeScript Complete Guide",
    instructor: "Alex Thompson",
    image:
      "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600",
    rating: 4.9,
    students: 18500,
    duration: "14 weeks",
    category: "Most Popular",
    trending: true,
  },
  {
    title: "Advanced Python Programming",
    instructor: "Maria Santos",
    image:
      "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600",
    rating: 4.8,
    students: 14200,
    duration: "10 weeks",
    category: "Trending",
    trending: true,
  },
  {
    title: "Cloud Computing with AWS",
    instructor: "Robert Kim",
    image:
      "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=600",
    rating: 4.9,
    students: 11800,
    duration: "12 weeks",
    category: "High Demand",
    trending: false,
  },
  {
    title: "Cybersecurity Fundamentals",
    instructor: "Jennifer Lee",
    image:
      "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600",
    rating: 4.7,
    students: 9500,
    duration: "8 weeks",
    category: "New",
    trending: false,
  },
];

const RecommendedCourses = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-sm font-medium text-orange-700 mb-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recommended for You
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Courses Tailored to Your Goals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on current industry trends and student success rates, these
            courses are perfect for advancing your career in today's competitive
            market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {recommendedCourses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer border border-gray-100"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-medium text-gray-900">
                      {course.category}
                    </span>
                  </div>
                  {course.trending && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-white">
                        🔥 Trending
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  by {course.instructor}
                </p>

                <div className="flex items-center justify-between mb-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-sm">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            View More Recommendations
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default RecommendedCourses;
