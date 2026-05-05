const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
	supabaseUrl,
	supabaseServiceRoleKey || supabaseAnonKey,
	supabaseServiceRoleKey
		? { auth: { autoRefreshToken: false, persistSession: false } }
		: undefined
);

module.exports = supabase;
