const express =
    require("express");


const router =
    express.Router();


// =========================================================
// CONFIGURAÇÕES
// =========================================================

const OPENROUTESERVICE_URL =
    "https://api.heigit.org/openrouteservice/v2/directions";

const NOMINATIM_URL =
    "https://nominatim.openstreetmap.org/search";


const NOMINATIM_USER_AGENT =
    process.env.NOMINATIM_USER_AGENT ||
    "SIA-Sistema-de-Indicadores-Academicos/1.0";


// =========================================================
// CACHE DO NOMINATIM
//
// Evita consultar repetidamente o mesmo endereço.
// =========================================================

const cacheGeocodificacao =
    new Map();


const CACHE_TEMPO =
    1000 *
    60 *
    60 *
    24;


const CACHE_MAXIMO =
    200;


// =========================================================
// CONTROLE DE 1 REQUISIÇÃO POR SEGUNDO
// NOMINATIM
// =========================================================

let ultimaConsultaNominatim =
    0;

let filaNominatim =
    Promise.resolve();


function esperar(
    milissegundos
) {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                milissegundos
            );
        }
    );
}


async function executarComLimiteNominatim(
    funcao
) {

    const tarefa =
        filaNominatim
            .then(
                async () => {

                    const agora =
                        Date.now();


                    const tempoDesdeUltima =
                        agora -
                        ultimaConsultaNominatim;


                    const esperaNecessaria =
                        Math.max(
                            0,
                            1100 -
                            tempoDesdeUltima
                        );


                    if (
                        esperaNecessaria >
                        0
                    ) {

                        await esperar(
                            esperaNecessaria
                        );
                    }


                    ultimaConsultaNominatim =
                        Date.now();


                    return funcao();
                }
            );


    filaNominatim =
        tarefa
            .catch(
                () => {
                    // mantém a fila funcionando
                }
            );


    return tarefa;
}


// =========================================================
// UTILITÁRIOS
// =========================================================

function texto(
    valor
) {

    return String(
        valor ??
        ""
    )
        .trim();
}


function numeroValido(
    valor
) {

    const numero =
        Number(
            valor
        );


    return Number.isFinite(
        numero
    )
        ? numero
        : null;
}


function latitudeValida(
    valor
) {

    const latitude =
        numeroValido(
            valor
        );


    return (
        latitude !== null &&
        latitude >= -90 &&
        latitude <= 90
    );
}


function longitudeValida(
    valor
) {

    const longitude =
        numeroValido(
            valor
        );


    return (
        longitude !== null &&
        longitude >= -180 &&
        longitude <= 180
    );
}


function limparCacheExpirado() {

    const agora =
        Date.now();


    for (
        const [
            chave,
            item
        ] of cacheGeocodificacao
    ) {

        if (
            agora -
            item.criado_em >
            CACHE_TEMPO
        ) {

            cacheGeocodificacao
                .delete(
                    chave
                );
        }
    }


    while (
        cacheGeocodificacao.size >
        CACHE_MAXIMO
    ) {

        const primeiraChave =
            cacheGeocodificacao
                .keys()
                .next()
                .value;


        cacheGeocodificacao
            .delete(
                primeiraChave
            );
    }
}


// =========================================================
// BUSCAR ENDEREÇO
//
// IMPORTANTE:
// Esta rota deve ser acionada pelo botão "Pesquisar".
// NÃO deve ser usada como autocomplete.
// =========================================================

