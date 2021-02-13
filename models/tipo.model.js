const { Schema, model } = require('mongoose');

const tipoSchema = Schema({
    
    descripcion: {
        type: String,
        required: true,
        trim: true
    },

    activo: {
        type: Boolean,
        required: true,
        default: true
    }

}, {timestamps: true});

module.exports = model('tipo', tipoSchema);