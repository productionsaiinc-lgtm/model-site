import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://tbglkrkcnbhajmfqchdr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_Zay_znn-dUiewSh3yEpzlA_IYlFZrns';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function upgradeUser(email) {
  try {
    console.log(`🚀 Upgrading ${email} to VIP...`);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ membership_tier: 'vip' })
      .eq('email', email)
      .select();

    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log('✅ Success! User upgraded to VIP.');
      console.log('User Data:', data[0]);
    } else {
      console.log('❌ User not found in profiles table.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

upgradeUser('productions.ai.inc@gmail.com');
