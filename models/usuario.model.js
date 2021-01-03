const { Schema, model } = require('mongoose');

const usuarioSchema = Schema({
    
    dni: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    apellido: {
        type: String,
        required: true,
        trim: true,
    },

    nombre: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        required: true,
        default: 'ROLE_USER'
    },

    fecha_creacion: {
        type: String,
        required: true,
        default: Date.now
    },

    activo: {
        type: Boolean,
        required: true,
        default: true
    }

});

usuarioSchema.method('toJSON', function(){
    const {__v, _id, password, ...object} = this.toObject();
    object.uid = _id;
    return object;
});

module.exports = model('usuario', usuarioSchema);