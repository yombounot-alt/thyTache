const nodemailer = require('nodemailer');
const { env } = require('../config/env');
const logger = require('../config/logger');

let transporter = null;

function isSmtpConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.password);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.password },
    });
  }
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  // La suite Jest ne doit jamais tenter une vraie connexion SMTP (lente,
  // dépendante du réseau, et enverrait de vrais e-mails) — même si un SMTP
  // réel est configuré en local pour les tests manuels dans le navigateur.
  // Même principe que `skip: () => env.isTest` sur les rate limiters.
  if (env.isTest) return;

  if (!isSmtpConfigured()) {
    if (env.isProduction) {
      throw new Error('Configuration SMTP manquante (SMTP_HOST/SMTP_USER/SMTP_PASSWORD)');
    }

    // Mode développement sans SMTP configuré : on ne bloque pas le flux fonctionnel,
    // mais l'e-mail n'est jamais réellement envoyé (jamais exposé dans une réponse HTTP).
    logger.warn(
      `SMTP non configuré : e-mail non envoyé à ${to}. ` +
        'Renseignez SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD dans .env pour activer l\'envoi réel.'
    );
    return;
  }

  await getTransporter().sendMail({ from: env.smtp.from, to, subject, text, html });
}

function buildOtpEmail({ code, purpose }) {
  const label = purpose === 'password_reset' ? 'de réinitialisation de mot de passe' : "de vérification d'e-mail";
  const subject = `${env.appName} — Code ${label}`;
  const text = [
    `Votre code ${label} pour ${env.appName} est : ${code}`,
    `Ce code expire dans ${env.otp.expiresInMinutes} minutes.`,
    'Ne partagez jamais ce code, y compris avec le support technique.',
  ].join('\n');
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${env.appName}</h2>
      <p>Voici votre code ${label} :</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${code}</p>
      <p>Ce code expire dans <strong>${env.otp.expiresInMinutes} minutes</strong>.</p>
      <p style="color: #888;">Ne partagez jamais ce code, y compris avec le support technique.</p>
    </div>
  `;
  return { subject, text, html };
}

function logOtpToConsole(to, code, purpose) {
  const separator = '='.repeat(64);
  logger.info(
    `\n${separator}\n` +
      `  CODE OTP (${purpose.toUpperCase()})\n` +
      `  Destinataire : ${to}\n` +
      `  Code         : ${code}\n` +
      `  Expire dans  : ${env.otp.expiresInMinutes} min\n` +
      separator
  );
}

async function sendOtpEmail(to, code, { purpose }) {
  if (!isSmtpConfigured() && !env.isProduction) {
    // Confort de développement uniquement : jamais exécuté en production,
    // et jamais renvoyé dans une réponse API (voir sendMail ci-dessus).
    logOtpToConsole(to, code, purpose);
  }

  const { subject, text, html } = buildOtpEmail({ code, purpose });
  await sendMail({ to, subject, text, html });
}

module.exports = { sendMail, sendOtpEmail, isSmtpConfigured };
