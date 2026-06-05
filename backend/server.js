import express from "express";
import "./config/env.js"
import cors from "cors";
import {connectDB} from "./config/db.js" 
import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 5000;

// Import Routes
import categoryRoutes from "./routes/category.routes.js";
import colorRoutes from "./routes/color.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import subCategoryRoutes from "./routes/subCategory.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";



const app = express();

// middlewares
app.use(cors())
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/color", colorRoutes);
app.use("/api/v1/brand", brandRoutes);
app.use("/api/v1/subcategory", subCategoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/coupon", couponRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);


app.use(errorHandler);


// connect database
await connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
