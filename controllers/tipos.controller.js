const {error, success} = require('../helpers/response');
const chalk = require('chalk');
const Tipo = require('../models/tipo.model');
const { response } = require('express');

const listarTipos = async (req, res) => {
    try{
        const [tipos, total] = await Promise.all([
            Tipo.find().sort({descripcion: 1}),
            Tipo.find().countDocuments()    
        ]);
        success(res, { tipos, total });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

const nuevoTipo = async (req, res) => {
    try{
        const tipo = new Tipo(req.body);
        await tipo.save();
        success(res, { tipo });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

const actualizarTipo = async (req, res) => {

}

module.exports = {
    listarTipos,
    nuevoTipo,
    actualizarTipo
}