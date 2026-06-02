import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";


export const addToCartService = async (userId, productId, variantId, quantity) => {

  // Validate product and variant ids
  const validProductId = validateObjectId(productId, "Product");
  const validVariantId = validateObjectId(variantId, "Variant");

  // Fetch product and variant details
  const product = await Product.findById(validProductId);

  // Check if product exists
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if product is active
  if (!product.isActive) {
    throw new ApiError(400, "Product is currently unavailable");
  }

  // Find the variant within the product
  const variant = product.variants.id(validVariantId);

  if (!variant) {
    throw new ApiError(404, "Product variant not found");
  }

  // Initial stock check for the requested quantity
  if (variant.stock < quantity) {
    throw new ApiError(400, `Only ${variant.stock} items available in stock`);
  }

  // Find or create the user's cart
  let cart = await Cart.findOne({ user: userId });

  // Create a new cart if it doesn't exist
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // Check if the item already exists in the cart
  const existingItem = cart.items.find(item =>
    item.product.toString() === validProductId.toString() &&
    item.variant.toString() === validVariantId.toString()
  );

  // If item exists, update quantity, otherwise add new item
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    // Validate stock for the updated quantity
    if (newQuantity > variant.stock) {
      throw new ApiError(400, `Only ${variant.stock - existingItem.quantity} items available in stock`);
    }
    existingItem.quantity = newQuantity;
  } else {
    // Add new item to cart
    cart.items.push({
      product: validProductId,
      variant: validVariantId,
      quantity,
    });
  }

  // Save the cart
  await cart.save();

  return cart;

}

export const getCartService = async (userId) => {

  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: `
      name
      slug
      featuredImage
      variants
      isActive
    `
  });

  // Return empty cart if user doesn't have one
  if (!cart) {
    return {
      items: [],
      totalItems: 0,
      grandTotal: 0,
      hasIssues: false,
      warnings: []
    };
  }

  const items = [];

  let totalItems = 0;
  let grandTotal = 0;
  let hasIssues = false;

  for (const item of cart.items) {
    const product = item.product;

    let isAvailable = true;
    let warning = null;

    // Product may have been deleted
    if (!product) {
      isAvailable = false;
      warning = "Product no longer exists";
    }

    const variant = product?.variants?.id(item.variant);

    // Variant may have been deleted
    if (product && !variant) {
      isAvailable = false;
      warning = "Variant no longer exists";
    }

    // Check product and variant availability and stock
    if (product && !product.isActive) {
      isAvailable = false;
      warning = "Product is currently unavailable";
    }

    // If variant exists, check stock
    if (variant && variant.stock === 0) {
      isAvailable = false;
      warning = "Variant is out of stock";
    }

    // If variant exists, check if requested quantity exceeds stock
    if (variant && variant.stock > 0 && item.quantity > variant.stock) {
      isAvailable = false;
      warning = `Only ${variant.stock} items available in stock`;
    }

    // If any availability issue is found, mark the item as having issues
    if (!isAvailable) {
      hasIssues = true;
    }

    // Calculate effective price (considering sale price if available) and subtotal
    const effectivePrice = variant?.salePrice || variant?.price || 0;
    const subtotal = effectivePrice * item.quantity;

    // Push item details along with availability and warning info to the items array
    items.push({
      productId: product?._id,
      productName: product?.name,
      slug: product?.slug,

      variantId: variant?._id,
      sku: variant?.sku,

      image: variant?.variantFeaturedImage?.url || product?.featuredImage?.url,

      attributes: variant?.attributes,

      price: effectivePrice,
      originalPrice: variant?.price,

      quantity: item.quantity,

      stock: variant?.stock ?? 0,

      isAvailable,
      warning,

      subtotal
    });

    // Accumulate total items and grand total (only for available items)
    totalItems += item.quantity;

    // only count price for available items
    if (isAvailable) {
      grandTotal += subtotal;
    }
  }

  return {
    items,
    totalItems,
    grandTotal,
    hasIssues,
  };
};

export const updateCartItemService = async (userId, variantId, quantity) => {
  // Validate variant ID
  const validVariantId = validateObjectId(variantId, "Variant");

  // Find the user's cart
  const cart = await Cart.findOne({ user: userId });

  // If cart doesn't exist, throw an error
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // Find the cart item with the specified variant ID
  const cartItem = cart.items.find(item =>
    item.variant.toString() === validVariantId.toString()
  );

  // If cart item doesn't exist, throw an error
  if (!cartItem) {
    throw new ApiError(404, "Item not found in cart");
  }

  // Fetch the product to check stock
  const product = await Product.findById(cartItem.product);

  // If product doesn't exist, throw an error
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Is Product active?
  if (!product.isActive) {
    throw new ApiError(400, "Product is currently unavailable");
  }

  // Find the variant within the product
  const variant = product.variants.id(validVariantId);

  // If variant doesn't exist, throw an error
  if (!variant) {
    throw new ApiError(404, "Product variant not found");
  }

  // Check stock for the requested quantity
  if (variant.stock === 0) {
    throw new ApiError(400, "Product is out of stock");
  }

  if (quantity > variant.stock) {
    throw new ApiError(400, `Only ${variant.stock} items available in stock`);
  }

  // Update the quantity of the cart item
  cartItem.quantity = quantity;

  // Save the cart
  await cart.save();

  return cart;
}

export const removeCartItemService = async (userId, variantId) => {
  // validate variant id
  const validVariantId = validateObjectId(variantId, "Variant");

  // Find cart
  const cart = await Cart.findOne({ user: userId });

  // If cart doesn't exist, throw an error
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // Find the cart item with the specified variant ID
  const cartItem = cart.items.find(item =>
    item.variant.toString() === validVariantId.toString()
  );

  // If cart item doesn't exist, throw an error
  if (!cartItem) {
    throw new ApiError(404, "Item not found in cart");
  }

  // Remove item from the cart
  cart.items = cart.items.filter(item =>
    item.variant.toString() !== validVariantId.toString()
  );

  // Save the updated cart (after deleting the particular item)
  await cart.save();

  return cart;

}

export const clearCartService = async (userId) => {
  // Find cart
  const cart = await Cart.findOne({ user: userId });

  // If cart doesn't exist, throw an error
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // Check if the cart is already empty 
  if (cart.items.length === 0) {
    throw new ApiError(400, "Cart is already empty");
  }

  // If cart exist then Empty the whole cart
  cart.items = [];

  await cart.save();

  return cart;
}