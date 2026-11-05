const express =
    require("express");

const session =
    require("express-session");

const path =
    require("path");


const universidadesRoutes =
    require("./routes/universidades.routes");

const authRoutes =
    require("./routes/auth.routes");

const perfilRoutes =
    require("./routes/perfil.routes");

const solicitacoesVinculoRoutes =
    require("./routes/solicitacoes-vinculo.routes");

const cursosRoutes =
    require("./routes/cursos.routes");

const campiAprovacaoRoutes =
    require("./routes/campi-aprovacao.routes");

const campiRoutes =
    require("./routes/campi.routes");

const campiExclusaoRoutes =
    require("./routes/campi-exclusao.routes");

const indicadoresRoutes =
    require("./routes/indicadores.routes");

const indicadoresInepRoutes =
    require("./routes/indicadores-inep.routes");

const adminRoutes =
    require("./routes/admin.routes");

const adminInstituicaoRoutes =
    require("./routes/admin-instituicao.routes");

const adminAcessosRoutes =
    require("./routes/admin-acessos.routes");

const adminPermissoesRoutes =
    require("./routes/admin-permissoes.routes");

const notasCorteRoutes =
    require("./routes/notas-corte.routes");

const mapaRoutes =
    require("./routes/mapa.routes");


const app =
    express();


const PORT =
    process.env.PORT ||
    3000;


app.use(
    express.json()
);


app.use(
    session({

        secret:
            process.env.SESSION_SECRET ||
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
// ROTAS PÚBLICAS AMIGÁVEIS
// =========================================================

// Ao acessar o domínio principal,
// enviar diretamente para o login.
app.get(
    "/",

    (
        req,
        res
    ) => {

        res.redirect(
            "/login"
        );
    }
);


// Se alguém acessar a URL antiga,
// redirecionar para a URL limpa.
app.get(
    "/login",

    (
        req,
        res
    ) => {

        res.redirect(
            "/login"
        );
    }
);


// =========================================================
// CACHE
// =========================================================

app.use(
    (
        req,
        res,
        next
    ) => {

        const caminho =
            req.path
                .toLowerCase();


        if (
            caminho.endsWith(".html") ||
            caminho.endsWith(".js") ||
            caminho.endsWith(".css") ||
            !path.extname(caminho)
        ) {

            res.setHeader(
                "Cache-Control",
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            );

            res.setHeader(
                "Pragma",
                "no-cache"
            );

            res.setHeader(
                "Expires",
                "0"
            );
        }


        next();
    }
);


// =========================================================
// ARQUIVOS PÚBLICOS
//
// extensions: ["html"]
// permite:
//
// /login      -> login.html
// /cadastro   -> cadastro.html
// /dashboard  -> dashboard.html
// /explorar   -> explorar.html
// /admin      -> admin.html
// =========================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "../public"
        ),
        {
            etag:
                false,

            lastModified:
                false,

            maxAge:
                0,

            index:
                false,

            extensions: [
                "html"
            ]
        }
    )
);


// =========================================================
// API
// =========================================================

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/perfil",
    perfilRoutes
);


app.use(
    "/api/solicitacoes-vinculo",
    solicitacoesVinculoRoutes
);


app.use(
    "/api/universidades",
    universidadesRoutes
);


// IMPORTANTE:
// precisa ficar antes de campiRoutes.
app.use(
    "/api/campi",
    campiAprovacaoRoutes
);


app.use(
    "/api/campi",
    campiRoutes
);


app.use(
    "/api/campi",
    campiExclusaoRoutes
);


app.use(
    "/api/cursos",
    cursosRoutes
);


app.use(
    "/api/notas-corte",
    notasCorteRoutes
);


app.use(
    "/api/mapa",
    mapaRoutes
);


app.use(
    "/api/indicadores",
    indicadoresRoutes
);


app.use(
    "/api/indicadores-inep",
    indicadoresInepRoutes
);


app.use(
    "/api/admin",
    adminRoutes
);


app.use(
    "/api/admin-instituicao",
    adminInstituicaoRoutes
);


app.use(
    "/api/admin-acessos",
    adminAcessosRoutes
);


app.use(
    "/api/admin-permissoes",
    adminPermissoesRoutes
);


app.get(
    "/api/status",

    (
        req,
        res
    ) => {

        res.json({

            sistema:
                "SIA",

            status:
                "online"
        });
    }
);


app.listen(
    PORT,
    "0.0.0.0",

    () => {

        console.log(
            `SIA rodando na porta ${PORT}`
        );
    }
);