import express from "express";
import { supabase } from "../services/supabase.js";

const router = express.Router();

// Get user profile
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Update user profile
router.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, avatar_url, bio } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name,
        avatar_url,
        bio,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get user subscription status
router.get("/subscription/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const subscription = data && data.length > 0 ? data[0] : null;

    res.json({
      success: true,
      is_active: subscription?.status === "active",
      subscription: subscription
    });

  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get all membership tiers
router.get("/tiers", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("membership_tiers")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      tiers: data
    });

  } catch (error) {
    console.error("Error fetching tiers:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get payment history
router.get("/payments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Get subscription first to get subscription ID
    const { data: subscriptionData, error: subError } = await supabase
      .from("subscriptions")
      .select("paypal_subscription_id")
      .eq("user_id", userId);

    if (subError) {
      return res.status(400).json({
        success: false,
        error: subError.message
      });
    }

    const subscriptionIds = subscriptionData.map(
      sub => sub.paypal_subscription_id
    );

    if (subscriptionIds.length === 0) {
      return res.json({
        success: true,
        payments: []
      });
    }

    // Get payments for those subscriptions
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .in("paypal_subscription_id", subscriptionIds)
      .order("created_at", { ascending: false });

    if (paymentError) {
      return res.status(400).json({
        success: false,
        error: paymentError.message
      });
    }

    res.json({
      success: true,
      payments: paymentData
    });

  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get dashboard data (combined profile, subscription, and tier info)
router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Fetch profile (gracefully handle missing profile)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // If profile doesn't exist, create a default one
    let profile = profileData;
    if (profileError || !profileData) {
      // Try to create a default profile
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([{ id: userId, email: "", full_name: "", avatar_url: null, bio: "" }])
        .select()
        .single();

      if (createError && createError.code !== "23505") {
        // 23505 is unique constraint violation (profile already exists)
        console.error("Error creating profile:", createError);
      }

      profile = newProfile || {
        id: userId,
        email: "",
        full_name: "",
        avatar_url: null,
        bio: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Fetch subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (subscriptionError) {
      return res.status(400).json({
        success: false,
        error: subscriptionError.message
      });
    }

    const subscription = subscriptionData && subscriptionData.length > 0
      ? subscriptionData[0]
      : null;

    // Fetch all tiers
    const { data: tiersData, error: tiersError } = await supabase
      .from("membership_tiers")
      .select("*")
      .order("price", { ascending: true });

    if (tiersError) {
      return res.status(400).json({
        success: false,
        error: tiersError.message
      });
    }

    res.json({
      success: true,
      dashboard: {
        profile: profile,
        subscription: subscription,
        is_subscribed: subscription?.status === "active",
        membership_tiers: tiersData
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get member count (for analytics/display)
router.get("/stats/active-members", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact" })
      .eq("status", "active");

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      active_members: data?.length || 0
    });

  } catch (error) {
    console.error("Error fetching member stats:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


export default router;
