-- =========================================================
-- SIA - Sistema de Indicadores Acadêmicos
-- =========================================================
--
-- ARQUIVO LEGADO DE SEED
--
-- Os dados fictícios antigos utilizados durante o
-- desenvolvimento inicial do SIA foram removidos.
--
-- NÃO adicionar instituições fictícias neste arquivo.
--
-- A base atual utiliza:
--
-- 1. Instituições de Educação Superior do Censo 2024/Inep
-- 2. Cursos de graduação do Censo 2024/Inep
-- 3. Dados acadêmicos demonstrativos identificados
--    explicitamente como não oficiais.
--
-- =========================================================


-- =========================================================
-- ORDEM DE PREPARAÇÃO DA BASE EXISTENTE
-- =========================================================
--
-- 1. migracao_ies_cursos.sql
--
-- 2. instituicoes_brasil.sql
--
-- 3. cursos_brasil.sql
--
-- 4. indicadores_sia.sql
--
-- 5. dados_demonstracao_sia.sql
--
-- 6. remover_universidades_teste.sql
--
-- =========================================================


-- Este arquivo não realiza INSERTs.
--
-- Ele permanece no projeto apenas para evitar que scripts
-- ou documentação antigos recriem os dados fictícios
-- utilizados nas primeiras versões do SIA.


SELECT
    'Seed legado desativado. Utilize a base Inep e os arquivos atuais do SIA.'
    AS mensagem;