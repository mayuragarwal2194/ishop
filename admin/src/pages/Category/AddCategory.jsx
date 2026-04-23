import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCategory,
  getCategoryBySlug,
  updateCategory,
} from "../../api/category.api";

export default function AddCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  const { slug } = useParams();
  const isEditMode = Boolean(slug);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchCategory = async () => {
      try {
        const response = await getCategoryBySlug(slug);
        const data = response.data.data;

        setForm({
          id: data._id,
          name: data.name || "",
          slug: data.slug || "",
          image: null,
          isActive: data.isActive || false,
          isHome: data.isHome || false,
          isTop: data.isTop || false,
          isPopular: data.isPopular || false,
        });

        if (data.image?.url) {
          setPreview(data.image.url);
        }

        setSlugTouched(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load category");
        navigate("/categories");
      }
    };

    fetchCategory();
  }, [slug, isEditMode, navigate]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: null,
    isActive: true,
    isHome: false,
    isTop: false,
    isPopular: false,
  });

  const validateForm = () => {
    // 1️⃣ name validation
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return false;
    }

    if (form.name.trim().length < 2) {
      toast.error("Category name must be at least 2 characters");
      return false;
    }

    // 2️⃣ slug validation (if user typed manually)
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error(
        "Slug can only contain lowercase letters, numbers and hyphens",
      );
      return false;
    }

    // 3️⃣ image validation (if uploaded)
    if (form.image) {
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedTypes.includes(form.image.type)) {
        toast.error("Only PNG, JPG or WEBP images allowed");
        return false;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      if (form.image.size > maxSize) {
        toast.error("Image must be smaller than 2MB");
        return false;
      }
    }

    return true;
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-") // spaces → hyphens
      .replace(/-+/g, "-"); // remove double hyphens
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // slug field manual control
    if (name === "slug") {
      setSlugTouched(value.trim() !== "");
    }

    setForm((prev) => {
      const updatedForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // smart name → slug behavior
      if (name === "name") {
        // if name is cleared, reset slug + unlock auto mode
        if (!value.trim()) {
          updatedForm.slug = "";
          setSlugTouched(false);
        }
        // auto generate only if slug is not manually locked
        else if (!slugTouched) {
          updatedForm.slug = generateSlug(value);
        }
      }

      return updatedForm;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // remove OLD preview from memory
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    // create NEW preview url
    const previewUrl = URL.createObjectURL(file);

    // 1️⃣ save file for backend
    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    // 2️⃣ save preview for UI
    setPreview(previewUrl);
  };

  const handleToggleCard = (name) => {
    setForm((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);

    setForm((prev) => ({
      ...prev,
      image: null,
    }));

    setIsImageRemoved(true);
  };

  const handleSubmit = async () => {
    if (loading) return; // prevent double click

    // Form Validation
    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      const formData = new FormData();

      // append normal fields
      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("isActive", form.isActive);
      formData.append("isHome", form.isHome);
      formData.append("isTop", form.isTop);
      formData.append("isPopular", form.isPopular);
      formData.append("isImageRemoved", isImageRemoved);

      // append image ONLY if exists
      if (form.image) {
        formData.append("image", form.image);
      }

      if (isEditMode) {
        await updateCategory(form.id, formData);
      } else {
        await createCategory(formData);
      }

      toast.success(isEditMode ? "Category updated 🎉" : "Category created 🎉");
      navigate("/categories");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" mx-auto text-(--text)">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isEditMode ? "Edit Category" : "Add Category"}
          </h1>
          <p className="text-sm text-(--subText) cursor-pointer">
            Create a new product category
          </p>
        </div>
        <button
          onClick={() => navigate("/categories")}
          className="flex items-center gap-2 text-sm text-(--subText) hover:text-(--primary) mb-3 cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i>
          Back to categories
        </button>
      </div>

      {/* FORM CARD */}
      <div className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-6">
          {/* CATEGORY NAME */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-(--subText)">Category Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter category name"
              className="bg-(--bg) border border-(--border) rounded-lg px-4 py-2.5 outline-none focus:border-(--primary)"
            />
          </div>

          {/* SLUG */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-(--subText)">Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug || ""}
              onChange={handleChange}
              placeholder="auto-generated-slug"
              className="bg-(--bg) border border-(--border) rounded-lg px-4 py-2.5 outline-none focus:border-(--primary)"
            />
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="mt-6 flex flex-col gap-2">
          <label className="text-sm text-(--subText)">Category Image</label>
          <div className="flex items-start gap-6">
            {/* UPLOAD BOX */}
            <label
              htmlFor="categoryImage"
              className="w-3/5 border-2 border-dashed border-(--border) rounded-xl p-6 text-center cursor-pointer hover:bg-(--bg) transition"
            >
              <i className="ri-upload-cloud-2-line text-3xl text-(--subText)"></i>

              <p className="text-sm text-(--subText) mt-2 wrap-break-word">
                {form.image ? form.image.name : "Click to upload image"}
              </p>

              <input
                id="categoryImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* PREVIEW */}
            {preview && (
              <div className="relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-40 h-40 object-cover object-top rounded-xl border border-(--border)"
                />

                {/* REMOVE BUTTON */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-rose-500 hover:scale-110 text-white rounded-full w-7 h-7 flex items-center justify-center shadow transition cursor-pointer"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SWITCHES */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {[
            { label: "Active", name: "isActive" },
            { label: "Show on Home", name: "isHome" },
            { label: "Top Category", name: "isTop" },
            { label: "Popular Category", name: "isPopular" },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => handleToggleCard(item.name)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition
              ${
                form[item.name]
                  ? "bg-(--primary)/10 border-(--primary)"
                  : "bg-(--bg) border-(--border) hover:bg-(--bgSoft)"
              }`}
            >
              <span className="text-sm select-none">{item.label}</span>

              {/* REAL CHECKBOX (still here for accessibility) */}
              {/* Hidden real checkbox (for accessibility & form state) */}
              <input
                type="checkbox"
                name={item.name}
                checked={form[item.name]}
                onChange={handleChange}
                className="hidden"
              />

              {/* Animated toggle */}
              <div
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300
                  ${form[item.name] ? "bg-(--primary)" : "bg-gray-400"}
                `}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300
                  ${form[item.name] ? "translate-x-6" : "translate-x-0"}
                `}
                />
              </div>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => navigate("/categories")}
            className="px-5 py-2.5 rounded-lg border border-(--border) hover:bg-(--bg) cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-(--primary) text-white px-6 py-2.5 rounded-lg 
              hover:opacity-90 flex items-center gap-2 cursor-pointer
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading && <i className="ri-loader-4-line animate-spin"></i>}
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Category"
                : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}
