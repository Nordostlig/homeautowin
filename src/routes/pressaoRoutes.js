const express = require('express');
const router = express.Router();
const pressaoController = require('../controllers/pressaoController');

router.get('/pressao/arquivos', pressaoController.listarArquivos);
router.get('/pressao/registros/:arquivo', pressaoController.lerRegistros);
router.post('/pressao/registros', pressaoController.adicionarRegistro);
router.post('/pressao/enviar-email', pressaoController.enviarRelatorioPressao);

module.exports = router;
