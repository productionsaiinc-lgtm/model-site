import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://tbglkrkcnbhajmfqchdr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_Zay_znn-dUiewSh3yEpzlA_IYlFZrns';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUser(email) {
  try {
    console.log(`🔍 Checking status for ${email}...`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    
    if (data) {
      console.log('✅ User Profile Found:');
      console.log('   - ID:', data.id);
      console.log('   - Email:', data.email);
      console.log('   - Membership Tier:', data.membership_tier);
    } else {
      console.log('❌ User not found in profiles table.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUser('productions.ai.inc@gmail.com');
