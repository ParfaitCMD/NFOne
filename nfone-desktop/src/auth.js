const SUPABASE_URL = "https://jdvfjlljafzkrygoilky.supabase.co";
const SUPABASE_KEY = "sb_publishable_aNZJrOUM2MZQAxLnqwJ5pg_Ozb2LVBE";

// Validamos se a biblioteca do Supabase conseguiu carregar pelo HTML antes de inicializar.
// Se a internet atrasar, isso evita que o main.js exploda.
export const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        detectSessionInUrl: false,
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
