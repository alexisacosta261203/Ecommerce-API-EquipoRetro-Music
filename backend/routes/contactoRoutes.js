const path = require('path');
console.log('DEBUG: __dirname de routes =', __dirname);

try {
  const ctrl = require(path.join(__dirname, '..', 'controllers', 'contactoController.js'));
  console.log('DEBUG: controlador cargado correctamente:', typeof ctrl);
} catch (err) {
  console.error('DEBUG: error al require(contactoController):');
  console.error(err);
}


const express = require('express');
const router = express.Router();
const { enviarContacto } = require('../controllers/contactoController');

router.post('/', enviarContacto);

module.exports = router;
