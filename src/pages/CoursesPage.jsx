import React, { useEffect, useState } from "react";
import { getCourses, getCategories, enrollInCourse } from "../api/api";
import { Search, BookOpen } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const categoryIdFromParams = searchParams.get("id");
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    categoryIdFromParams ? [parseInt(categoryIdFromParams)] : []
  );
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [instructor, setInstructor] = useState("");
  const [topSellers, setTopSellers] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 6 };
        if (search) params.search = search;
        if (selectedCategories.length > 0) {
          params.category = selectedCategories;
        }
        if (priceMin !== "") params.price_min = priceMin;
        if (priceMax !== "") params.price_max = priceMax;
        if (instructor.trim() !== "") params.instructor = instructor.trim();
        if (topSellers) params.top_sellers = 1;

        const data = await getCourses(params);
        setCourses(data.results);
        setPages(data.pages);
        console.log("Courses data: ", data.results);

        // 👇 small delay before removing skeleton (300–500ms feels natural)

        setLoading(false);
      } catch (err) {
        console.error("Failed to load courses", err);
        setLoading(false);
      }
    };
    fetchCourses();
  }, [search, selectedCategories, priceMin, priceMax, instructor, topSellers, page]);

  const toggleCategory = (id) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleEnroll = async (id) => {
    if (!isLoggedIn) {
      alert("Please log in to enroll.");
      navigate("/login");
      return;
    }
    try {
      await enrollInCourse(id);
      navigate(`/courses/${id}`);
    } catch (err) {
      console.error("Failed to enroll", err);
      alert("Failed to enroll.");
    }
  };

  return (
    <div className="flex max-w-7xl mx-auto px-4 py-12 gap-8 mt-11">
      {/* Sidebar Filters */}
      <aside className="w-64 bg-white p-6 rounded-2xl shadow-lg h-fit">
        <h3 className="font-bold text-lg mb-4 text-left text-indigo-700">Filters</h3>
        <div className="space-y-5">
          <div>
            <h4 className="font-semibold text-sm text-indigo-600 mb-2 text-left">Category</h4>
            <div className="space-y-3 max-h-64 overflow-auto pr-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => {
                      toggleCategory(cat.id);
                    }}
                    className="rounded"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-indigo-600 mb-2 text-left">Price range</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  setPage(1);
                }}
                className="w-1/2 px-3 py-2 border rounded-lg"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  setPage(1);
                }}
                className="w-1/2 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-indigo-600 mb-2 text-left">Top_Sellers</h4>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={topSellers}
                onChange={(e) => {
                  setTopSellers(e.target.checked);
                  setPage(1);
                }}
                className="rounded"
              />
              <span>Most Enrolled</span>
            </label>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-indigo-600 mb-2 text-left">Instructor</h4>
            <input
              type="text"
              placeholder="Instructor Name"
              value={instructor}
              onChange={(e) => {
                setInstructor(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Search */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Courses */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-gray-300 h-40 w-full"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-10 bg-gray-300 rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">No courses found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-indigo-50">
                    <BookOpen className="h-12 w-12 text-indigo-700" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    By {course.instructor_name || "Unknown Instructor"}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    {course.category_name} {course.price !== undefined && (
                      <span className="ml-2 font-semibold text-gray-700">${Number(course.price).toFixed(2)}</span>
                    )}
                  </p>
                  {course.is_enrolled ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2
      bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-inner
      cursor-default opacity-90"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Already Enrolled
                    </button>
                  ) : course.instructor === user?.id ? (
                    <button
                      onClick={() => navigate("/courses/" + course.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold 
      shadow-md hover:shadow-lg transition-all duration-300 
      hover:scale-[1.03] active:scale-[0.97]"
                    >
                      View Course
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold 
      shadow-md hover:shadow-lg transition-all duration-300 
      hover:scale-[1.03] active:scale-[0.97]"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursesPage;
