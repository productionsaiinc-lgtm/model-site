import express from "express";
import creators from "../../api/creators.js";
import posts from "../../api/posts.js";
import subscriptions from "../../api/subscriptions.js";

const router = express.Router();

router.get("/list", creators.getCreators);
router.get("/:id", creators.getCreator);

router.get("/:creatorId/posts", posts.getCreatorPosts);

router.get("/:creatorId/subscription/:fanId", subscriptions.checkSubscription);

export default router;
