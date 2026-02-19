import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";



const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/submissions", submissionRoutes);

app.get("/", (req, res) => {
  res.send("OCA Backend Running ✅");
});

connectDB();
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
