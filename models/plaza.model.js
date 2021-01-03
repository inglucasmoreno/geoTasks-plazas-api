const {Schema, model} = require('mongoose');

const tareas = Schema({
   descripcion: {
       type: String,
       trim: true
   }
}, { timestamps: true });

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
    tareas: [tareas],
    activo:{
        type: Boolean,
        required: true,
        default: true
    }
},{ timestamps: true });


module.exports = model('plaza', plazaSchema);