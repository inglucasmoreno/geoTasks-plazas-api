const {Schema, model} = require('mongoose');

const tareaSchema = Schema({
    descripcion: {
        type: String,
        trim: true
    },
    plaza: {
        require: "Plaza ID es obligatorio",
        type: Schema.Types.ObjectId,
        ref: 'plaza'
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    fecha_limite: {
        type: Date,
        required: "La fecha limite es obligatoria"
    },
    fecha_realizacion: {
        type: Date
    },
    activo: {
        type: Boolean,
        default: true
    }
});

module.exports = model('tarea', tareaSchema);
