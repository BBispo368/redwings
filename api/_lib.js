/**
 * Utilitários compartilhados pelas funções serverless (Vercel).
 */
const SITE_CONFIG = require('../assets/js/site-config.js');

const SUPABASE_URL = process.env.SUPABASE_URL || SITE_CONFIG.supabase.url;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || SITE_CONFIG.supabase.anonKey;

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// URL base do site: config > domínio da requisição
function urlBase(req) {
  if (SITE_CONFIG.urlSite) return SITE_CONFIG.urlSite.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocolo = req.headers['x-forwarded-proto'] || 'https';
  return `${protocolo}://${host}`;
}

// Consulta a API REST do Supabase com a chave anon (RLS só libera conteúdo publicado)
async function consultarSupabase(caminho) {
  const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!resposta.ok) throw new Error(`Supabase respondeu ${resposta.status}`);
  return resposta.json();
}

module.exports = { SITE_CONFIG, escapeHtml, urlBase, consultarSupabase };
