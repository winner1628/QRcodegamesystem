
// Replace with your Supabase project credentials
const supabaseUrl = "https://vphihqysgdhdnuszybib.supabase.co";
const supabaseKey = "sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS";

// Initialize Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Database manager (global)
window.dbManager = {
    client: supabase,
    initialized: true,
    init: async function() {
        // No additional init needed for basic use
        this.initialized = true;
        return true;
    }
};
