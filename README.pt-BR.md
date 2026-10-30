🌐 [English](README.md) | **Português**

# RedWings Adventure — Site e CMS

> Site institucional com um sistema de gerenciamento de conteúdo próprio para um programa de treinos de corrida de trilha e montanha.

**Site no ar:** https://redwings-five.vercel.app

O cliente precisava de um site rápido e bonito para vender o programa de treinos, e de uma forma de publicar artigos e eventos de corrida por conta própria, sem pagar hospedagem de WordPress nem depender de um desenvolvedor a cada atualização.

## Funcionalidades

**Site público**
- Página inicial responsiva com efeito parallax, animações de rolagem e menu lateral no celular
- Seção de artigos com página renderizada no servidor para cada artigo (`/artigo/:slug`), garantindo bom SEO e prévia correta ao compartilhar em redes sociais
- Agenda de eventos e corridas com banners de capa
- `sitemap.xml` e `robots.txt` gerados automaticamente

**Painel administrativo (`/admin`)**
- Login seguro, restrito a uma lista de administradores autorizados (Supabase Auth + tabela `admins`)
- Criação, edição e publicação de artigos e eventos
- Envio de imagens para o Supabase Storage, organizadas por pasta

**Desempenho e segurança**
- Tailwind CSS compilado no build (sem carregar via CDN)
- Imagens otimizadas (AVIF/JPG) com cache de longa duração
- Cabeçalhos de segurança em todas as respostas: HSTS, `X-Frame-Options: DENY`, `nosniff` e políticas restritas de referrer e permissões
- Páginas do painel fora dos buscadores (`X-Robots-Tag: noindex`)
- Row Level Security em todas as tabelas e buckets de armazenamento
- Escape de HTML em todo o conteúdo renderizado no servidor

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | HTML, JavaScript puro, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Renderização no servidor | Vercel Serverless Functions (Node.js) |
| Hospedagem | Vercel |

## Estrutura do projeto

```
├── index.html               # Página inicial pública
├── artigo.html              # Modelo de artigo (renderizado por api/artigo.js)
├── admin/                   # CMS: login + painel
├── api/
│   ├── artigo.js            # Renderização de cada artigo (SEO / Open Graph)
│   ├── sitemap.js           # sitemap.xml dinâmico
│   ├── robots.js            # robots.txt
│   └── _lib.js              # Funções compartilhadas
├── assets/js/site-config.js # Arquivo único de configuração — reaproveite o sistema para outro cliente
├── supabase-schema.sql      # Tabelas (artigos, eventos, admins) + políticas de RLS
└── vercel.json              # Rewrites, redirecionamentos e cabeçalhos de segurança
```

## Feito para ser reaproveitado

Tudo que é específico do cliente fica em `assets/js/site-config.js` (nome, descrição, projeto do Supabase) e em `tailwind.config.js` (cores da marca). Para montar o mesmo site com CMS para um novo cliente, basta editar esses dois arquivos e rodar o schema SQL em um novo projeto do Supabase.

## Como rodar localmente

```bash
npm install
npm run build:css
npx vercel dev
```

## Autor

**Breno Bispo** — Suporte de TI e Automação
[LinkedIn](https://www.linkedin.com/in/breno-bispo-5745411a8/) · [Portfólio / Currículo](https://bbispo368.github.io/desenvolve-introducao-web/CV/CV)