router.get(
    "/buscar-endereco",

    async (req, res) => {

        try {

            const consulta =
                texto(
                    req.query.q
                );


            if (
                consulta.length <
                3
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Digite pelo menos 3 caracteres para pesquisar o endereço"
                    });
            }


            if (
                consulta.length >
                200
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "O endereço informado é muito longo"
                    });
            }


            const chaveCache =
                consulta
                    .toLowerCase();


            limparCacheExpirado();


            const cache =
                cacheGeocodificacao
                    .get(
                        chaveCache
                    );


            if (
                cache &&
                Date.now() -
                    cache.criado_em <
                    CACHE_TEMPO
            ) {

                return res.json({
                    resultados:
                        cache.resultados,

                    cache:
                        true
                });
            }


            const parametros =
                new URLSearchParams({

                    q:
                        consulta,

                    format:
                        "jsonv2",

                    addressdetails:
                        "1",

                    limit:
                        "5",

                    countrycodes:
                        "br",

                    "accept-language":
                        "pt-BR"
                });


            const resultados =
                await executarComLimiteNominatim(
                    async () => {

                        const resposta =
                            await fetch(
                                `${NOMINATIM_URL}?${parametros.toString()}`,
                                {
                                    headers: {

                                        "User-Agent":
                                            NOMINATIM_USER_AGENT,

                                        "Accept":
                                            "application/json"
                                    },

                                    signal:
                                        AbortSignal.timeout(
                                            12000
                                        )
                                }
                            );


                        if (
                            !resposta.ok
                        ) {

                            throw new Error(
                                `Nominatim respondeu com status ${resposta.status}`
                            );
                        }


                        return resposta.json();
                    }
                );


            const dados =
                resultados
                    .map(
                        item => ({

                            nome:
                                item.display_name,

                            latitude:
                                Number(
                                    item.lat
                                ),

                            longitude:
                                Number(
                                    item.lon
                                ),

                            tipo:
                                item.type ||
                                null,

                            categoria:
                                item.category ||
                                null,

                            endereco: {

                                rua:
                                    item.address
                                        ?.road ||
                                    null,

                                bairro:
                                    item.address
                                        ?.suburb ||
                                    item.address
                                        ?.neighbourhood ||
                                    null,

                                cidade:
                                    item.address
                                        ?.city ||
                                    item.address
                                        ?.town ||
                                    item.address
                                        ?.municipality ||
                                    null,

                                estado:
                                    item.address
                                        ?.state ||
                                    null,

                                cep:
                                    item.address
                                        ?.postcode ||
                                    null,

                                pais:
                                    item.address
                                        ?.country ||
                                    null
                            }
                        })
                    )
                    .filter(
                        item =>
                            latitudeValida(
                                item.latitude
                            ) &&
                            longitudeValida(
                                item.longitude
                            )
                    );


            cacheGeocodificacao
                .set(
                    chaveCache,
                    {

                        criado_em:
                            Date.now(),

                        resultados:
                            dados
                    }
                );


            limparCacheExpirado();


            res.json({

                resultados:
                    dados,

                cache:
                    false
            });


        } catch (erro) {

            console.error(
                "Erro ao pesquisar endereço:",
                erro
            );


            if (
                erro.name ===
                "TimeoutError" ||
                erro.name ===
                "AbortError"
            ) {

                return res
                    .status(504)
                    .json({
                        erro:
                            "O serviço de localização demorou para responder"
                    });
            }


            res
                .status(500)
                .json({
                    erro:
                        "Não foi possível pesquisar o endereço"
                });
        }
    }
);


// =========================================================
// CALCULAR UMA ROTA
//
// modos:
// carro
// caminhada
// bicicleta
// =========================================================

