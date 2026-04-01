const express = require('express');
const path = require('path');
const router = express.Router();
const pressaoController = require('../controllers/pressaoController');

router.get('/pressao', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/pressao.html'));
});

router.get('/pressao/meses', pressaoController.listarMeses);
router.get('/pressao/registros', pressaoController.lerRegistros);
router.post('/pressao/registros', pressaoController.adicionarRegistro);
router.post('/pressao/migrar-legado', pressaoController.migrarLegado);
router.post('/pressao/enviar-email', pressaoController.enviarRelatorioPressao);

module.exports = router;
