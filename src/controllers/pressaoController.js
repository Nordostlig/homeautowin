const nodemailer = require('nodemailer');
const pressaoStore = require('../services/pressaoStore');

const MES_REGEX = /^\d{4}-\d{2}$/;

exports.listarMeses = (req, res) => {
    try {
        res.json(pressaoStore.listMonths());
    } catch (error) {
        console.error('Erro ao listar meses de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao listar meses' });
    }
};

exports.lerRegistros = (req, res) => {
    const { mes } = req.query;

    if (!MES_REGEX.test(mes || '')) {
        return res.status(400).json({ erro: 'Mes invalido. Use o formato YYYY-MM.' });
    }

    try {
        res.json(pressaoStore.listRecordsByMonth(mes));
    } catch (error) {
        console.error('Erro ao ler registros de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao ler registros' });
    }
};

exports.adicionarRegistro = (req, res) => {
    const { PAS, PAD } = req.body;

    if (!PAS || !PAD) {
        return res.status(400).json({ erro: 'PAS e PAD sao obrigatorios' });
    }

    const pas = Number.parseInt(PAS, 10);
    const pad = Number.parseInt(PAD, 10);

    if (Number.isNaN(pas) || Number.isNaN(pad) || pas < 50 || pas > 300 || pad < 30 || pad > 200) {
        return res.status(400).json({ erro: 'Valores de pressao invalidos' });
    }

    try {
        const registro = pressaoStore.addRecord({ pas, pad });
        res.json({ sucesso: true, ...registro });
    } catch (error) {
        console.error('Erro ao adicionar registro de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao salvar registro' });
    }
};

exports.migrarLegado = (req, res) => {
    try {
        const summary = pressaoStore.importLegacyCsvFiles();
        res.json({
            sucesso: true,
            ...summary
        });
    } catch (error) {
        console.error('Erro ao migrar arquivos legados de pressao:', error.message);
        res.status(500).json({ erro: 'Erro ao migrar planilhas legadas' });
    }
};

exports.enviarRelatorioPressao = async (req, res) => {
    const { pdfBase64, periodo, nomeArquivo } = req.body;

    if (!pdfBase64 || !periodo || !nomeArquivo) {
        return res.status(400).json({ erro: 'Dados insuficientes para envio.' });
    }

    try {
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM_MEDICA,
            to: process.env.EMAIL_TO_MEDICA,
            subject: `Diario de Pressao Arterial - ${periodo}`,
            text: `Ola,\n\nSegue em anexo o diario de pressao arterial do periodo ${periodo}.\n\nAtt.\nCristhiano Mello`,
            attachments: [{
                filename: nomeArquivo,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao enviar email de pressao:', error.message);
        res.status(500).json({ erro: 'Falha no envio do email.' });
    }
};
