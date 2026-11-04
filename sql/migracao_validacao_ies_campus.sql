-- =========================================================
-- SIA
-- VALIDAÇÃO CAMPUS X INSTITUIÇÃO
--
-- Impede que uma instituição cadastre como seu campus
-- um local cujo nome identifica claramente outra IES.
-- =========================================================

BEGIN;


-- =========================================================
-- FUNÇÃO DE NORMALIZAÇÃO
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
-- FUNÇÃO DE VALIDAÇÃO
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
    -- VERIFICAR SE O NOME DO CAMPUS IDENTIFICA OUTRA IES
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

        AND
        (

            -- Nome igual ao de outra instituição
            sia_normalizar_texto(
                NEW.nome
            )
            =
            sia_normalizar_texto(
                u.nome
            )


            OR


            -- Nome da outra instituição dentro do nome
            -- informado para o campus
            (
                LENGTH(
                    sia_normalizar_texto(
                        u.nome
                    )
                ) >= 5

                AND

                sia_normalizar_texto(
                    NEW.nome
                )
                LIKE
                    '%' ||
                    sia_normalizar_texto(
                        u.nome
                    ) ||
                    '%'
            )


            OR


            -- Sigla de outra IES
            (
                u.sigla IS NOT NULL

                AND LENGTH(
                    sia_normalizar_texto(
                        u.sigla
                    )
                ) >= 3

                AND
                (
                    ' ' ||
                    sia_normalizar_texto(
                        NEW.nome
                    ) ||
                    ' '
                )
                LIKE
                (
                    '% ' ||
                    sia_normalizar_texto(
                        u.sigla
                    ) ||
                    ' %'
                )
            )

        )

    LIMIT 1;


    -- =====================================================
    -- BLOQUEAR
    -- =====================================================

    IF FOUND
    THEN

        RAISE EXCEPTION
            'O campus informado pertence ou faz referência a outra instituição: %',
            instituicao_conflitante.nome

        USING
            ERRCODE =
                '23514';

    END IF;


    RETURN NEW;

END;

$$;


-- =========================================================
-- TRIGGER
-- =========================================================

DROP TRIGGER IF EXISTS
    trg_validar_campus_instituicao

ON campus;


CREATE TRIGGER
    trg_validar_campus_instituicao

BEFORE INSERT OR UPDATE OF
    universidade_id,
    nome

ON campus

FOR EACH ROW

EXECUTE FUNCTION
    sia_validar_campus_instituicao();


-- =========================================================
-- IDENTIFICAR CAMPI JÁ CADASTRADOS ERRONEAMENTE
-- =========================================================

CREATE TEMP TABLE
    tmp_campi_conflitantes

ON COMMIT DROP

AS

SELECT DISTINCT

    c.id

FROM campus c

INNER JOIN universidade outra
    ON outra.id <>
        c.universidade_id

    AND outra.ativo =
        TRUE

WHERE

    sia_normalizar_texto(
        c.nome
    )
    =
    sia_normalizar_texto(
        outra.nome
    )


    OR


    (
        LENGTH(
            sia_normalizar_texto(
                outra.nome
            )
        ) >= 5

        AND

        sia_normalizar_texto(
            c.nome
        )
        LIKE
        (
            '%' ||
            sia_normalizar_texto(
                outra.nome
            ) ||
            '%'
        )
    )


    OR


    (
        outra.sigla IS NOT NULL

        AND LENGTH(
            sia_normalizar_texto(
                outra.sigla
            )
        ) >= 3

        AND
        (
            ' ' ||
            sia_normalizar_texto(
                c.nome
            ) ||
            ' '
        )
        LIKE
        (
            '% ' ||
            sia_normalizar_texto(
                outra.sigla
            ) ||
            ' %'
        )
    );


-- =========================================================
-- DESATIVAR VÍNCULOS COM CURSOS
-- =========================================================

UPDATE curso_campus

SET
    ativo =
        FALSE,

    atualizado_em =
        NOW()

WHERE
    campus_id IN
    (
        SELECT id

        FROM
            tmp_campi_conflitantes
    );


-- =========================================================
-- COMPATIBILIDADE COM COLUNA ANTIGA curso.campus_id
-- =========================================================

UPDATE curso

SET
    campus_id =
        NULL

WHERE
    campus_id IN
    (
        SELECT id

        FROM
            tmp_campi_conflitantes
    );


-- =========================================================
-- DESATIVAR CAMPUS CADASTRADO NA IES ERRADA
-- =========================================================

UPDATE campus

SET
    ativo =
        FALSE,

    principal =
        FALSE,

    atualizado_em =
        NOW()

WHERE
    id IN
    (
        SELECT id

        FROM
            tmp_campi_conflitantes
    );


COMMIT;