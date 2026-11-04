BEGIN;

ALTER TABLE campus
ADD COLUMN IF NOT EXISTS status_aprovacao VARCHAR(20);

ALTER TABLE campus
ADD COLUMN IF NOT EXISTS solicitado_por INT;

ALTER TABLE campus
ADD COLUMN IF NOT EXISTS solicitado_em TIMESTAMPTZ;

ALTER TABLE campus
ADD COLUMN IF NOT EXISTS aprovado_por INT;

ALTER TABLE campus
ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ;

ALTER TABLE campus
ADD COLUMN IF NOT EXISTS rejeitado_por INT;

ALTER TABLE campus
ADD COLUMN IF NOT EXISTS rejeitado_em TIMESTAMPTZ;

ALTER TABLE campus
ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;


-- Campi existentes continuam válidos.
UPDATE campus

SET
    status_aprovacao = 'aprovado',
    aprovado_em = COALESCE(
        aprovado_em,
        criado_em,
        NOW()
    )

WHERE
    status_aprovacao IS NULL;


ALTER TABLE campus
ALTER COLUMN status_aprovacao
SET DEFAULT 'aprovado';


ALTER TABLE campus
ALTER COLUMN status_aprovacao
SET NOT NULL;


DO $$

BEGIN

    IF NOT EXISTS
    (
        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'chk_campus_status_aprovacao'
    )
    THEN

        ALTER TABLE campus

        ADD CONSTRAINT
            chk_campus_status_aprovacao

        CHECK
        (
            status_aprovacao IN
            (
                'pendente',
                'aprovado',
                'rejeitado',
                'excluido'
            )
        );

    END IF;

END

$$;


DO $$

BEGIN

    IF NOT EXISTS
    (
        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'fk_campus_solicitado_por'
    )
    THEN

        ALTER TABLE campus

        ADD CONSTRAINT
            fk_campus_solicitado_por

        FOREIGN KEY
        (
            solicitado_por
        )

        REFERENCES usuario(id)

        ON DELETE SET NULL;

    END IF;

END

$$;


DO $$

BEGIN

    IF NOT EXISTS
    (
        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'fk_campus_aprovado_por'
    )
    THEN

        ALTER TABLE campus

        ADD CONSTRAINT
            fk_campus_aprovado_por

        FOREIGN KEY
        (
            aprovado_por
        )

        REFERENCES usuario(id)

        ON DELETE SET NULL;

    END IF;

END

$$;


DO $$

BEGIN

    IF NOT EXISTS
    (
        SELECT 1

        FROM pg_constraint

        WHERE conname =
            'fk_campus_rejeitado_por'
    )
    THEN

        ALTER TABLE campus

        ADD CONSTRAINT
            fk_campus_rejeitado_por

        FOREIGN KEY
        (
            rejeitado_por
        )

        REFERENCES usuario(id)

        ON DELETE SET NULL;

    END IF;

END

$$;


CREATE INDEX IF NOT EXISTS
    idx_campus_status_aprovacao

ON campus
(
    status_aprovacao
);


CREATE INDEX IF NOT EXISTS
    idx_campus_universidade_status

ON campus
(
    universidade_id,
    status_aprovacao
);


COMMIT;