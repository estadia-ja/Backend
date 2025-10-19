export const authMiddleware = (req, res, next) => {
    const USER_ID = 'cmgp2h7j30001l65vk6uuak4j'

    if(USER_ID === 'cmgp2h7j30001l65vk6uuak4j'){
        console.log('autenticado');
    }

    req.user = {
        id:USER_ID,
    }

    next();
}