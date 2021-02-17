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

router.get('/', validarJWT, listarTipos);
router.post('/', 
    [
        validarJWT,
        check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
        validarCampos
    ], nuevoTipo);
router.put('/', validarJWT, actualizarTipo);

module.exports = router;