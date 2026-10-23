/**
 * Red Wings Adventure — Cliente Oficial Supabase via CDN
 * Biblioteca carregada previamente: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
 */

// Credenciais de Acesso ao Supabase
const SUPABASE_URL = 'https://ufmqvfissunqecnohpsn.supabase.co';
// Chave pública anônima (JWT anon ou nova chave publishable do Supabase)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbXF2Zmlzc3VucWVjbm9ocHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NTY0NDQsImV4cCI6MjEwODMzMjQ0NH0.zapQnT36UYY6ew63Bdfn4xCKl5bIU4Zq5OirmqUN0i8';

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
