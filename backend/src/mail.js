import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });
  } else {
    transporter = {
      sendMail: async (opts) => {
        console.log(`\n[EMAIL SIMULADO] Para: ${opts.to}`);
        console.log(`  Assunto: ${opts.subject}`);
        console.log(`  ${opts.text}\n`);
      },
    };
  }

  return transporter;
}

export async function sendResetEmail(email, name, resetLink) {
  const from = process.env.SMTP_FROM || 'naoresponda@ateliesantoterco.com.br';
  const subject = 'Redefinição de senha - Ateliê Santo Terço';
  const text = `Olá ${name},\n\nVocê solicitou a redefinição da sua senha.\n\nClique no link abaixo para criar uma nova senha:\n${resetLink}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta alteração, ignore este email.\n\nAtenciosamente,\nAteliê Santo Terço`;

  try {
    const info = await getTransporter().sendMail({ from, to: email, subject, text });
    console.log('[EMAIL] Enviado para', email, '| ID:', info.messageId);
  } catch (err) {
    console.error('[EMAIL] Erro ao enviar para', email, ':', err.message);
    console.log(`[EMAIL SIMULADO] Link para ${email}: ${resetLink}`);
  }
}
