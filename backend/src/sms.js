import twilio from 'twilio';

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export function sendSMS(to, message) {
  const client = getClient();
  if (!client) {
    console.log('=== SMS (não enviado - configure TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN) ===');
    console.log(`Para: ${to}`);
    console.log(`Mensagem: ${message}`);
    console.log('========================================');
    return Promise.resolve({ simulated: true });
  }
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    console.warn('TWILIO_PHONE_NUMBER não configurado');
    return Promise.resolve({ simulated: true });
  }
  return client.messages.create({ to, from, body: message });
}
