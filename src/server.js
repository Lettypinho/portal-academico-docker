const express =
    require("express");

const session =
    require("express-session");

const path =
    require("path");


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
// ARQUIVOS DO FRONTEND
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
// ROTAS
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
    "/api/universidades",
    universidadesRoutes
);


app.use(
    "/api/cursos",
    cursosRoutes
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


// =========================================================
// TESTE DA API
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