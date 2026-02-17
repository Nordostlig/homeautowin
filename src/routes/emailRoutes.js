const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const emailController = require('../controllers/emailController');

// Define a rota de envio vinculando ao controller
router.post('/send-email', upload.array('pdfs', 2), emailController.enviarBoleto);

module.exports = router;