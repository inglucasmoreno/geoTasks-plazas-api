const chalk = require('chalk');
const moment = require('moment');
const {error, success} = require('../helpers/response');
const { where } = require('../models/tarea.model');
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

// Listar tareas por ID de plaza
const tareasPlaza = async (req, res) => {
    try{

        // Objeto de paginacion
        let paginador = { 
            desde: Number(req.query.desde) || 0, 
            hasta: Number(req.query.hasta) || 0,
        };

        const busqueda = { plaza: req.params.id };
        if(req.query.activo) busqueda.activo = req.query.activo;

        const [tareas, total] = await Promise.all([
            Tarea.find(busqueda)
                 .skip(paginador.desde)
                 .limit(paginador.hasta)
                 .sort({fecha_completada: -1}),
            Tarea.find(busqueda).countDocuments()
        ]);

        success(res, { tareas, total });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Listar tareas por condicion
const listarTareas = async (req, res) => {
    try{ 

        // Objeto busqueda
        const busqueda = {}; 
   
        // Se reciben los parametros
        if(req.query.plaza) busqueda.plaza = req.query.plaza;    // {plaza: idPlaza}
        if(req.query.activo) busqueda.activo = req.query.activo; // {activo: true o false}
        
        // Fechas bases para comparar
        const hoy = moment().format('YYYY-MM-DD');
        const manana = moment().add(1, 'days').format('YYYY-MM-DD');

        // Objeto para where
        // const condicionTareas = { fecha_limite: { $lte: new Date(`${manana}T00:00:00.000Z`)} }
        const condicionPorVencer = { fecha_limite:{ $gte: new Date(`${hoy}T00:00:00.000Z`), $lt: new Date(`${manana}T00:00:00.000Z`) } }
        const condicionVencidas = { fecha_limite: { $lt: new Date(`${hoy}T00:00:00.000Z`)} }

        const [tareas, vencidas, porVencer] = await Promise.all([
            Tarea.find(busqueda)
                 .populate('plaza', 'descripcion')
                 .sort({fecha_limite: 1}),
            Tarea.find(busqueda)
                 .populate('plaza', 'descripcion')
                 .where(condicionVencidas)
                 .sort({fecha_limite: 1}),
            Tarea.find(busqueda)
                 .where(condicionPorVencer)
                 .populate('plaza', 'descripcion')
                 .sort({fecha_limite: 1}),
        ])
        success(res, { 
            tareas, 
            vencidas,
            porVencer,
            totalTareas: tareas.length,
            totalVencidas: vencidas.length,
            totalPorVencer:  porVencer.length});
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Listar tareas por vencer/vencidas
const tareasVencidas = async (req, res) => {

    // Fechas bases para comparar
    const hoy = moment().format('YYYY-MM-DD');
    const manana = moment().add(1, 'days').format('YYYY-MM-DD');

    // Objeto de paginacion
    let paginador = { 
        desdeTareas: Number(req.query.desdeTareas) || 0, 
        hastaTareas: Number(req.query.hastaTareas) || 0,
        desdeVencidas: Number(req.query.desdeVencidas) || 0, 
        hastaVencidas: Number(req.query.hastaVencidas) || 0,
        desdePorVencers: Number(req.query.desdePorVencer) || 0, 
        hastaPorVencers: Number(req.query.hastaPorVencer) || 0, 
    };
    
    // Objetos de busquedas
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

    // Objeto para where
    const condicionTareas = { fecha_limite: { $lte: new Date(`${manana}T00:00:00.000Z`)} }
    const condicionPorVencer = { fecha_limite:{ $gte: new Date(`${hoy}T00:00:00.000Z`), $lt: new Date(`${manana}T00:00:00.000Z`) } }
    const condicionVencidas = { fecha_limite: { $lt: new Date(`${hoy}T00:00:00.000Z`)} }
    
    try{
        const [tareas, vencidas, porVencer] = await Promise.all([
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
            
            // Where
            // Tarea.find({activo: true}).where(condicionTareas).countDocuments(),
            // Tarea.find({activo: true}).where(condicionPorVencer).countDocuments(),
            // Tarea.find({activo: true}).where(condicionVencidas).countDocuments(),
        
        ])
        
        // Filtrado: Solo tareas de plazas activas
        const respTareas = tareas.filter( tarea => tarea.plaza.activo === true );
        const respVencidas = vencidas.filter( tarea => tarea.plaza.activo === true );
        const respPorVencer = porVencer.filter( tarea => tarea.plaza.activo === true );
        
        // Respuesta de servidor
        success(res, { 
            tareas: respTareas, 
            vencidas: respVencidas,
            porVencer: respPorVencer,
            totalTareas: respTareas.length,
            totalPorVencer: respPorVencer.length,
            totalVencidas: respVencidas.length
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
    crearTarea,
    tareasPlaza
}