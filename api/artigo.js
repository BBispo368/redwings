/**
 * GET /artigo/:slug
 * Entrega artigo.html com título, descrição, Open Graph e JSON-LD já preenchidos,
 * para que Google e prévias de link (WhatsApp, Instagram, Facebook) leiam os dados
 * sem executar JavaScript. O conteúdo em si continua sendo renderizado no navegador.
 */
const fs = require('fs');
const path = require('path');
const { SITE_CONFIG, escapeHtml, urlBase, consultarSupabase } = require('./_lib');

const TEMPLATE = fs.readFileSync(path.join(process.cwd(), 'artigo.html'), 'utf8');

module.exports = async (req, res) => {
  const slug = String(req.query.slug || '').trim();
  const base = urlBase(req);
  let artigo = null;

  if (slug) {
    try {
      const campos = 'titulo,slug,resumo,imagem_capa_url,autor,categoria,created_at,updated_at';
      const linhas = await consultarSupabase(
        `artigos?select=${campos}&publicado=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`
      );
      artigo = linhas[0] || null;
    } catch (erro) {
      console.error('[api/artigo] Falha ao consultar Supabase:', erro.message);
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!artigo) {
    // Página de erro do próprio template (o script do cliente exibe "não encontrado")
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    res.status(404).send(TEMPLATE);
    return;
  }

  const titulo = `${artigo.titulo} — ${SITE_CONFIG.nome}`;
  const descricao = artigo.resumo || SITE_CONFIG.descricao;
  const urlCanonica = `${base}/artigo/${encodeURIComponent(artigo.slug)}`;
  const imagem = artigo.imagem_capa_url || `${base}${SITE_CONFIG.imagemPadrao}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: artigo.titulo,
    description: descricao,
    image: [imagem],
    datePublished: artigo.created_at,
    dateModified: artigo.updated_at || artigo.created_at,
    author: { '@type': 'Organization', name: artigo.autor || SITE_CONFIG.autorPadrao },
    publisher: { '@type': 'Organization', name: SITE_CONFIG.nome },
    mainEntityOfPage: urlCanonica,
  };

  const metas = `
  <link rel="canonical" href="${escapeHtml(urlCanonica)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${escapeHtml(SITE_CONFIG.nome)}" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:title" content="${escapeHtml(artigo.titulo)}" />
  <meta property="og:description" content="${escapeHtml(descricao)}" />
  <meta property="og:url" content="${escapeHtml(urlCanonica)}" />
  <meta property="og:image" content="${escapeHtml(imagem)}" />
  <meta property="article:published_time" content="${escapeHtml(artigo.created_at)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(artigo.titulo)}" />
  <meta name="twitter:description" content="${escapeHtml(descricao)}" />
  <meta name="twitter:image" content="${escapeHtml(imagem)}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>`;

  const html = TEMPLATE
    .replace(/<title id="meta-titulo">[\s\S]*?<\/title>/, `<title id="meta-titulo">${escapeHtml(titulo)}</title>`)
    .replace(
      /<meta name="description" id="meta-descricao"[\s\S]*?\/>/,
      `<meta name="description" id="meta-descricao" content="${escapeHtml(descricao)}" />`
    )
    .replace('</head>', metas);

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  res.status(200).send(html);
};
