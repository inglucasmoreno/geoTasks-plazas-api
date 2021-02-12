const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const { 
    listarTipos,
    nuevoTipo,
    actualizarTipo 
} = require('../controllers/tipos.controller');

const router = Router();

router.get('/', listarTipos);
router.post('/', nuevoTipo);
router.put('/', actualizarTipo);

module.exports = router;