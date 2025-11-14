import nodemailer from 'nodemailer';

let testTransporter = null;

async function getTestTransporter() {
  if (testTransporter) {
    return testTransporter;
  }

  const testAccount = await nodemailer.createTestAccount();

  console.log('Conta de email de teste Ethereal criada:');
  console.log(`User: ${testAccount.user}`);
  console.log(`Pass: ${testAccount.pass}`);

  testTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return testTransporter;
}

export async function sendPasswordResetEmail(userEmail, resetLink) {
  try {
    const transporter = await getTestTransporter();

    const mailOptions = {
      from: '"Estadia Já" <noreply@estadiaja.com>',
      to: userEmail,
      subject: 'Recuperação de Senha - Estadia Já',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Olá!</h2>
          <p>Recebemos um pedido de redefinição de senha para a sua conta.</p>
          <p>Por favor, clique no link abaixo para criar uma nova senha. Este link é válido por 15 minutos:</p>
          <p style="margin: 20px 0;">
            <a 
              href="${resetLink}" 
              style="background-color: #1D3557; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;"
            >
              Redefinir Minha Senha
            </a>
          </p>
          <p>Se você não solicitou isto, por favor ignore este email.</p>
          <p>Obrigado,<br>Equipa Estadia Já</p>
        </div>
      `,
      text: `Olá! Clique neste link para redefinir a sua senha (válido por 15 minutos): ${resetLink}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Mensagem enviada: %s', info.messageId);

    console.log(
      'URL de Pré-visualização (Ethereal): %s',
      nodemailer.getTestMessageUrl(info)
    );
  } catch (error) {
    console.error('Erro ao enviar email pelo Ethereal:', error);
  }
}
