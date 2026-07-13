import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import paypalRoutes from "./routes/paypal.js";
import memberRoutes from "./routes/member.js";
import creatorRoutes from "./routes/creator.js";
import userRoutes from "./routes/users.js";
import uploadRoutes from "./routes/uploads-secure.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["https://productionsaiinc-lgtm.github.io", "https://productionsaiinc-lgtm.github.io/model-site"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Nova Studio API"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

export default app;
