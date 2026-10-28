/**
 * Red Wings Adventure — Cliente Oficial Supabase via CDN
 * Biblioteca carregada previamente: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
 */

// Credenciais de Acesso ao Supabase (definidas em assets/js/site-config.js)
const SUPABASE_URL = (window.SITE_CONFIG && window.SITE_CONFIG.supabase.url) || '';
const SUPABASE_ANON_KEY = (window.SITE_CONFIG && window.SITE_CONFIG.supabase.anonKey) || '';

/**
 * Inicialização do cliente Supabase e disponibilização no escopo global (window.supabaseClient)
 */
(function () {
  'use strict';

  // Validação: está configurado se não for vazio e não for o texto padrão original
  const credenciaisConfiguradas = Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== 'SUA_SUPABASE_URL_AQUI' &&
    SUPABASE_ANON_KEY !== 'SUA_SUPABASE_ANON_KEY_AQUI' &&
    SUPABASE_URL.startsWith('http')
  );

  let client = null;

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    if (credenciaisConfiguradas) {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } else {
      console.warn(
        '[RedWings CMS] Atenção: As credenciais do Supabase ainda não foram preenchidas em "assets/js/supabase-client.js".'
      );
    }
  } else {
    console.error(
      '[RedWings CMS] Erro: A biblioteca supabase-js não foi carregada antes deste script.'
    );
  }

  // Exportação para o escopo global
  window.supabaseClient = client;
  window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    configurado: credenciaisConfiguradas,
  };
})();
