-- ==============================================================================
-- RED WINGS ADVENTURE — ESQUEMA SQL SUPABASE (CMS HEADLESS)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase.
-- Ele cria a tabela de 'artigos', ativa o Row Level Security (RLS) com políticas
-- de segurança e configura o bucket de Storage público 'artigos-midia'.
-- ==============================================================================

-- 1. Habilitar extensão para geração de UUID caso não esteja ativa
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criação da Tabela de Artigos
CREATE TABLE IF NOT EXISTS public.artigos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    resumo TEXT,
    conteudo TEXT NOT NULL,
    imagem_capa_url TEXT,
    categoria TEXT DEFAULT 'Notícias',
    publicado BOOLEAN DEFAULT TRUE,
    autor TEXT DEFAULT 'Red Wings Adventure',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários das Colunas
COMMENT ON TABLE public.artigos IS 'Tabela de artigos e notícias da Red Wings Adventure';
COMMENT ON COLUMN public.artigos.id IS 'Identificador único do artigo (UUID)';
COMMENT ON COLUMN public.artigos.titulo IS 'Título principal da publicação';
COMMENT ON COLUMN public.artigos.slug IS 'Slug amigável para URLs amigáveis (ex: expedicao-montanha-2026)';
COMMENT ON COLUMN public.artigos.resumo IS 'Breve introdução ou subtítulo do artigo';
COMMENT ON COLUMN public.artigos.conteudo IS 'Corpo completo do artigo em HTML ou Markdown';
COMMENT ON COLUMN public.artigos.imagem_capa_url IS 'URL pública da imagem de capa armazenada no Storage';
COMMENT ON COLUMN public.artigos.categoria IS 'Categoria do artigo (ex: Notícias, Expedição, Equipamentos, Treinamento)';
COMMENT ON COLUMN public.artigos.publicado IS 'Status de visibilidade pública (true = publicado, false = rascunho)';
COMMENT ON COLUMN public.artigos.autor IS 'Nome do autor ou entidade responsável pela publicação';

-- Trigger para atualizar automaticamente a coluna updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_artigos_updated_at ON public.artigos;
CREATE TRIGGER trigger_set_artigos_updated_at
    BEFORE UPDATE ON public.artigos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 2.1 Tabela de Administradores do CMS
-- Somente usuários listados aqui podem criar/editar/excluir conteúdo.
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Cada usuário só enxerga a própria linha (usado pelo painel para checar permissão).
-- Não há políticas de INSERT/UPDATE/DELETE: admins são gerenciados apenas pelo SQL Editor.
DROP POLICY IF EXISTS "Usuário vê o próprio registro de admin" ON public.admins;
CREATE POLICY "Usuário vê o próprio registro de admin"
    ON public.admins
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Função auxiliar usada pelas políticas (SECURITY DEFINER evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Para cadastrar um administrador (rode após criar o usuário em Authentication > Users):
--   INSERT INTO public.admins (user_id)
--   SELECT id FROM auth.users WHERE email = 'email-do-admin@exemplo.com'
--   ON CONFLICT DO NOTHING;
--
-- IMPORTANTE: desative também o cadastro público em
--   Authentication > Sign In / Providers > "Allow new users to sign up" = OFF

-- 3. Habilitação de Row Level Security (RLS)
ALTER TABLE public.artigos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança (RLS) — Artigos
-- SEGURANÇA: escrita restrita a usuários cadastrados em public.admins.
-- Apenas "estar logado" NÃO basta: a chave anon é pública e qualquer pessoa
-- poderia criar uma conta via API se o signup estiver habilitado.

DROP POLICY IF EXISTS "Leitura pública de artigos publicados" ON public.artigos;
CREATE POLICY "Leitura pública de artigos publicados"
    ON public.artigos
    FOR SELECT
    USING (publicado = true OR public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem criar artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem criar artigos"
    ON public.artigos
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem editar artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem editar artigos"
    ON public.artigos
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem excluir artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem excluir artigos"
    ON public.artigos
    FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- 5. CONFIGURAÇÃO DO BUCKET DE STORAGE ('artigos-midia')
-- ==============================================================================

-- Criar o bucket público se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('artigos-midia', 'artigos-midia', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Leitura pública: qualquer um pode visualizar arquivos no bucket
DROP POLICY IF EXISTS "Visualização pública de mídias" ON storage.objects;
CREATE POLICY "Visualização pública de mídias"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'artigos-midia');

-- ==============================================================================
-- UPLOAD (INSERT): pastas autorizadas: capas, documentos, eventos
-- Somente administradores podem enviar, atualizar ou excluir mídias.
-- ==============================================================================
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de mídias"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'artigos-midia'
        AND public.is_admin()
        AND (storage.foldername(name))[1] IN ('capas', 'documentos', 'eventos')
    );

-- Atualização de mídias: apenas administradores
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem atualizar mídias"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'artigos-midia'
        AND public.is_admin()
    );

