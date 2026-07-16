import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://tbglkrkcnbhajmfqchdr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_Zay_znn-dUiewSh3yEpzlA_IYlFZrns';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAuthUsers() {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email })), null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAuthUsers();
