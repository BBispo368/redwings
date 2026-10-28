/**
 * GET /robots.txt — bloqueia o painel e aponta o sitemap com URL absoluta.
 */
const { urlBase } = require('./_lib');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${urlBase(req)}/sitemap.xml\n`);
};
