// src/middlewares/authMiddleware.js

export const authMiddleware = (req, res, next) => {
    // Verifica se a aplicação está rodando em ambiente de teste
    if (process.env.NODE_ENV === 'test') {
        // Em testes, esperamos um cabeçalho especial com o ID do usuário
        const testUserId = req.headers['x-test-user-id'];

        if (!testUserId) {
            // Se o teste não enviar o cabeçalho, é um erro de configuração do teste
            return res.status(401).json({ error: 'Header X-Test-User-ID é obrigatório em ambiente de teste.' });
        }

        req.user = { id: testUserId };
        console.log(`Autenticado em modo de TESTE com o usuário: ${testUserId}`);
    } else {
        // Em modo de desenvolvimento (ou qualquer outro modo), usa o ID fixo
        const DEV_USER_ID = 'cmgp2h7j30001l65vk6uuak4j';

        req.user = { id: DEV_USER_ID };
        console.log(`Autenticado em modo de DESENVOLVIMENTO com o usuário: ${DEV_USER_ID}`);
    }

    next();
};