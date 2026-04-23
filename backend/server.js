import express from "express";
import "./config/env.js"
import cors from "cors";
import {connectDB} from "./config/db.js" 
import { errorHandler } from "./middlewares/error.middleware.js";

const PORT = process.env.PORT || 5000;

// Import Routes
import categoryRoutes from "./routes/category.routes.js";
import colorRoutes from "./routes/color.routes.js";
import brandRoutes from "./routes/brand.routes.js";


const app = express();

// middlewares
app.use(cors())
app.use(express.json());


app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/color", colorRoutes);
app.use("/api/v1/brand", brandRoutes);


app.use(errorHandler);


// connect database
await connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
