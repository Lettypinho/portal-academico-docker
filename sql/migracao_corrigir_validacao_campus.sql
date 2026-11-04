-- =========================================================
-- SIA
-- CORREÇÃO DA VALIDAÇÃO CAMPUS X INSTITUIÇÃO
--
-- A validação anterior era ampla demais e podia interpretar
-- palavras comuns do nome de um campus como siglas de outra
-- instituição.
--
-- Nova regra:
-- bloqueia apenas quando o nome cadastrado para o campus é
-- exatamente o nome oficial de OUTRA instituição.
-- =========================================================

BEGIN;


-- =========================================================
-- REMOVER TRIGGER ANTERIOR
-- =========================================================

DROP TRIGGER IF EXISTS
    trg_validar_campus_instituicao
ON campus;


-- =========================================================
-- REMOVER FUNÇÃO ANTERIOR
-- =========================================================

DROP FUNCTION IF EXISTS
    sia_validar_campus_instituicao();


-- =========================================================
-- MANTER FUNÇÃO DE NORMALIZAÇÃO
-- =========================================================

CREATE OR REPLACE FUNCTION
    sia_normalizar_texto(
        valor TEXT
    )

RETURNS TEXT

LANGUAGE SQL

IMMUTABLE

AS $$

    SELECT

        TRANSLATE(
            LOWER(
                TRIM(
                    COALESCE(
                        valor,
                        ''
                    )
                )
            ),

            'áàãâäéèêëíìîïóòõôöúùûüç',

            'aaaaaeeeeiiiiooooouuuuc'
        );

$$;


-- =========================================================
-- NOVA VALIDAÇÃO
-- =========================================================

CREATE OR REPLACE FUNCTION
    sia_validar_campus_instituicao()

RETURNS TRIGGER

LANGUAGE plpgsql

AS $$

DECLARE

    instituicao_conflitante
        RECORD;

BEGIN

    -- =====================================================
    -- BLOQUEAR APENAS QUANDO O NOME DO CAMPUS FOR
    -- EXATAMENTE O NOME DE OUTRA INSTITUIÇÃO
    -- =====================================================

    SELECT

        u.id,

        u.nome,

        u.sigla

    INTO
        instituicao_conflitante

    FROM universidade u

    WHERE

        u.id <>
            NEW.universidade_id

        AND u.ativo =
            TRUE

        AND sia_normalizar_texto(
            NEW.nome
        )
        =
        sia_normalizar_texto(
            u.nome
        )

    LIMIT 1;


    IF FOUND
    THEN

        RAISE EXCEPTION
            'O nome informado corresponde a outra instituição: %',
            instituicao_conflitante.nome

        USING
            ERRCODE =
                '23514';

    END IF;


    RETURN NEW;

END;

$$;


-- =========================================================
-- RECRIAR TRIGGER
-- =========================================================

CREATE TRIGGER
    trg_validar_campus_instituicao

BEFORE INSERT OR UPDATE OF
    universidade_id,
    nome

ON campus

FOR EACH ROW

EXECUTE FUNCTION
    sia_validar_campus_instituicao();


COMMIT;