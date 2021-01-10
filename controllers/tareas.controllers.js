const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const Tarea = require('../models/tarea.model');

// Tarea por ID
const getTarea = async (req, res) => {
    try{
        const tarea = await Tarea.findById(req.params.id).populate('plaza','descripcion');
        if(!tarea) return error(res, 400, 'La tarea no existe');
        success(res, { tarea });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);       
    }
}

// Listar tareas por condicion
const listarTareas = async (req, res) => {
    try{ 
        const busqueda = {}; 
        if(req.query.plaza) busqueda.plaza = req.query.plaza;    // {plaza: idPlaza}
        if(req.query.activo) busqueda.activo = req.query.activo; // {activo: true o false}
        const [tareas, total] = await Promise.all([
            Tarea.find(busqueda).populate('plaza', 'descripcion').sort({fecha_limite: 1}),
            Tarea.find(busqueda).countDocuments()
        ])
        success(res, { tareas, total });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Crear nueva tarea
const crearTarea = async (req, res) => {
    try{
        const tarea = Tarea(req.body);
        await tarea.save();
        success(res, { tarea });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Crear nueva tarea
const actualizarTarea = async (req, res) => {
    try{
        const id = req.params.id;
        const tareaDB = await Tarea.findById(id);
        if(!tareaDB) return error(res, 400, 'La tarea no existe');
        const tarea = await Tarea.findByIdAndUpdate(id, req.body, {new: true});
        success(res, { tarea });   
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    getTarea,
    listarTareas,
    actualizarTarea,
    crearTarea
}