router.post(
    "/rota",

    async (req, res) => {

        try {

            const chaveApi =
                process.env
                    .OPENROUTESERVICE_API_KEY;


            if (
                !chaveApi
            ) {

                console.error(
                    "OPENROUTESERVICE_API_KEY não configurada"
                );


                return res
                    .status(503)
                    .json({
                        erro:
                            "Serviço de rotas não configurado"
                    });
            }


            const {
                origem,
                destino
            } =
                req.body;


            const modo =
                texto(
                    req.body.modo
                )
                    .toLowerCase();


            if (
                !origem ||
                !destino
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe origem e destino"
                    });
            }


            if (
                !latitudeValida(
                    origem.latitude
                ) ||
                !longitudeValida(
                    origem.longitude
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Coordenadas da origem são inválidas"
                    });
            }


            if (
                !latitudeValida(
                    destino.latitude
                ) ||
                !longitudeValida(
                    destino.longitude
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Coordenadas do destino são inválidas"
                    });
            }


            const perfis = {

                carro:
                    "driving-car",

                caminhada:
                    "foot-walking",

                bicicleta:
                    "cycling-regular"
            };


            const perfil =
                perfis[
                    modo
                ];


            if (
                !perfil
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Modo de transporte inválido"
                    });
            }


            const corpo = {

                coordinates: [

                    [
                        Number(
                            origem.longitude
                        ),

                        Number(
                            origem.latitude
                        )
                    ],

                    [
                        Number(
                            destino.longitude
                        ),

                        Number(
                            destino.latitude
                        )
                    ]
                ],

                instructions:
                    false
            };


            const resposta =
                await fetch(
                    `${OPENROUTESERVICE_URL}/${perfil}/geojson`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Authorization":
                                chaveApi,

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json, application/geo+json"
                        },

                        body:
                            JSON.stringify(
                                corpo
                            ),

                        signal:
                            AbortSignal.timeout(
                                30000
                            )
                    }
                );


            const dados =
                await resposta
                    .json()
                    .catch(
                        () => null
                    );


            if (
                !resposta.ok
            ) {

                console.error(
                    "Erro openrouteservice:",
                    resposta.status,
                    dados
                );


                if (
                    resposta.status ===
                    401 ||
                    resposta.status ===
                    403
                ) {

                    return res
                        .status(502)
                        .json({
                            erro:
                                "A chave do serviço de rotas foi recusada"
                        });
                }


                return res
                    .status(502)
                    .json({
                        erro:
                            dados
                                ?.error
                                ?.message ||
                            dados
                                ?.message ||
                            "Não foi possível calcular a rota"
                    });
            }


            const feature =
                dados
                    ?.features
                    ?.[0];


            const resumo =
                feature
                    ?.properties
                    ?.summary;


            if (
                !feature ||
                !resumo
            ) {

                return res
                    .status(502)
                    .json({
                        erro:
                            "O serviço não retornou uma rota válida"
                    });
            }


            res.json({

                modo,

                perfil,

                distancia_metros:
                    Number(
                        resumo.distance
                    ),

                distancia_km:
                    Number(
                        (
                            resumo.distance /
                            1000
                        )
                            .toFixed(
                                2
                            )
                    ),

                duracao_segundos:
                    Number(
                        resumo.duration
                    ),

                duracao_minutos:
                    Math.round(
                        resumo.duration /
                        60
                    ),

                geometria:
                    feature.geometry,

                origem: {

                    latitude:
                        Number(
                            origem.latitude
                        ),

                    longitude:
                        Number(
                            origem.longitude
                        )
                },

                destino: {

                    latitude:
                        Number(
                            destino.latitude
                        ),

                    longitude:
                        Number(
                            destino.longitude
                        )
                }
            });


        } catch (erro) {

            console.error(
                "Erro ao calcular rota:",
                erro
            );


            if (
                erro.name ===
                "TimeoutError" ||
                erro.name ===
                "AbortError"
            ) {

                return res
                    .status(504)
                    .json({
                        erro:
                            "O serviço de rotas demorou para responder"
                    });
            }


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao calcular rota"
                });
        }
    }
);


// =========================================================
// COMPARAR MODOS
//
// Faz as três consultas somente quando o usuário solicitar.
// =========================================================

