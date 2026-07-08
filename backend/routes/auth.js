import express from "express";
import { supabase } from "../services/supabase.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) throw error;

    res.json({ success: true, user: data.user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({ success: true, session: data.session, user: data.user });
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
