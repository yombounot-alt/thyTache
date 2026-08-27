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

function buildNotificationEmail({ title, message }) {
  const subject = `${env.appName} — ${title}`;
  const text = [message, `Connectez-vous à ${env.appName} pour voir les détails.`].join('\n\n');
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${env.appName}</h2>
      <p style="font-size: 16px; font-weight: 600;">${title}</p>
      <p>${message}</p>
      <p style="color: #888; font-size: 13px;">Connectez-vous à ${env.appName} pour voir les détails.</p>
    </div>
  `;
  return { subject, text, html };
}

// Copie par e-mail d'une notification in-app, envoyée uniquement si
// l'utilisateur a activé la préférence correspondante (cf. notification.service.notify).
async function sendNotificationEmail(to, { title, message }) {
  const { subject, text, html } = buildNotificationEmail({ title, message });
  await sendMail({ to, subject, text, html });
}

function buildWeeklyDigestEmail({ firstName, total, completedThisWeek, createdThisWeek, inProgress, overdue }) {
  const subject = `${env.appName} — Votre résumé hebdomadaire`;
  const rows = [
    ['Tâches terminées cette semaine', completedThisWeek],
    ['Tâches créées cette semaine', createdThisWeek],
    ['Tâches en cours', inProgress],
    ['Tâches en retard', overdue],
    ['Total de vos tâches actives', total],
  ];
  const text = [
    `Bonjour ${firstName},`,
    `Voici votre résumé de la semaine sur ${env.appName} :`,
    ...rows.map(([label, value]) => `- ${label} : ${value}`),
  ].join('\n');
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${env.appName}</h2>
      <p>Bonjour ${firstName},</p>
      <p>Voici votre résumé de la semaine :</p>
      <table style="width: 100%; border-collapse: collapse;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${label}</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${value}</td>
          </tr>`
          )
          .join('')}
      </table>
      <p style="color: #888; font-size: 13px; margin-top: 16px;">Connectez-vous à ${env.appName} pour voir le détail.</p>
    </div>
  `;
  return { subject, text, html };
}

async function sendWeeklyDigestEmail(to, data) {
  const { subject, text, html } = buildWeeklyDigestEmail(data);
  await sendMail({ to, subject, text, html });
}

module.exports = { sendMail, sendOtpEmail, sendNotificationEmail, sendWeeklyDigestEmail, isSmtpConfigured };
