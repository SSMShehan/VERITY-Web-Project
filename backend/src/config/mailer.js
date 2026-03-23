const nodemailer = require("nodemailer");

const getMailerConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    from,
  };
};

const createTransport = () => {
  const config = getMailerConfig();
  if (!config) return null;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  const config = getMailerConfig();
  const transport = createTransport();

  if (!config || !transport) {
    return {
      sent: false,
      reason: "SMTP is not configured",
    };
  }

  await transport.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });

  return {
    sent: true,
  };
};

module.exports = {
  sendMail,
};
