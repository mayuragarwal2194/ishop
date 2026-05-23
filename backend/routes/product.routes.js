import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, removeProductFeaturedImage, removeProductGalleryImage, removeVariantFeaturedImage, removeVariantGalleryImage, updateProduct, uploadVariantImages } from "../controllers/productController.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", upload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]), createProduct);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

// Update product with optional image uploads
router.patch("/:id", upload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]), updateProduct);

// Remove product gallery image
router.delete(
  "/:productId/gallery-image/:imageId",
  removeProductGalleryImage
);

// Remove product featured image 
router.delete(
  "/:productId/featured-image",
  removeProductFeaturedImage
);

// Upload or update variant images
router.patch(
  "/:productId/variant/:variantId/images",
  upload.fields([
    { name: "variantFeaturedImage", maxCount: 1 },
    { name: "variantGalleryImages", maxCount: 10 },
  ]),
  uploadVariantImages
);

// remove variant featured image
router.delete(
  "/:productId/variant/:variantId/featured-image",
  removeVariantFeaturedImage
);

// remove variant gallery image
router.delete(
  "/:productId/variant/:variantId/gallery-image/:imageId",
  removeVariantGalleryImage
);

export default router;