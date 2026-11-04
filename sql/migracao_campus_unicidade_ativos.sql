-- =========================================================
-- SIA
-- UNICIDADE DE CAMPI ATIVOS
--
-- Permite reutilizar o nome de um campus que foi excluído
-- logicamente.
--
-- A unicidade passa a valer somente para campi ativos.
-- =========================================================

BEGIN;


-- =========================================================
-- REMOVER RESTRIÇÃO ANTIGA
--
-- Antes:
-- UNIQUE (universidade_id, nome)
--
-- Isso também considerava campi inativos.
-- =========================================================

ALTER TABLE campus

DROP CONSTRAINT IF EXISTS
    uq_campus_nome;


-- =========================================================
-- REMOVER ÍNDICE CASO JÁ EXISTA
-- =========================================================

DROP INDEX IF EXISTS
    uq_campus_nome_ativo;


-- =========================================================
-- NOVA REGRA
--
-- Não pode haver dois campi ATIVOS com o mesmo nome
-- dentro da mesma instituição.
--
-- Campi inativos permanecem como histórico.
-- =========================================================

CREATE UNIQUE INDEX
    uq_campus_nome_ativo

ON campus
(
    universidade_id,
    LOWER(
        TRIM(
            nome
        )
    )
)

WHERE
    ativo = TRUE;


COMMIT;