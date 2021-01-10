const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const {
    getTarea,
    listarTareas,
    crearTarea,
    actualizarTarea 
    } = require('../controllers/tareas.controllers');

const router = Router();

router.get('/:id', validarJWT, getTarea);
router.get('/', validarJWT, listarTareas);
router.post('/', validarJWT, crearTarea);
router.put('/:id', validarJWT, actualizarTarea);

module.exports = router;