const chalk = require('chalk');
const moment = require('moment');
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

// Listar tareas por vencer/vencidas
const tareasVencidas = async (req, res) => {
    
    const hoy = moment().format('YYYY-MM-DD');
    const manana = moment().add(1, 'days').format('YYYY-MM-DD');
    let condicion = {};

    const condicionTareas = { fecha_limite: { $lte: new Date(`${manana}T00:00:00.000Z`)} }
    const condicionPorVencer = { fecha_limite:{ $gte: new Date(`${hoy}T00:00:00.000Z`), $lt: new Date(`${manana}T00:00:00.000Z`) } }
    const condicionVencidas = { fecha_limite: { $lt: new Date(`${hoy}T00:00:00.000Z`)} }
    
    try{
        const [tareas, vencidas, porVencer, totalTareas, totalPorVencer, totalVencidas] = await Promise.all([
            Tarea.find({activo: true}).where(condicionTareas).populate('plaza', 'descripcion').sort({plaza: -1}),        
            Tarea.find({activo: true}).where(condicionVencidas).populate('plaza', 'descripcion').sort({plaza: -1}),         
            Tarea.find({activo: true}).where(condicionPorVencer).populate('plaza', 'descripcion').sort({plaza: -1}), 
            Tarea.find({activo: true}).where(condicionTareas).countDocuments(),
            Tarea.find({activo: true}).where(condicionPorVencer).countDocuments(),
            Tarea.find({activo: true}).where(condicionVencidas).countDocuments(),
        ])  
        success(res, { 
            tareas, 
            vencidas,
            porVencer,
            totalTareas,
            totalPorVencer,
            totalVencidas
        });                          
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
    tareasVencidas,
    actualizarTarea,
    crearTarea
}