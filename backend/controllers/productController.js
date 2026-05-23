import Product from "../models/product.model.js";
import Brand from "../models/brand.model.js";
import Color from "../models/color.model.js";
import SubCategory from "../models/subCategory.model.js";
import { uploadImage, deleteImage } from "../services/upload.service.js";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseBoolean } from "../helper/parseBoolean.helper.js";
import { getPagination } from "../utils/pagination.js";
import { buildSearchQuery } from "../utils/search.js";
import { buildSortQuery } from "../utils/buildSortQuery.js";
import { validateVariants } from "../utils/validateVariants.js";
import { generateSlug } from "../utils/generateSlug.js";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/constants.js";

export const createProduct = asyncHandler(async (req, res) => {

  // 1. Extract fields from request body
  const {
    name,
    slug,
    description,
    subCategory,
    brand,
    variants,
    isActive,
    isHome,
    isTop,
    isPopular,
  } = req.body;

  // 2. Validation: name, category, brand are required
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Product name is required");
  }

  // 3. Validate SubCategory ID + existence
  const validSubCategory = validateObjectId(subCategory, "SubCategory");
  const subCategoryExists = await SubCategory.findById(validSubCategory);
  if (!subCategoryExists) {
    throw new ApiError(404, "SubCategory not found");
  }

  // 4. Validate Brand ID + existence
  const validBrand = validateObjectId(brand, "Brand");
  const brandExists = await Brand.findById(validBrand);
  if (!brandExists) {
    throw new ApiError(404, "Brand not found");
  }

  // 5. Parse variants safely
  let parsedVariants = [];

  if (!variants) {
    throw new ApiError(400, "Variants are required");
  }

  if (typeof variants === "string") {
    try {
      parsedVariants = JSON.parse(variants);
    } catch (error) {
      throw new ApiError(400, "Invalid variants format");
    }
  } else {
    parsedVariants = variants;
  }

  // 🔥 Validate via utility
  await validateVariants(parsedVariants);

  // 8. Generate normalized slug
  const normalizedSlug = generateSlug(slug, name);

  // 9. Prevent duplicate slug
  const existingProduct = await Product.findOne({
    slug: normalizedSlug
  });

  if (existingProduct) {
    throw new ApiError(400, "Product with this slug already exists");
  }

  // 10 Parse description safely
  let parsedDescription = {};

  if (description) {
    if (typeof description === "string") {
      try {
        parsedDescription = JSON.parse(description);
      } catch (error) {
        throw new ApiError(400, "Invalid description format");
      }
    } else {
      parsedDescription = description;
    }
  }


  // 11. Upload product images
  let featuredImage;
  let galleryImages = [];

  // 🔥 rollback tracker
  const uploadedImages = [];

  // Featured image upload
  if (req.files?.featuredImage?.[0]) {
    const uploadedFeatured = await uploadImage(
      req.files.featuredImage[0].path,
      "ishop/products"
    );
    featuredImage = uploadedFeatured;
    uploadedImages.push(uploadedFeatured.public_id);
  }

  // Gallery image uploads
  if (req.files?.galleryImages?.length > 0) {
    for (const file of req.files.galleryImages) {
      const uploadedGallery = await uploadImage(
        file.path,
        "ishop/products"
      );
      galleryImages.push(uploadedGallery);
      uploadedImages.push(uploadedGallery.public_id);
    }
  }

  try {

    // 12. Create Product
    const productCreated = await Product.create({
      name: name.trim(),
      slug: normalizedSlug,

      description: parsedDescription,

      subCategory: validSubCategory,
      brand: validBrand,

      variants: parsedVariants,

      featuredImage,
      galleryImages,

      isActive: parseBoolean(isActive),
      isHome: parseBoolean(isHome),
      isTop: parseBoolean(isTop),
      isPopular: parseBoolean(isPopular),
    });

    // 13. Success response
    return ApiResponse(
      res,
      201,
      "Product created successfully",
      productCreated
    );

  } catch (error) {

    // 🔥 rollback uploaded images if DB fails
    if (uploadedImages.length > 0) {

      await Promise.all(
        uploadedImages.map(publicId =>
          deleteImage(publicId)
        )
      );
    }

    throw error;
  }

});

// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {

  const filter = {};

  const {
    isActive,
    isHome,
    isTop,
    isPopular,
    subCategory,
    brand,
    color,
    stockStatus,
    minPrice,
    maxPrice,
    search,
    sort
  } = req.query;

  // 🔥 Global pagination
  const { page, limit, skip } = getPagination(req.query);

  // Boolean filters
  if (isActive !== undefined) filter.isActive = parseBoolean(isActive);
  if (isHome !== undefined) filter.isHome = parseBoolean(isHome);
  if (isTop !== undefined) filter.isTop = parseBoolean(isTop);
  if (isPopular !== undefined) filter.isPopular = parseBoolean(isPopular);

  // SubCategory filter
  if (subCategory) {
    const validSubCategory = validateObjectId(
      subCategory,
      "SubCategory"
    );

    filter.subCategory = validSubCategory;
  }

  // Brand filter
  if (brand) {
    const validBrand = validateObjectId(
      brand,
      "Brand"
    );

    filter.brand = validBrand;
  }

  // Color filter (on variants)
  if (color) {
    const validColor = validateObjectId(
      color,
      "Color"
    );
    filter["variants.color"] = validColor;
  }

  // Stock status filter
  if (stockStatus) {
    filter.stockStatus = stockStatus;
  }

  // Price range filter (on variants)
  if (minPrice || maxPrice) {

    filter["variants.price"] = {};

    if (minPrice) {
      filter["variants.price"].$gte = Number(minPrice);
    }

    if (maxPrice) {
      filter["variants.price"].$lte = Number(maxPrice);
    }
  }

  // 🔥 Search filter
  const searchQuery = buildSearchQuery(
    search,
    ["name", "slug"]
  );

  // Final filter
  const finalFilter = {
    ...filter,
    ...searchQuery,
  };

  // 🔥 Build sort query
  const sortQuery = buildSortQuery(sort, {
    price_asc: {
      "variants.price": 1
    },
    price_desc: {
      "variants.price": -1
    },
    popular: {
      isPopular: -1
    },
  });

  // Total count
  const totalProducts = await Product.countDocuments(finalFilter);

  const totalPages = Math.ceil(totalProducts / limit);

  // Fetch products
  const products = await Product.find(finalFilter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate("subCategory", "name slug")
    .populate("brand", "name slug")
    .populate("variants.color", "name code");

  // Success response
  return ApiResponse(
    res,
    200,
    "Products fetched successfully",
    products,
    {
      total: totalProducts,
      page,
      totalPages,
    }
  );
});

// Get product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  const validId = validateObjectId(id, "Product");

  // 2. Fetch product with details
  const product = await Product.findById(validId)
    .populate("subCategory", "name slug")
    .populate("brand", "name slug")
    .populate("variants.color", "name code");

  // 3. Check existence
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 4. Success response
  return ApiResponse(
    res,
    200,
    "Product fetched successfully",
    product
  );
});

// Delete product by ID
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  const validId = validateObjectId(id, "Product");

  // 2. Fetch product
  const product = await Product.findById(validId);

  // 3. Check existence
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 4. Delete associated images
  const imagePublicIds = [];

  // Product featured image
  if (product.featuredImage?.public_id) {
    imagePublicIds.push(product.featuredImage.public_id);
  }

  // Product gallery images
  if (product.galleryImages && product.galleryImages.length > 0) {
    product.galleryImages.forEach(img => {
      if (img.public_id) {
        imagePublicIds.push(img.public_id);
      }
    });
  }

  // Variant images
  if (product.variants?.length > 0) {

    product.variants.forEach((variant) => {

      // Variant featured image
      if (variant.variantFeaturedImage?.public_id) {
        imagePublicIds.push(
          variant.variantFeaturedImage.public_id
        );
      }

      // Variant gallery images
      if (variant.variantGalleryImages?.length > 0) {

        variant.variantGalleryImages.forEach((image) => {

          if (image.public_id) {
            imagePublicIds.push(image.public_id);
          }
        });
      }
    });
  }

  // 5. Delete product
  await Product.findByIdAndDelete(validId);

  // 6. Delete images from Cloudinary
  if (imagePublicIds.length > 0) {
    try {
      await Promise.all(
        imagePublicIds.map((publicId) =>
          deleteImage(publicId)
        )
      );
    } catch (error) {
      console.error(
        "Product deleted but image cleanup failed:",
        error.message
      );
    }
  }

  // 7. Success response
  return ApiResponse(
    res,
    200,
    `${product.name} deleted successfully`,
    null
  );
});

