import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCategories, deleteCategory } from "../../api/category.api.js";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import SearchInput from "../../components/Common/SearchInput/SearchInput.jsx";
import FilterSelect from "../../components/Common/FilterSelect/FilterSelect.jsx";
import Pagination from "../../components/Common/Pagination/Pagination.jsx";
import SortSelect from "../../components/Common/SortSelect/SortSelect.jsx";

export default function Categories() {
  const [selected, setSelected] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flagFilter, setFlagFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return Number(localStorage.getItem("itemsPerPage")) || 5;
  });

  const hasSelected = selected.length >= 1;
  const multipleSelected = selected.length > 1;

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      // always extract array safely
      const categoriesArray = res?.data?.data || [];

      setCategories(categoriesArray);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, flagFilter, sort, itemsPerPage]);

  useEffect(() => {
    localStorage.setItem("itemsPerPage", itemsPerPage);
  }, [itemsPerPage]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === categories.length) {
      setSelected([]);
    } else {
      setSelected(categories.map((c) => c._id));
    }
  };

  // delete single category
  const handleDeleteOne = async (id, name) => {
    const result = await Swal.fire({
      title: "Delete category?",
      text: `You are about to delete "${name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      background: "var(--card)",
      color: "var(--text)",
    });

    if (!result.isConfirmed) return;

    try {
      // 🔥 real API call
      await deleteCategory(id);

      // 🔥 instant UI update (same as your old logic)
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      setSelected((prev) => prev.filter((sel) => sel !== id));

      // success popup
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  };

  // bulk delete
  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: "Delete selected categories?",
      text: `You are about to delete ${
        selected.length
      } ${selected.length === 1 ? "category" : "categories"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText:
        selected.length === 1
          ? "Yes, delete"
          : selected.length === categories.length
            ? "Yes, delete all"
            : "Yes, delete selected",
      background: "var(--card)",
      color: "var(--text)",
    });

    if (!result.isConfirmed) return;

    try {
      // 🔥 run deletes in parallel
      await Promise.all(selected.map((id) => deleteCategory(id)));

      // 🔥 update UI instantly
      setCategories((prev) =>
        prev.filter((cat) => !selected.includes(cat._id)),
      );
      setSelected([]);

      // success popup
      toast.success("Selected categories deleted");
    } catch (err) {
      console.error(err);

      // Failure popup
      toast.error("Bulk delete failed");
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? cat.isActive
          : !cat.isActive;

    const matchesFlag =
      flagFilter === "all"
        ? true
        : flagFilter === "home"
          ? cat.isHome
          : flagFilter === "top"
            ? cat.isTop
            : cat.isPopular;

    return matchesSearch && matchesStatus && matchesFlag;
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);

      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);

      case "name_asc":
        return a.name.localeCompare(b.name);

      case "name_desc":
        return b.name.localeCompare(a.name);

      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

  useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(1);
  }
}, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedCategories = sortedCategories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const flagOptions = [
    { label: "All Flags", value: "all" },
    { label: "Home", value: "home" },
    { label: "Top", value: "top" },
    { label: "Popular", value: "popular" },
  ];

  const totalItems = sortedCategories.length;

  if (loading) {
    return (
      <div className="text-(--text) text-center mt-20">
        Loading categories...
      </div>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <div className="text-(--text)">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="text-sm text-(--subText)">
              Manage your product categories
            </p>
          </div>

          <Link
            to="/categories/add"
            className="bg-(--primary) hover:opacity-90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition"
          >
            <i className="ri-add-line text-lg"></i>
            Add Category
          </Link>
        </div>

        {/* EMPTY STATE */}
        <div className="bg-(--card) border border-(--border) rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📂</div>
          <h2 className="text-xl font-semibold mb-2">No categories found</h2>
          <p className="text-(--subText) mb-6">
            Start by creating your first category
          </p>

          <Link
            to="/categories/add"
            className="inline-flex items-center gap-2 bg-(--primary) text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition"
          >
            <i className="ri-add-line"></i>
            Create Category
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-(--text)">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-(--subText)">
            Manage your product categories
          </p>
        </div>
        <Link
          to="/categories/add"
          className="bg-(--primary) hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition leading-snug"
        >
          <i className="ri-add-line text-lg leading-[norlmal]"></i>
          Add Category
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6 gap-10 w-full">
        {/* Delete BUTTON */}
        <div className="flex items-center gap-4 mb-6 flex-wrap w-full">
          <div className="flex-1 w-full">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search categories..."
              classNamew-full
            />
          </div>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <FilterSelect
            value={flagFilter}
            onChange={setFlagFilter}
            options={flagOptions}
          />
          <SortSelect value={sort} onChange={setSort} />
          {hasSelected && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 cursor-pointer"
            >
              <i className="ri-delete-bin-6-line"></i>
              Delete Selected ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-(--card) rounded-2xl overflow-hidden shadow-sm border border-(--border)">
        <table className="w-full text-sm">
          {/* TABLE HEAD */}
          <thead className="bg-(--bg) text-(--subText)">
            <tr className="text-left">
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  checked={
                    categories.length > 0 &&
                    selected.length === categories.length
                  }
                  onChange={toggleSelectAll}
                  className="w-5 h-5 accent-(--primary) cursor-pointer"
                />
              </th>
              <th className="p-4">Category</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Flags</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {paginatedCategories.map((cat, index) => (
              <tr
                key={cat._id}
                className={`border-t border-(--border) transition
                  ${index % 2 === 0 ? "bg-transparent" : "bg-(--bg)"}
                  hover:bg-(--sidebarActive)/5`}
              >
                {/* CHECKBOX */}
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(cat._id)}
                    onChange={() => toggleSelect(cat._id)}
                    className="w-5 h-5 accent-(--primary) cursor-pointer"
                  />
                </td>

                {/* CATEGORY INFO */}
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={cat.image?.url}
                    alt={cat.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <span className="font-medium">{cat.name}</span>
                </td>

                {/* SLUG */}
                <td className="p-4 text-(--subText)">{cat.slug}</td>

                {/* STATUS */}
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {/* ACTIVE */}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        cat.isActive
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>

                    {/* HOME */}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        cat.isHome
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {cat.isHome ? "Home" : "Not Home"}
                    </span>

                    {/* TOP */}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        cat.isTop
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {cat.isTop ? "Top" : "Not Top"}
                    </span>

                    {/* POPULAR */}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        cat.isPopular
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {cat.isPopular ? "Popular" : "Not Popular"}
                    </span>
                  </div>
                </td>

                {/* DATE */}
                <td className="p-4">
                  {new Date(cat.createdAt).toLocaleDateString()}
                </td>

                {/* ACTIONS */}
                <td className="p-4">
                  <div className="flex justify-end gap-5 text-lg">
                    {/* EDIT */}
                    <div className="relative group">
                      <Link
                        to={`/categories/edit/${cat.slug}`}
                        disabled={multipleSelected}
                        className={`transition ${
                          multipleSelected
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:text-(--primary) cursor-pointer"
                        }`}
                      >
                        <i className="ri-edit-line"></i>
                      </Link>

                      {/* TOOLTIP */}
                      <span
                        className="absolute bottom-full mb-2 right-[300%] translate-x-1/2 
                          px-2 py-1 text-xs bg-(--card) text-(--text) rounded 
                          opacity-0 group-hover:opacity-100 whitespace-nowrap shadow pointer-events-none"
                      >
                        {multipleSelected
                          ? "Select only one row to edit"
                          : "Edit"}
                      </span>
                    </div>

                    {/* DELETE (ROW DELETE) */}
                    <div className="relative group">
                      <button
                        onClick={() => handleDeleteOne(cat._id, cat.name)}
                        disabled={multipleSelected}
                        className={`transition ${
                          multipleSelected
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:text-rose-500 cursor-pointer"
                        }`}
                      >
                        <i className="ri-delete-bin-6-line"></i>
                      </button>

                      {/* TOOLTIP */}
                      <span
                        className="absolute bottom-full mb-2 right-[300%] translate-x-1/2 
                          px-2 py-1 text-xs bg-(--card) text-(--text) rounded 
                          opacity-0 group-hover:opacity-100 whitespace-nowrap shadow pointer-events-none"
                      >
                        {multipleSelected ? "Use bulk delete above" : "Delete"}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={setItemsPerPage}
      />
    </div>
  );
}
