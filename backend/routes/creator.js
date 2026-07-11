import express from "express";
import { supabase } from "../services/supabase.js";
import creators from "../../api/creators.js";
import posts from "../../api/posts.js";
import subscriptions from "../../api/subscriptions.js";

const router = express.Router();

router.get("/list", creators.getCreators);
router.get("/:id", creators.getCreator);
router.get("/:creatorId/posts", posts.getCreatorPosts);
router.get("/:creatorId/subscription/:fanId", subscriptions.checkSubscription);

// Creator dashboard statistics
router.get("/:creatorId/dashboard", async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const posts = await supabase
      .from("posts")
      .select("id", { count: "exact" })
      .eq("creator_id", creatorId);

    const payments = await supabase
      .from("payments")
      .select("amount");

    const earnings = (payments.data || [])
      .reduce((total, item) => total + Number(item.amount), 0);

    res.json({
      success: true,
      dashboard: {
        posts: posts.count || 0,
        earnings
      }
    });

  } catch (error) {
    res.status(500).json({
      success:false,
      error:error.message
    });
  }
});

// Get creator settings
router.get("/:creatorId/settings", async (req,res)=>{
  const { data,error } = await supabase
    .from("creator_settings")
    .select("*")
    .eq("creator_id", req.params.creatorId)
    .single();

  if(error) return res.status(400).json({success:false,error:error.message});

  res.json({success:true,settings:data});
});

// Update creator settings
router.put("/:creatorId/settings", async (req,res)=>{
  const { data,error } = await supabase
    .from("creator_settings")
    .upsert({
      creator_id:req.params.creatorId,
      ...req.body
    })
    .select()
    .single();

  if(error) return res.status(400).json({success:false,error:error.message});

  res.json({success:true,settings:data});
});

export default router;
