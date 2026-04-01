require('dotenv').config();
const express = require('express');
const app = express();
const emailRoutes = require('./src/routes/emailRoutes');
const pressaoRoutes = require('./src/routes/pressaoRoutes');

// Middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.static('public'));

// Rotas do HomeAuto
app.use('/', emailRoutes);
app.use('/', pressaoRoutes);
// futuramente: app.use('/luzes', luzesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🏠 HomeAuto rodando em: http://localhost:${PORT}`);
});