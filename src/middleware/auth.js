function exigirLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            erro: "Usuário não autenticado"
        });
    }

    next();
}

function exigirPerfil(...perfisPermitidos) {
    return (req, res, next) => {
        if (!req.session.usuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            });
        }

        if (!perfisPermitidos.includes(req.session.usuario.perfil)) {
            return res.status(403).json({
                erro: "Você não possui permissão para realizar esta operação"
            });
        }

        next();
    };
}

module.exports = {
    exigirLogin,
    exigirPerfil
};