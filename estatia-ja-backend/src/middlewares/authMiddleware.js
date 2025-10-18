export const authMiddleware = (req, res, next) => {
    const USER_ID = 'cmgwbxlnk0001ox60m034es4w'

    if(USER_ID === 'cmgwbxlnk0001ox60m034es4w'){
        console.log('autenticado');
    }

    req.user = {
        id:USER_ID,
    }

    next();
}