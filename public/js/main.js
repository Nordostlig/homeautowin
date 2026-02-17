document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    
    // Só executa se estivermos na página que tem o formulário
    if (form) {
        const alertContainer = document.getElementById('alertContainer');
        const btnSend = document.getElementById('btnSend');

        form.onsubmit = async (e) => {
            e.preventDefault();
            
            // UI Feedback
            btnSend.disabled = true;
            const originalText = btnSend.innerHTML;
            btnSend.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';

            const formData = new FormData();
            const files = document.getElementById('pdfFiles').files;
            
            for (let i = 0; i < files.length; i++) {
                formData.append('pdfs', files[i]);
            }

            try {
                const response = await fetch('/send-email', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alertContainer.innerHTML = `
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            <strong>Sucesso!</strong> E-mail enviado com os anexos.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
                    form.reset();
                } else {
                    throw new Error('Falha no servidor');
                }
            } catch (error) {
                alertContainer.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Erro!</strong> Não foi possível enviar o e-mail. Verifique o servidor.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
            } finally {
                btnSend.disabled = false;
                btnSend.innerHTML = originalText;
            }
        };
    }
});