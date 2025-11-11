// ====================== GET ESTABELECIMENTOS POR USUÁRIO ======================
const getEstabelecimentosByUsuario = async function (idUsuario) {
    let status = false;
    let status_code;
    let mensagem = {};

    if (idUsuario == '' || idUsuario == undefined || isNaN(idUsuario)) {
        status_code = 400;
        mensagem.message = message.ERROR_INVALID_ID;
    } else {
        // Aqui você precisa criar a função no DAO para buscar por usuário
        let dados = await estabelecimentoDAO.selectEstabelecimentosByUsuario(idUsuario);

        if (dados) {
            if (dados.length > 0) {
                status = true;
                status_code = 200;
                mensagem = dados;
            } else {
                status_code = 404;
                mensagem.message = "Nenhum estabelecimento encontrado para este usuário";
            }
        } else {
            status_code = 500;
            mensagem.message = message.ERROR_INTERNAL_SERVER;
        }
    }

    return {
        status: status,
        status_code: status_code,
        data: mensagem.length ? mensagem : [],
        message: mensagem.message || null
    };
}

// Adicione no module.exports:
module.exports = {
    createEstabelecimento,
    updateEstabelecimento,
    deleteEstabelecimento,
    getEstabelecimentos,
    getEstabelecimentoById,
    getEstabelecimentosByUsuario  // <- ADICIONAR ESTA LINHA
}
