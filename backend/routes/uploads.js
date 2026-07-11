import express from "express";
import uploads from "../../api/uploads.js";

const router = express.Router();

router.get("/", uploads.getUploads);
router.get("/creator/:creatorId", uploads.getCreatorUploads);
router.post("/", uploads.createUpload);

export default router;
