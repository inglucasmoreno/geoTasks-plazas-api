const chalk = require('chalk');
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario.model');
const {error, success} = require('../helpers/response');
const { generarJWT } = require('../helpers/jwt');

// Informacion de usuario
const getUsuario = async (req, res) => {
    try{
        const id = req.params.id;
        const usuario = await Usuario.findById(id, 'dni nombre apellido role email activo');
        if(!usuario) return error(res, 400, 'El usuario no existe');
        success(res, { usuario });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Listar usuarios
const listarUsuarios = async (req, res) => {

    try{
        // Se prepara el filtrado
        const desde = Number(req.query.desde) || 0;
        const limit = Number(req.query.limit) || 0;
        const filtroActivo = req.query.activo || '';
        const filtroDni = req.query.dni || '';

        const busqueda = {};
        if(filtroActivo) busqueda.activo = filtroActivo;
        if(filtroDni){
            const regex = new RegExp(filtroDni, 'i'); // Expresion regular para busqueda insensible
            busqueda.dni = regex;
        }

        const [usuarios, total] = await Promise.all([
            Usuario.find(busqueda, 'dni apellido nombre role email activo')    
                   .skip(desde)
                   .limit(limit)
                   .sort({apellido: 1}),
            Usuario.find(busqueda).countDocuments()
        ]);
        
        success(res, { usuarios, total });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }   

}

// Nuevo usuario
const nuevoUsuario = async (req, res) => {
    try{
        const {dni, password, email} = req.body;
        
        // Verificacion: DNI repetido?
        const existeUsuario = await Usuario.findOne({ dni });
        if(existeUsuario) return error(res, 400, 'El usuario ya existe');
            
        // Verificacion: Email repetido?
        const existeEmail = await Usuario.findOne({ email });
        if(existeEmail) return error(res, 400, 'Ese correo ya esta registrado');

        // Se crea la instancia de usuario
        const usuario = Usuario(req.body);

        // Se encript la contraseña
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);
        
        // Se almacena en base de datos y se genera el token
        await usuario.save();
        const token = await generarJWT(usuario.id);

        success(res, {
            usuario,
            token
        });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }        
}

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try{
        const { dni, email, password } = req.body;
        const uid = req.params.id;

        // Verificacion: EL usuario existe?
        const usuarioDB = await Usuario.findById(uid);
        if(!usuarioDB) return error(res, 400, 'El usuario no existe');

        // Verificacion: El DNI esta registrado?
        if(dni !== usuarioDB.dni){
            const dniExiste = await Usuario.findOne({dni});
            if(dniExiste) return error(res, 400, 'El DNI ya esta registrado');   
        } 

        // Verificacion: El Correo ya esta registrado?
        if(email !==  usuarioDB.email){
            const emailExiste = await Usuario.findOne({email});
            if(emailExiste) return error(res, 400, 'Ese email ya esta registrado');
        }

        // Se encripta el password en caso de que sea necesario
        if(password){
            const salt = bcryptjs.genSaltSync();
            req.body.password = bcryptjs.hashSync(password, salt);     
        }

        // Se actualiza el usuario
        const usuario = await Usuario.findByIdAndUpdate(uid, req.body, {new: true});
        success(res, { usuario });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    } 
}

module.exports = {
    getUsuario,
    listarUsuarios,
    nuevoUsuario,
    actualizarUsuario
}