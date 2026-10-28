/**
 * Configuração central do site.
 * Para replicar o sistema para outro cliente, altere apenas este arquivo
 * (e as cores em tailwind.config.js).
 *
 * Usado no navegador (window.SITE_CONFIG) e nas funções serverless da Vercel (require).
 */
(function (root) {
  'use strict';

  const SITE_CONFIG = {
    nome: 'RedWings Adventure',
    autorPadrao: 'Red Wings Adventure',
    descricao:
      'RedWings Adventure: programa de treinos de alto desempenho para corredores de trilha e montanha. Treine, evolua e participe das maiores corridas de aventura.',
    // Domínio de produção (sem barra no final). Vazio = usa o domínio da requisição.
    urlSite: '',
    imagemPadrao: '/assets/img/hero-bg.jpg',

    supabase: {
      url: 'https://ufmqvfissunqecnohpsn.supabase.co',
      // Chave pública anônima: pode ficar exposta, a proteção real está nas políticas RLS
      anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbXF2Zmlzc3VucWVjbm9ocHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NTY0NDQsImV4cCI6MjEwODMzMjQ0NH0.zapQnT36UYY6ew63Bdfn4xCKl5bIU4Zq5OirmqUN0i8',
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
  } else {
    root.SITE_CONFIG = SITE_CONFIG;
  }
})(typeof window !== 'undefined' ? window : this);
