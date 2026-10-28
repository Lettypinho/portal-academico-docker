const express =
    require("express");

const session =
    require("express-session");

const path =
    require("path");


// =========================================================
// ROTAS
// =========================================================

const universidadesRoutes =
    require(
        "./routes/universidades.routes"
    );


const authRoutes =
    require(
        "./routes/auth.routes"
    );


const perfilRoutes =
    require(
        "./routes/perfil.routes"
    );


const solicitacoesVinculoRoutes =
    require(
        "./routes/solicitacoes-vinculo.routes"
    );


const cursosRoutes =
    require(
        "./routes/cursos.routes"
    );


const indicadoresRoutes =
    require(
        "./routes/indicadores.routes"
    );


const indicadoresInepRoutes =
    require(
        "./routes/indicadores-inep.routes"
    );


const adminRoutes =
    require(
        "./routes/admin.routes"
    );


const adminInstituicaoRoutes =
    require(
        "./routes/admin-instituicao.routes"
    );


// =========================================================
// APLICAÇÃO
// =========================================================

const app =
    express();


const PORT =
    process.env.PORT ||
    3000;


// =========================================================
// MIDDLEWARES
// =========================================================

app.use(
    express.json()
);


// =========================================================
// SESSÃO
// =========================================================

app.use(
    session({

        secret:
            process.env
                .SESSION_SECRET ||
            "segredo-apenas-desenvolvimento",

        resave:
            false,

        saveUninitialized:
            false,

        cookie: {

            httpOnly:
                true,

            maxAge:
                1000 *
                60 *
                60
        }
    })
);


// =========================================================
// ARQUIVOS ESTÁTICOS DO FRONTEND
// =========================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "../public"
        )
    )
);


// =========================================================
// ROTAS DE AUTENTICAÇÃO
// =========================================================

app.use(
    "/api/auth",
    authRoutes
);


// =========================================================
// PERFIL
// =========================================================

app.use(
    "/api/perfil",
    perfilRoutes
);


// =========================================================
// SOLICITAÇÕES DE VÍNCULO
// =========================================================

app.use(
    "/api/solicitacoes-vinculo",
    solicitacoesVinculoRoutes
);


// =========================================================
// UNIVERSIDADES
// =========================================================

app.use(
    "/api/universidades",
    universidadesRoutes
);


// =========================================================
// CURSOS
// =========================================================

app.use(
    "/api/cursos",
    cursosRoutes
);


// =========================================================
// INDICADORES INSTITUCIONAIS
// =========================================================

app.use(
    "/api/indicadores",
    indicadoresRoutes
);


// =========================================================
// INDICADORES OFICIAIS DO INEP
// =========================================================

app.use(
    "/api/indicadores-inep",
    indicadoresInepRoutes
);


// =========================================================
// SUPER ADMIN
// =========================================================

app.use(
    "/api/admin",
    adminRoutes
);


// =========================================================
// ADMINISTRAÇÃO DA INSTITUIÇÃO
// =========================================================

app.use(
    "/api/admin-instituicao",
    adminInstituicaoRoutes
);


// =========================================================
// TESTE / STATUS DA API
// =========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            sistema:
                "SIA",

            status:
                "online"
        });
    }
);


// =========================================================
// SERVIDOR
// =========================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `SIA rodando na porta ${PORT}`
        );
    }
);