router.post(
    "/comparar",

    async (req, res) => {

        try {

            const chaveApi =
                process.env
                    .OPENROUTESERVICE_API_KEY;


            if (
                !chaveApi
            ) {

                return res
                    .status(503)
                    .json({
                        erro:
                            "Serviço de rotas não configurado"
                    });
            }


            const {
                origem,
                destino
            } =
                req.body;


            if (
                !origem ||
                !destino
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Informe origem e destino"
                    });
            }


            if (
                !latitudeValida(
                    origem.latitude
                ) ||
                !longitudeValida(
                    origem.longitude
                ) ||
                !latitudeValida(
                    destino.latitude
                ) ||
                !longitudeValida(
                    destino.longitude
                )
            ) {

                return res
                    .status(400)
                    .json({
                        erro:
                            "Coordenadas inválidas"
                    });
            }


            const coordenadas = [

                [
                    Number(
                        origem.longitude
                    ),

                    Number(
                        origem.latitude
                    )
                ],

                [
                    Number(
                        destino.longitude
                    ),

                    Number(
                        destino.latitude
                    )
                ]
            ];


            const modos = [

                {
                    modo:
                        "carro",

                    perfil:
                        "driving-car"
                },

                {
                    modo:
                        "caminhada",

                    perfil:
                        "foot-walking"
                },

                {
                    modo:
                        "bicicleta",

                    perfil:
                        "cycling-regular"
                }
            ];


            const consultar =
                async item => {

                    try {

                        const resposta =
                            await fetch(
                                `${OPENROUTESERVICE_URL}/${item.perfil}/geojson`,
                                {

                                    method:
                                        "POST",

                                    headers: {

                                        "Authorization":
                                            chaveApi,

                                        "Content-Type":
                                            "application/json",

                                        "Accept":
                                            "application/json, application/geo+json"
                                    },

                                    body:
                                        JSON.stringify({

                                            coordinates:
                                                coordenadas,

                                            instructions:
                                                false
                                        }),

                                    signal:
                                        AbortSignal.timeout(
                                            30000
                                        )
                                }
                            );


                        const dados =
                            await resposta
                                .json()
                                .catch(
                                    () => null
                                );


                        if (
                            !resposta.ok
                        ) {

                            return {

                                modo:
                                    item.modo,

                                disponivel:
                                    false,

                                erro:
                                    dados
                                        ?.error
                                        ?.message ||
                                    dados
                                        ?.message ||
                                    "Rota indisponível"
                            };
                        }


                        const feature =
                            dados
                                ?.features
                                ?.[0];


                        const resumo =
                            feature
                                ?.properties
                                ?.summary;


                        if (
                            !feature ||
                            !resumo
                        ) {

                            return {

                                modo:
                                    item.modo,

                                disponivel:
                                    false,

                                erro:
                                    "Rota indisponível"
                            };
                        }


                        return {

                            modo:
                                item.modo,

                            disponivel:
                                true,

                            distancia_metros:
                                Number(
                                    resumo.distance
                                ),

                            distancia_km:
                                Number(
                                    (
                                        resumo.distance /
                                        1000
                                    )
                                        .toFixed(
                                            2
                                        )
                                ),

                            duracao_segundos:
                                Number(
                                    resumo.duration
                                ),

                            duracao_minutos:
                                Math.round(
                                    resumo.duration /
                                    60
                                ),

                            geometria:
                                feature.geometry
                        };


                    } catch (erro) {

                        console.error(
                            `Erro ao calcular rota ${item.modo}:`,
                            erro
                        );


                        return {

                            modo:
                                item.modo,

                            disponivel:
                                false,

                            erro:
                                "Rota temporariamente indisponível"
                        };
                    }
                };


            const rotas =
                await Promise.all(
                    modos.map(
                        consultar
                    )
                );


            res.json({

                origem: {

                    latitude:
                        Number(
                            origem.latitude
                        ),

                    longitude:
                        Number(
                            origem.longitude
                        )
                },

                destino: {

                    latitude:
                        Number(
                            destino.latitude
                        ),

                    longitude:
                        Number(
                            destino.longitude
                        )
                },

                rotas
            });


        } catch (erro) {

            console.error(
                "Erro ao comparar rotas:",
                erro
            );


            res
                .status(500)
                .json({
                    erro:
                        "Erro ao comparar rotas"
                });
        }
    }
);


module.exports =
    router;