-- Exclusão de mídias: apenas administradores
DROP POLICY IF EXISTS "Usuários autenticados podem excluir mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem excluir mídias"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'artigos-midia'
        AND public.is_admin()
    );


-- ==============================================================================
-- 6. CRIAÇÃO DA TABELA DE EVENTOS / CORRIDAS / PROVAS (CMS REDWINGS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    distancia TEXT,
    data_inicio DATE NOT NULL,
    horario_largada TIME,
    local TEXT NOT NULL,
    estado TEXT,
    descricao TEXT NOT NULL,
    imagem_url TEXT,
    link_inscricao TEXT,
    link_site TEXT,
    organizacao TEXT,
    dificuldade TEXT,
    altimetria TEXT,
    preco TEXT,
    vagas INTEGER,
    destaque BOOLEAN DEFAULT FALSE,
    publicado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.eventos IS 'Tabela de corridas, provas, maratonas e expedições do RedWings Adventure';

-- Trigger para atualizar automaticamente a coluna updated_at na tabela eventos
DROP TRIGGER IF EXISTS trigger_set_eventos_updated_at ON public.eventos;
CREATE TRIGGER trigger_set_eventos_updated_at
    BEFORE UPDATE ON public.eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Habilitação de Row Level Security (RLS) para eventos
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS RLS PARA EVENTOS
-- Escrita restrita a administradores (public.is_admin())
-- ==============================================================================

DROP POLICY IF EXISTS "Leitura pública de eventos publicados" ON public.eventos;
CREATE POLICY "Leitura pública de eventos publicados"
    ON public.eventos
    FOR SELECT
    USING (publicado = true OR public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem criar eventos" ON public.eventos;
CREATE POLICY "Usuários autenticados podem criar eventos"
    ON public.eventos
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem editar eventos" ON public.eventos;
CREATE POLICY "Usuários autenticados podem editar eventos"
    ON public.eventos
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Usuários autenticados podem excluir eventos" ON public.eventos;
CREATE POLICY "Usuários autenticados podem excluir eventos"
    ON public.eventos
    FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- 7. ANEXAÇÃO DE DOCUMENTOS (PDF, WORD, PLANILHAS) PARA ARTIGOS E EVENTOS
-- ==============================================================================

-- Adiciona coluna de documentos em artigos (se ainda não existir)
ALTER TABLE public.artigos ADD COLUMN IF NOT EXISTS documentos JSONB DEFAULT '[]'::jsonb;
COMMENT ON COLUMN public.artigos.documentos IS 'Lista de documentos e arquivos anexos para download (JSON: [{nome, url, tipo, tamanho}])';

-- Adiciona coluna de documentos em eventos (se ainda não existir)
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS documentos JSONB DEFAULT '[]'::jsonb;
COMMENT ON COLUMN public.eventos.documentos IS 'Lista de instruções, regulamentos e anexos da corrida (JSON: [{nome, url, tipo, tamanho}])';


-- ==============================================================================
-- NOTA: Para restringir tipos MIME no bucket via Dashboard do Supabase:
-- Storage > artigos-midia > Edit bucket > Allowed MIME types:
--   image/jpeg, image/png, image/webp, image/avif, image/gif,
--   application/pdf, application/msword,
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--   application/vnd.ms-excel,
--   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
--   text/csv, text/plain,
--   application/zip, application/x-zip-compressed
-- Max file size (bytes): 26214400  (= 25 MB para documentos / 5 MB para imagens
--   é controlado no código JS — o Supabase aplica o limite máximo global)
-- ==============================================================================
