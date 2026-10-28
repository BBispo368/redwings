/**
 * GET /sitemap.xml — página inicial + todos os artigos publicados.
 */
const { escapeHtml, urlBase, consultarSupabase } = require('./_lib');

module.exports = async (req, res) => {
  const base = urlBase(req);
  let artigos = [];

  try {
    artigos = await consultarSupabase(
      'artigos?select=slug,updated_at,created_at&publicado=eq.true&order=created_at.desc&limit=5000'
    );
  } catch (erro) {
    console.error('[api/sitemap] Falha ao consultar Supabase:', erro.message);
  }

  const urls = [
    `  <url><loc>${escapeHtml(base)}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    ...artigos.map((a) => {
      const data = (a.updated_at || a.created_at || '').slice(0, 10);
      return `  <url><loc>${escapeHtml(`${base}/artigo/${encodeURIComponent(a.slug)}`)}</loc>${data ? `<lastmod>${data}</lastmod>` : ''}<priority>0.7</priority></url>`;
    }),
  ];

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  );
};
