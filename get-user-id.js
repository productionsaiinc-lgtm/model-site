import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://tbglkrkcnbhajmfqchdr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_Zay_znn-dUiewSh3yEpzlA_IYlFZrns';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUserId(email) {
  try {
    // 1. Try to find in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profile) {
      console.log(profile.id);
      return;
    }

    // 2. If not in profiles, try to find in auth.users (requires service role key)
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;

    const user = users.find(u => u.email === email);
    if (user) {
      console.log(user.id);
    } else {
      console.error('User not found in profiles or auth.users');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getUserId('productions.ai.inc@gmail.com');
