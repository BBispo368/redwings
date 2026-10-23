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

-- 4. Políticas de Segurança (RLS)
-- Leitura pública (SELECT): Aberta para visitantes anônimos e autenticados, apenas para artigos publicados.
DROP POLICY IF EXISTS "Leitura pública de artigos publicados" ON public.artigos;
CREATE POLICY "Leitura pública de artigos publicados"
    ON public.artigos
    FOR SELECT
    USING (publicado = true OR auth.role() = 'authenticated');

-- Inserção (INSERT): Exclusiva para usuários autenticados (administradores logados no painel)
DROP POLICY IF EXISTS "Usuários autenticados podem criar artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem criar artigos"
    ON public.artigos
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- Atualização (UPDATE): Exclusiva para usuários autenticados
DROP POLICY IF EXISTS "Usuários autenticados podem editar artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem editar artigos"
    ON public.artigos
    FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Exclusão (DELETE): Exclusiva para usuários autenticados
DROP POLICY IF EXISTS "Usuários autenticados podem excluir artigos" ON public.artigos;
CREATE POLICY "Usuários autenticados podem excluir artigos"
    ON public.artigos
    FOR DELETE
    TO authenticated
    USING (auth.role() = 'authenticated');


-- ==============================================================================
-- 5. CONFIGURAÇÃO DO BUCKET DE STORAGE ('artigos-midia')
-- ==============================================================================

-- Criar o bucket público se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('artigos-midia', 'artigos-midia', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para o bucket 'artigos-midia'
-- Permitir visualização pública de qualquer imagem dentro do bucket
DROP POLICY IF EXISTS "Visualização pública de mídias" ON storage.objects;
CREATE POLICY "Visualização pública de mídias"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'artigos-midia');

-- Permitir upload de imagens apenas para administradores autenticados
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de mídias"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'artigos-midia' AND auth.role() = 'authenticated');

-- Permitir atualização de mídias para administradores autenticados
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem atualizar mídias"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'artigos-midia' AND auth.role() = 'authenticated');

-- Permitir exclusão de mídias para administradores autenticados
DROP POLICY IF EXISTS "Usuários autenticados podem excluir mídias" ON storage.objects;
CREATE POLICY "Usuários autenticados podem excluir mídias"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'artigos-midia' AND auth.role() = 'authenticated');
