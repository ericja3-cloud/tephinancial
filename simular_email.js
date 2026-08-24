const fs = require('fs');

async function simularEmail() {
  // Configurações do teste
  const seuEmail = "COLOQUE_SEU_EMAIL_AQUI@gmail.com"; // <-- ALTERE ISSO AQUI
  const portaServidor = 8080; // A porta do seu localhost

  console.log(`\n📧 Iniciando simulação de e-mail enviado por: ${seuEmail}`);

  // Cria um arquivo de texto fictício simulando um comprovante (ou você pode ler um PDF real do disco)
  const fakePdfContent = "Comprovante de pagamento Ifood\nValor: R$ 45,90\nData: 17/07/2026\nEstabelecimento: Ifood S.A.";
  const blob = new Blob([fakePdfContent], { type: 'application/pdf' });

  // Monta o FormData exatamente no formato que o SendGrid usaria
  const formData = new FormData();
  formData.append("to", "inbox@inbox.friccaozero.app");
  formData.append("from", `Teste <${seuEmail}>`);
  formData.append("subject", "Comprovante de Pagamento do Ifood");
  formData.append("anexo.pdf", blob, "comprovante.pdf");

  try {
    const response = await fetch(`http://localhost:${portaServidor}/api/public/inbound-email`, {
      method: 'POST',
      body: formData
    });

    const text = await response.text();
    console.log(`\n✅ Resposta do Servidor (${response.status}):\n`, text);
    
    if (response.status === 200) {
      console.log("\n🎉 E-mail simulado com sucesso! Vá conferir no aplicativo se a transação apareceu.");
    }
  } catch (error) {
    console.error("\n❌ Erro ao enviar requisição para o servidor local:", error.message);
  }
}

simularEmail();