// Update Product
export const updateProduct = asyncHandler(async (req, res) => {

  // 1. Extract and validate product ID
  const { id } = req.params;

  const validId = validateObjectId(id, "Product");

  // 2. Find existing product
  const product = await Product.findById(validId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 3. Extract fields from request body
  const {
    name,
    slug,
    description,
    subCategory,
    brand,
    variants,
    isActive,
    isHome,
    isTop,
    isPopular,
  } = req.body || {};

  // 4. Validate SubCategory (if provided)
  let validSubCategory;

  if (subCategory) {
    validSubCategory = validateObjectId(
      subCategory,
      "SubCategory"
    );
    const subCategoryExists = await SubCategory.findById(
      validSubCategory
    );
    if (!subCategoryExists) {
      throw new ApiError(404, "SubCategory not found");
    }
  }

  // 5. Validate Brand (if provided)
  let validBrand;

  if (brand) {
    validBrand = validateObjectId(
      brand,
      "Brand"
    );
    const brandExists = await Brand.findById(validBrand);
    if (!brandExists) {
      throw new ApiError(404, "Brand not found");
    }
  }

  // 6. Parse variants safely (if provided)
  let parsedVariants;

  if (variants) {
    try {
      parsedVariants = JSON.parse(variants);
    } catch (error) {
      throw new ApiError(
        400,
        "Invalid variants format"
      );
    }

    // Validate variants via utility
    await validateVariants(parsedVariants, validId);
  }

  // 7. Generate normalized slug (if slug or name provided)
  const normalizedSlug =
    slug || name
      ? generateSlug(slug, name)
      : product.slug;

  // 8. Prevent duplicate slug
  if (normalizedSlug !== product.slug) {

    const existingProduct = await Product.findOne({
      slug: normalizedSlug,
      _id: { $ne: validId }
    });

    if (existingProduct) {
      throw new ApiError(
        400,
        "Product already exists"
      );
    }
  }

  // 9. Upload new images
  let featuredImage;
  let galleryImages = [];

  // rollback tracker
  const uploadedImages = [];

  // Upload featured image
  if (req.files?.featuredImage?.[0]) {

    const uploadedFeatured = await uploadImage(
      req.files.featuredImage[0].path,
      "ishop/products"
    );

    featuredImage = uploadedFeatured;

    uploadedImages.push(
      uploadedFeatured.public_id
    );
  }

  // Upload gallery images
  if (req.files?.galleryImages?.length > 0) {

    for (const file of req.files.galleryImages) {

      const uploadedGallery = await uploadImage(
        file.path,
        "ishop/products"
      );

      galleryImages.push(uploadedGallery);

      uploadedImages.push(
        uploadedGallery.public_id
      );
    }
  }

  // 10. Store old image references
  const oldFeaturedImagePublicId =
    product.featuredImage?.public_id;

  // 11. Parse description safely
  let parsedDescription;
  if (description) {
    try {
      parsedDescription = JSON.parse(description);
    } catch (error) {
      throw new ApiError(
        400,
        "Invalid description format"
      );
    }
  }

  try {

    // 12. Update fields

    if (name !== undefined && name.trim() !== "") {
      product.name = name.trim();
    }

    if (normalizedSlug) product.slug = normalizedSlug;
    if (description) product.description = parsedDescription;
    if (validSubCategory) product.subCategory = validSubCategory;
    if (validBrand) product.brand = validBrand;
    if (parsedVariants) product.variants = parsedVariants;

    // Replace featured image
    if (featuredImage) product.featuredImage = featuredImage;

    // Append gallery images
    if (galleryImages.length > 0) {

      const hasOnlyDefaultImage =
        product.galleryImages.length === 1 &&
        product.galleryImages[0].public_id === null;

      if (hasOnlyDefaultImage) {

        // replace default image
        product.galleryImages = galleryImages;

      } else {

        // append new images
        product.galleryImages.push(
          ...galleryImages
        );
      }
    }

    // Update booleans
    if (isActive !== undefined) product.isActive = parseBoolean(isActive);
    if (isHome !== undefined) product.isHome = parseBoolean(isHome);
    if (isTop !== undefined) product.isTop = parseBoolean(isTop);
    if (isPopular !== undefined) product.isPopular = parseBoolean(isPopular);

    // 🔥 TEST ROLLBACK
    // throw new Error("Manual rollback test");

    // 13. Save updated product
    const updatedProduct = await product.save();


    // 14. Delete old featured image AFTER successful DB save
    if (featuredImage && oldFeaturedImagePublicId) {
      try {
        await deleteImage(
          oldFeaturedImagePublicId
        );
      } catch (error) {
        console.error(
          "Old featured image delete failed:",
          error.message
        );
      }
    }

    // 16. Success response
    return ApiResponse(
      res,
      200,
      "Product updated successfully",
      updatedProduct
    );

  } catch (error) {

    //17. rollback newly uploaded images
    if (uploadedImages.length > 0) {

      await Promise.all(
        uploadedImages.map(publicId =>
          deleteImage(publicId)
        )
      );
    }

    throw error;
  }
});

// Remove Product Gallery Image
export const removeProductGalleryImage = asyncHandler(async (req, res) => {

  // 1. Extract params
  const { productId, imageId } = req.params;

  // 2. Validate IDs
  const validProductId = validateObjectId(
    productId,
    "Product"
  );

  const validImageId = validateObjectId(
    imageId,
    "Image"
  );

  // 3. Find product
  const product = await Product.findById(validProductId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 4. Find gallery image
  const image = product.galleryImages.id(
    validImageId
  );

  if (!image) {
    throw new ApiError(
      404,
      "Gallery image not found"
    );
  }

  // 5. Prevent deleting default image
  if (!image.public_id) {
    throw new ApiError(
      400,
      "Default image cannot be removed"
    );
  }

  // 6. Delete from cloudinary
  await deleteImage(image.public_id);

  // 7. Remove from DB
  image.deleteOne();

  // 8. Restore default image if empty
  if (product.galleryImages.length === 0) {

    product.galleryImages = [
      {
        url: DEFAULT_PRODUCT_IMAGE,
        public_id: null,
      }
    ];
  }

  // 9. Save product
  await product.save();

  // 10. Response
  return ApiResponse(
    res,
    200,
    "Product gallery image removed successfully",
    product
  );
});

// Remove Product Featured Image
export const removeProductFeaturedImage = asyncHandler(async (req, res) => {

  // 1. Extract params
  const { productId } = req.params;

  // 2. Validate product ID
  const validProductId = validateObjectId(
    productId,
    "Product"
  );

  // 3. Find product
  const product = await Product.findById(validProductId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 4. Prevent deleting default image
  if (!product.featuredImage?.public_id) {
    throw new ApiError(
      400,
      "Default featured image cannot be removed"
    );
  }

  // 5. Delete from Cloudinary
  await deleteImage(
    product.featuredImage.public_id
  );

  // 6. Restore default image
  product.featuredImage = {
    url: DEFAULT_PRODUCT_IMAGE,
    public_id: null,
  };

  // 7. Save product
  await product.save();

  // 8. Response
  return ApiResponse(
    res,
    200,
    "Product featured image removed successfully",
    product
  );
});

// Upload Variant Images
export const uploadVariantImages = asyncHandler(async (req, res) => {

  // 1. Extract params
  const { productId, variantId } = req.params;

  // 2. Validate IDs
  const validProductId = validateObjectId(
    productId,
    "Product"
  );

  const validVariantId = validateObjectId(
    variantId,
    "Variant"
  );

  // 3. Find product
  const product = await Product.findById(validProductId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 4. Find variant
  const variant = product.variants.id(validVariantId);

  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  // 5. Prepare upload trackers
  let variantFeaturedImage;

  let variantGalleryImages = [];

  // rollback tracker
  const uploadedImages = [];

  // old image trackers
  const oldFeaturedImagePublicId =
    variant.variantFeaturedImage?.public_id;

  // 6. Upload featured image
  if (req.files?.variantFeaturedImage?.[0]) {

    const uploadedFeatured = await uploadImage(
      req.files.variantFeaturedImage[0].path,
      "ishop/products/variants"
    );

    variantFeaturedImage = uploadedFeatured;

    uploadedImages.push(
      uploadedFeatured.public_id
    );
  }

  // 7. Upload gallery images
  if (req.files?.variantGalleryImages?.length > 0) {

    for (const file of req.files.variantGalleryImages) {

      const uploadedGallery = await uploadImage(
        file.path,
        "ishop/products/variants"
      );

      variantGalleryImages.push(
        uploadedGallery
      );

      uploadedImages.push(
        uploadedGallery.public_id
      );
    }
  }

  try {

    // 8. Replace featured image
    if (variantFeaturedImage) {
      variant.variantFeaturedImage =
        variantFeaturedImage;
    }

    // 9. Replace gallery images if new ones uploaded 
    if (variantGalleryImages.length > 0) {

      const hasOnlyDefaultImage =
        variant.variantGalleryImages?.length === 1 &&
        variant.variantGalleryImages[0]?.public_id === null;

      if (hasOnlyDefaultImage) {

        // replace default image
        variant.variantGalleryImages =
          variantGalleryImages;

      } else {

        // append new images
        variant.variantGalleryImages.push(
          ...variantGalleryImages
        );
      }
    }

    // 10. Save product
    await product.save();

    // 11. Delete old featured image AFTER save
    if (
      variantFeaturedImage &&
      oldFeaturedImagePublicId
    ) {
      try {

        await deleteImage(
          oldFeaturedImagePublicId
        );

      } catch (error) {

        console.error(
          "Old variant featured image delete failed:",
          error.message
        );
      }
    }

    // 13. Success response
    return ApiResponse(
      res,
      200,
      "Variant images uploaded successfully",
      variant
    );

  } catch (error) {

    // 14. Rollback newly uploaded images
    if (uploadedImages.length > 0) {

      await Promise.all(
        uploadedImages.map(publicId =>
          deleteImage(publicId)
        )
      );
    }

    throw error;
  }
});

// Remove Variant Featured Image
export const removeVariantFeaturedImage = asyncHandler(async (req, res) => {

  // 1. Extract params
  const { productId, variantId } = req.params;

  // 2. Validate IDs
  const validProductId = validateObjectId(
    productId,
    "Product"
  );

  const validVariantId = validateObjectId(
    variantId,
    "Variant"
  );

  // 3. Find product
  const product = await Product.findById(validProductId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 4. Find variant
  const variant = product.variants.id(validVariantId);

  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  // 5. Prevent removing default image
  if (!variant.variantFeaturedImage?.public_id) {
    throw new ApiError(
      400,
      "Default featured image cannot be removed"
    );
  }

  // 6. Delete image from cloudinary
  await deleteImage(
    variant.variantFeaturedImage.public_id
  );

  // 7. Reset to default image
  variant.variantFeaturedImage = {
    url: DEFAULT_PRODUCT_IMAGE,
    public_id: null,
  };

  // 8. Save
  await product.save();

  // 9. Response
  return ApiResponse(
    res,
    200,
    "Variant featured image removed successfully",
    variant
  );
});

// Remove Variant Gallery Image
export const removeVariantGalleryImage = asyncHandler(async (req, res) => {

  // 1. Extract params
  const {
    productId,
    variantId,
    imageId
  } = req.params;

  // 2. Validate IDs
  const validProductId = validateObjectId(
    productId,
    "Product"
  );

  const validVariantId = validateObjectId(
    variantId,
    "Variant"
  );

  const validImageId = validateObjectId(
    imageId,
    "Image"
  );

  // 3. Find product
  const product = await Product.findById(validProductId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 4. Find variant
  const variant = product.variants.id(validVariantId);

  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  // 5. Find gallery image
  const image = variant.variantGalleryImages.id(
    validImageId
  );

  if (!image) {
    throw new ApiError(
      404,
      "Gallery image not found"
    );
  }

  // prevent deleting default image
  if (!image.public_id) {
    throw new ApiError(
      400,
      "Default image cannot be removed"
    );
  }

  // 6. Delete from cloudinary
  await deleteImage(image.public_id);

  // 7. Remove from DB
  image.deleteOne();

  // 8. Restore default image if empty
  if (variant.variantGalleryImages.length === 0) {

    variant.variantGalleryImages = [
      {
        url: DEFAULT_PRODUCT_IMAGE,
        public_id: null,
      }
    ];
  }

  // 9. Save
  await product.save();

  // 10. Response
  return ApiResponse(
    res,
    200,
    "Variant gallery image removed successfully",
    variant
  );
});