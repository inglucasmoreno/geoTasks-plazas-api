const {Schema, model} = require('mongoose');

const plazaSchema = Schema({
    descripcion: {
        type: String,
        required: "La descripcion es obligatoria",
        trim: true,
    },
    lat:{
        type: String,
        required: "La longitud es obligatoria",
        trim: true        
    },
    lng:{
        type: String,
        required: "La longitud es obligatoria",
        trim: true
    },
    activo:{
        type: Boolean,
        // required: true,
        default: true
    },
    fecha_ultima_visita: {
        type: Date,
        default: Date.now
    },
},{ timestamps: true });


module.exports = model('plaza', plazaSchema);