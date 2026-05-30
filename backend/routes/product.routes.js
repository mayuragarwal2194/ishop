import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, removeProductFeaturedImage, removeProductGalleryImage, removeVariantFeaturedImage, removeVariantGalleryImage, updateProduct, uploadVariantImages } from "../controllers/productController.js";
import upload from "../middlewares/upload.middleware.js";
import { protect } from "../middlewares/auth_middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/auth_middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  createProduct
);

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  deleteProduct
);

// Update product with optional image uploads
router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updateProduct
);

// Remove product gallery image
router.delete(
  "/:productId/gallery-image/:imageId",
  protect,
  authorizeRoles("admin", "superadmin"),
  removeProductGalleryImage
);

// Remove product featured image 
router.delete(
  "/:productId/featured-image",
  protect,
  authorizeRoles("admin", "superadmin"),
  removeProductFeaturedImage
);

// Upload or update variant images
router.patch(
  "/:productId/variant/:variantId/images",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.fields([
    { name: "variantFeaturedImage", maxCount: 1 },
    { name: "variantGalleryImages", maxCount: 10 },
  ]),
  uploadVariantImages
);

// remove variant featured image
router.delete(
  "/:productId/variant/:variantId/featured-image",
  protect,
  authorizeRoles("admin", "superadmin"),
  removeVariantFeaturedImage
);

// remove variant gallery image
router.delete(
  "/:productId/variant/:variantId/gallery-image/:imageId",
  protect,
  authorizeRoles("admin", "superadmin"),
  removeVariantGalleryImage
);

export default router;