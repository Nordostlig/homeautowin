const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Função de Limpeza (mantive a lógica de 2 meses)
const limparArquivosAntigos = () => {
    const pastaUploads = './uploads';
    const sessentaDiasEmMs = 60 * 24 * 60 * 60 * 1000;
    const agora = Date.now();

    if (fs.existsSync(pastaUploads)) {
        fs.readdir(pastaUploads, (err, files) => {
            if (err) return;
            files.forEach(file => {
                const filePath = path.join(pastaUploads, file);
                fs.stat(filePath, (err, stats) => {
                    if (!err && (agora - stats.mtimeMs > sessentaDiasEmMs)) {
                        fs.unlink(filePath, () => {});
                    }
                });
            });
        });
    }
};

exports.enviarBoleto = async (req, res) => {
    try {
        const dataAtual = new Date();
        const ano = dataAtual.getFullYear();
        const mesNum = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const mesesPorExtenso = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        const mesExtenso = mesesPorExtenso[dataAtual.getMonth()];
        const anoCurto = String(ano).slice(-2);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `${ano}${mesNum} - Boleto e Comprovante`,
            text: `Seguem anexos arquivos com o boleto e o comprovante de pagamento do condomínio com vencimento em ${mesExtenso}/${anoCurto}.\n\n\nAtt.\nCristhiano Mello`,
            attachments: req.files.map(file => ({
                filename: file.originalname,
                path: file.path
            }))
        };

        await transporter.sendMail(mailOptions);
        limparArquivosAntigos();
        res.status(200).json({ message: 'Sucesso' });

    } catch (error) {
        res.status(500).json({ error: 'Erro no envio' });
    }
};