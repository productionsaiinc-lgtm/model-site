import express from "express";
import { supabase } from "../services/supabase.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      console.error('Supabase signup error:', error);
      throw error;
    }

    // Create profile for the new user
    const userId = data.user.id;
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          email: email,
          full_name: "",
          avatar_url: null,
          bio: "",
          membership_tier: "free"
        }
      ]);

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Don't throw - user auth was successful, profile creation is secondary
    }

    res.json({ success: true, user: { ...data.user, membership_tier: "free" } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      throw error;
    }

    // Fetch profile with membership tier
    const userId = data.user.id;
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, membership_tier")
      .eq("id", userId)
      .single();

    let membershipTier = "free";
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            email: email,
            full_name: "",
            avatar_url: null,
            bio: "",
            membership_tier: "free"
          }
        ]);

      if (profileError) {
        console.error("Error creating profile on login:", profileError);
      }
    } else if (existingProfile.membership_tier) {
      membershipTier = existingProfile.membership_tier;
    }

    res.json({ success: true, session: data.session, user: { ...data.user, membership_tier: membershipTier } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get("/user/:id", async (req, res) => {
  const { data, error } = await supabase.auth.admin.getUserById(req.params.id);

  if (error) return res.status(400).json({ success: false, error: error.message });

  res.json({ success: true, user: data.user });
});

export default router;
