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

    let paginador = { 
        desdeTareas: 0, 
        hastaTareas: 0,
        desdeVencidas: 0, 
        hastaVencidas: 0,
        desdePorVencers: 0, 
        hastaPorVencers: 0, 
    };

    paginador.desdeTareas = Number(req.query.desdeTareas) || 0;
    paginador.hastaTareas = Number(req.query.hastaTareas) || 0;
    paginador.desdeVencidas = Number(req.query.desdeVencidas) || 0;
    paginador.hastaVencidas = Number(req.query.hastaVencidas) || 0;
    paginador.desdePorVencer = Number(req.query.desdePorVencer) || 0;
    paginador.hastaPorVencer = Number(req.query.hastaPorVencer) || 0;
    
    
    let busquedaPorVencer = {activo: true};
    let busquedaVencidas = {activo: true};
    
    const descripcionPorVencer = req.query.descripcionPorVencer || '';
    const descripcionVencidas = req.query.descripcionVencidas || '';
    
    if(descripcionPorVencer){
        const regex = new RegExp(descripcionPorVencer, 'i'); // Expresion regular para busqueda insensible
        busquedaPorVencer.descripcion= regex;
    }

    if(descripcionVencidas){
        const regex = new RegExp(descripcionVencidas, 'i'); // Expresion regular para busqueda insensible
        busquedaVencidas.descripcion = regex;
    }

    const condicionTareas = { fecha_limite: { $lte: new Date(`${manana}T00:00:00.000Z`)} }
    const condicionPorVencer = { fecha_limite:{ $gte: new Date(`${hoy}T00:00:00.000Z`), $lt: new Date(`${manana}T00:00:00.000Z`) } }
    const condicionVencidas = { fecha_limite: { $lt: new Date(`${hoy}T00:00:00.000Z`)} }
    
    try{
        const [tareas, vencidas, porVencer, totalTareas, totalPorVencer, totalVencidas] = await Promise.all([
            Tarea.find({activo: true})
                 .skip(paginador.desdeTareas)
                 .limit(paginador.hastaTareas)
                 .populate('plaza', 'descripcion activo').sort({plaza: -1})        
                 .where(condicionTareas),
            
            Tarea.find(busquedaVencidas)
                 .skip(paginador.desdeVencidas)
                 .limit(paginador.hastaVencidas)
                 .where(condicionVencidas)
                 .populate({path: 'plaza', select: 'descripcion activo'}).sort({plaza: -1}),         
            
            Tarea.find(busquedaPorVencer)
                .skip(paginador.desdePorVencer)
                .limit(paginador.hastaPorVencer)
                .populate('plaza', 'descripcion activo').sort({plaza: -1})
                .where(condicionPorVencer),
            
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