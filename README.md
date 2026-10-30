🌐 **English** | [Português](README.pt-BR.md)

# RedWings Adventure — Website & CMS

> Marketing website with a custom content management system for a trail-running and mountain-race training program.

**Live site:** https://redwings-five.vercel.app

The client needed a fast, good-looking site to sell their training program, plus a way to publish articles and race events themselves — without paying for WordPress hosting or depending on a developer for every update.

## Features

**Public site**
- Responsive landing page with parallax hero, scroll animations and a mobile side menu
- Articles section with server-rendered pages per article (`/artigo/:slug`) for proper SEO and social sharing previews
- Events / races calendar with cover banners
- Auto-generated `sitemap.xml` and `robots.txt`

**Admin panel (`/admin`)**
- Secure login restricted to an allow-list of admins (Supabase Auth + `admins` table)
- Create, edit and publish articles and events
- Image upload to Supabase Storage, organized by folder

**Performance & security**
- Tailwind CSS compiled at build time (no CDN runtime)
- Optimized images (AVIF/JPG) with long-lived cache headers
- Security headers on every response: HSTS, `X-Frame-Options: DENY`, `nosniff`, strict referrer and permissions policies
- Admin pages excluded from search engines (`X-Robots-Tag: noindex`)
- Row Level Security on all tables and storage buckets
- HTML escaping on all server-rendered content

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, vanilla JavaScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Server-side rendering | Vercel Serverless Functions (Node.js) |
| Hosting | Vercel |

## Project structure

```
├── index.html               # Public landing page
├── artigo.html              # Article template (rendered by api/artigo.js)
├── admin/                   # CMS: login + dashboard
├── api/
│   ├── artigo.js            # SSR for each article (SEO / Open Graph)
│   ├── sitemap.js           # Dynamic sitemap.xml
│   ├── robots.js            # robots.txt
│   └── _lib.js              # Shared helpers
├── assets/js/site-config.js # Single config file — reuse the system for another client
├── supabase-schema.sql      # Tables (artigos, eventos, admins) + RLS policies
└── vercel.json              # Rewrites, redirects, security headers
```

## Reusable by design

All client-specific content lives in `assets/js/site-config.js` (name, description, Supabase project) and `tailwind.config.js` (brand colors). Spinning up the same site + CMS for a new client means editing those two files and running the SQL schema on a new Supabase project.

## Running locally

```bash
npm install
npm run build:css
npx vercel dev
```

## Author

**Breno Bispo** — IT Support & Automation
[LinkedIn](https://www.linkedin.com/in/breno-bispo-5745411a8/) · [Portfolio / CV](https://bbispo368.github.io/desenvolve-introducao-web/CV/CV)
