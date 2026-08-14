const nodemailer = require('nodemailer');
const { decrypt } = require('./cryptoService');

function createTransporter(smtpConfig) {
  let decryptedPassword = smtpConfig.smtp_password;
  try {
    decryptedPassword = decrypt(smtpConfig.smtp_password);
  } catch (err) {
    console.log('[EmailService] Decrypt warning, using raw password:', err.message);
  }

  const port = parseInt(smtpConfig.smtp_port, 10) || 587;
  const isSecure = smtpConfig.encryption === 'ssl' || port === 465;

  return nodemailer.createTransport({
    host: smtpConfig.smtp_host,
    port: port,
    secure: isSecure,
    auth: {
      user: smtpConfig.smtp_username,
      pass: decryptedPassword,
    },
    connectionTimeout: 10000, // 10 second timeout
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function verifyConnection(smtpConfig) {
  if (!smtpConfig.smtp_host || !smtpConfig.smtp_username) {
    throw new Error('SMTP Host and Username are required');
  }
  const transporter = createTransporter(smtpConfig);
  return await transporter.verify();
}

async function sendMail(smtpConfig, { to, subject, html, replyTo }) {
  const transporter = createTransporter(smtpConfig);

  const mailOptions = {
    from: `"${smtpConfig.sender_name || 'BulkSend'}" <${smtpConfig.sender_email || smtpConfig.smtp_username}>`,
    to,
    subject,
    html,
    ...(replyTo && { replyTo }),
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { verifyConnection, sendMail };
