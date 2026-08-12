const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
// Check for all possible naming conventions for the Supabase Key
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase credentials are not set correctly in .env.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
