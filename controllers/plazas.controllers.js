const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const Plaza = require('../models/plaza.model');

// Obtener plaza por ID
const getPlaza = async (req, res) => {
    try{
        const id = req.params.id;
        const plaza = await Plaza.findById(id);
        if(!plaza) return error(res, 400, 'La plaza no existe');
        success(res, plaza);
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Listar todas las plazas con filtro
const listarPlazas = async (req, res) => {
    try{
        // Se prepara el filtrado
        const desde = Number(req.query.desde) || 0;
        const limit = Number(req.query.limit) || 0;
        const filtroActivo = req.query.activo || '';
        const filtroDescripcion = req.query.descripcion || '';

        const busqueda = {};
        if(filtroActivo) busqueda.activo = filtroActivo;
        if(filtroDescripcion){
            const regex = new RegExp(filtroDescripcion, 'i'); // Expresion regular para busqueda insensible
            busqueda.descripcion = regex;
        }

        const [plazas, total] = await Promise.all([
            Plaza.find(busqueda)
                   .skip(desde)
                   .limit(limit)
                   .sort({fecha_ultima_visita: 1}),
            Plaza.find(busqueda).countDocuments()
        ]);
        
        success(res, { plazas, total });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Nueva plaza
const nuevaPlaza = async (req, res) => {
    try{
        const plaza = Plaza(req.body);
        await plaza.save();
        success(res, { plaza });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Actualizacion de plaza
const actualizarPlaza = async (req, res) => {
    try{
        const id = req.params.id;
        const plazaDB = await Plaza.findById(id);
        if(!plazaDB) return error(res, 400, 'La plaza no existe');
        const plaza = await Plaza.findByIdAndUpdate(id, req.body, {new: true});
        success(res, { plaza });   
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    getPlaza,
    listarPlazas,
    nuevaPlaza,
    actualizarPlaza
}