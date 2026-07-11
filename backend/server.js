import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import paypalRoutes from "./routes/paypal.js";
import memberRoutes from "./routes/member.js";

dotenv.config();

const app = express();


app.use(
  cors({
    origin: [
      "https://productionsaiinc-lgtm.github.io"
    ],
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

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

export default app;