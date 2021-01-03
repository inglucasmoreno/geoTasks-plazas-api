const jwt = require('jsonwebtoken');
const chalk = require('chalk');
const { error } = require('../helpers/response');

const validarJWT = (req, res, next) => {
    try{
        const token = req.header('x-token');
        if(!token) return error(res, 401, 'No hay token en la peticion');
        const { uid } = jwt.verify(token, process.env.JWT_SECRET || 'EquinoccioKey');
        req.uid = uid;
        next();    
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    } 
}

module.exports = {
    validarJWT
}