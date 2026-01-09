/**
 * Supabase Client Configuration
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Create a single supabase client for interacting with your database
const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

module.exports = supabase;