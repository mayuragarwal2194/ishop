import axios from "./axios";

// ================= CATEGORY APIs =================

export const getAllCategories = () => {
  return axios.get("/category");
};

export const getCategoryById = (id) => {
  return axios.get(`/category/${id}`);
};

export const getCategoryBySlug = (slug) => {
  return axios.get(`/category/slug/${slug}`);
};

export const createCategory = (data) => {
  return axios.post("/category", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateCategory = (id, data) => {
  return axios.patch(`/category/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteCategory = (id) => {
  return axios.delete(`/category/${id}`);
};