// src/pages/CreateCourse.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories, createCourse, getCourse, updateCourse } from "../api/api";
import {
  BookOpen,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

const CreateCourse = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [courseCategoryName, setCourseCategoryName] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  // Load existing course when in edit mode (query param ?edit=<id>)
  useEffect(() => {
    const id = searchParams.get("edit");
    if (!id) return;
    (async () => {
      try {
        setIsEdit(true);
        setEditId(id);
        const data = await getCourse(id);
        setForm((prev) => ({
          ...prev,
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          // category will be set once categories are loaded
        }));
        setPreview(data.image || null);
        setCourseCategoryName(data.category_name || "");
      } catch (err) {
        console.error("Failed to load course for editing", err);
      }
    })();
  }, [searchParams]);

  // Once categories are loaded, map category_name to its id for the select
  useEffect(() => {
    if (!isEdit || !courseCategoryName || categories.length === 0) return;
    const matched = categories.find((c) => c.name === courseCategoryName);
    if (matched) {
      setForm((prev) => ({ ...prev, category: matched.id }));
    }
  }, [isEdit, courseCategoryName, categories]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit && editId) {
        const payload = {
          title: form.title,
          description: form.description,
          category: form.category,
          price: form.price,
        };
        await updateCourse(editId, payload);
        setSuccess(true);
      } else {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("category", form.category);
        formData.append("price", form.price);
        if (form.image) {
          formData.append("image", form.image);
        }
        await createCourse(formData);
        setSuccess(true);
        setForm({ title: "", description: "", category: "", price: "", image: null });
        setPreview(null);
      }
    } catch (err) {
      console.error("Error creating course:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 mt-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-md">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Update Course" : "Create a New Course"}
          </h1>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle className="h-5 w-5" />
            Course created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter course title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Write a short description..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            {loading ? (
              <p className="text-gray-500">Loading categories...</p>
            ) : (
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              >
                <option value=""> Select a category </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="Enter course price (e.g., 29.99)"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Thumbnail
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition cursor-pointer">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <p className="text-sm">Click below to upload an image</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-4 text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Course" : "Create Course"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
