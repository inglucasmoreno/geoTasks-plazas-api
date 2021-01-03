const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const {
    getPlaza,
    listarPlazas,
    nuevaPlaza,
    actualizarPlaza
    } = require('../controllers/plazas.controllers');

const router = Router();

router.get('/:id', validarJWT, getPlaza);
router.get('/', validarJWT, listarPlazas);
router.post('/',
            [
                validarJWT,
                check('descripcion', 'La descripcion es obligatoria').not().isEmpty(),
                check('lat', 'La latitud es obligatoria').not().isEmpty(),
                check('lng', 'La longitud es obligatoria').not().isEmpty(),
                validarCampos
            ]
            , nuevaPlaza);
router.put('/:id', validarJWT, actualizarPlaza);

module.exports = router;