import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_GGCHECKOUT_SOLO_URL':    JSON.stringify(env.VITE_GGCHECKOUT_SOLO_URL    || ''),
      'import.meta.env.VITE_GGCHECKOUT_FAMILIA_URL': JSON.stringify(env.VITE_GGCHECKOUT_FAMILIA_URL || ''),
      'import.meta.env.VITE_SUPABASE_URL':            JSON.stringify(env.VITE_SUPABASE_URL            || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY':       JSON.stringify(env.VITE_SUPABASE_ANON_KEY       || ''),
      'import.meta.env.VITE_REMOVEBG_API_KEY':        JSON.stringify(env.VITE_REMOVEBG_API_KEY        || ''),
      'import.meta.env.VITE_N8N_WEBHOOK_URL':         JSON.stringify(env.VITE_N8N_WEBHOOK_URL         || ''),
    },
  }
})
