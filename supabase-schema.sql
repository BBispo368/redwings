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

-- 3. Habilitação de Row Level Security (RLS)
ALTER TABLE public.artigos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança (RLS) — Artigos
-- NOTA: auth.uid() IS NOT NULL é mais robusto que auth.role() = 'authenticated'
-- para clientes Supabase JS (CDN/browser), pois verifica o JWT diretamente.

DROP POLICY IF EXISTS "Leitura pública de artigos publicados" ON public.artigos;
CREATE POLICY "Leitura pública de artigos publicados"
    ON public.artigos
    FOR SELECT
    USING (publicado = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem criar artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem criar artigos"
    ON public.artigos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem editar artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem editar artigos"
    ON public.artigos
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem excluir artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem excluir artigos"
    ON public.artigos
    FOR DELETE
    TO authenticated
    USING (auth.uid() IS NOT NULL);


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
-- FIX: 'eventos' adicionado à lista de pastas para uploads de banner de evento.
-- O JS agora usa 'capas' para imagens de eventos (mais simples e já permitido).
-- ==============================================================================
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de mídias"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'artigos-midia'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] IN ('capas', 'documentos', 'eventos')
    );

-- Atualização de mídias: apenas autenticados
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem atualizar mídias"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'artigos-midia'
        AND auth.uid() IS NOT NULL
    );

-- Exclusão de mídias: apenas autenticados
DROP POLICY IF EXISTS "Usuários autenticados podem excluir mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem excluir mídias"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'artigos-midia'
        AND auth.uid() IS NOT NULL
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
-- FIX: usa auth.uid() IS NOT NULL (mais confiável no Supabase JS CDN)
-- ==============================================================================

DROP POLICY IF EXISTS "Leitura pública de eventos publicados" ON public.eventos;
CREATE POLICY "Leitura pública de eventos publicados"
    ON public.eventos
    FOR SELECT
    USING (publicado = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem criar eventos" ON public.eventos;
CREATE POLICY "Usuários autenticados podem criar eventos"
    ON public.eventos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem editar eventos" ON public.eventos;
CREATE POLICY "Usuários autenticados podem editar eventos"
    ON public.eventos
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem excluir eventos" ON public.eventos;
CREATE POLICY "Usuários autenticados podem excluir eventos"
    ON public.eventos
    FOR DELETE
    TO authenticated
    USING (auth.uid() IS NOT NULL);


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
