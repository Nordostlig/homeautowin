require('dotenv').config();
const express = require('express');
const app = express();
const emailRoutes = require('./src/routes/emailRoutes');

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Rotas do HomeAuto
app.use('/', emailRoutes); 
// futuramente: app.use('/luzes', luzesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🏠 HomeAuto rodando em: http://localhost:${PORT}`);
});