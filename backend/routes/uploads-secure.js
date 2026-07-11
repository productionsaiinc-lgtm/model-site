import express from "express";
import uploads from "../../api/uploads.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  requireRole("creator"),
  uploads.createUpload
);

router.get(
  "/creator/:creatorId",
  uploads.getCreatorUploads
);

export default router;
