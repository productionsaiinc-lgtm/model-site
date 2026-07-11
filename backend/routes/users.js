import express from "express";
import users from "../../api/users.js";

const router = express.Router();

router.get("/:id", users.getUser);
router.get("/:id/role", users.checkRole);

export default router;
