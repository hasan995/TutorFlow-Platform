import React from 'react';
import { Clock, Users, Star } from 'lucide-react';

const courses = [
  {
    title: 'Complete Web Development Bootcamp',
    instructor: 'Sarah Chen',
    image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    students: 12500,
    duration: '12 weeks',
    category: 'Web Development'
  },
  {
    title: 'UI/UX Design Masterclass',
    instructor: 'David Rodriguez',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    students: 9800,
    duration: '8 weeks',
    category: 'Design'
  },
  {
    title: 'Digital Marketing Strategy',
    instructor: 'Emily Thompson',
    image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    students: 15200,
    duration: '6 weeks',
    category: 'Marketing'
  },
  {
    title: 'Data Science & Machine Learning',
    instructor: 'Michael Park',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    students: 8600,
    duration: '16 weeks',
    category: 'Data Science'
  },
  {
    title: 'Mobile App Development',
    instructor: 'Lisa Wang',
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    students: 7200,
    duration: '10 weeks',
    category: 'Mobile Development'
  },
  {
    title: 'Photography Fundamentals',
    instructor: 'James Miller',
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    students: 11400,
    duration: '4 weeks',
    category: 'Photography'
  }
];

const ExploreCourses = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover a wide range of courses designed to help you master new skills 
            and advance your career with hands-on projects and expert guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-gray-900">{course.category}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">by {course.instructor}</p>
                
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            View All Courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExploreCourses;