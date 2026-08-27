const cron = require('node-cron');
const { env } = require('./env');
const logger = require('./logger');
const { checkOverdueTasks } = require('../jobs/overdueTasks.job');
const { sendWeeklyDigests } = require('../jobs/weeklyDigest.job');

// Ne tourne jamais pendant la suite Jest : les tests chargent `app.js`
// directement (jamais `server.js`, qui est le seul appelant de cette
// fonction), donc ce garde-fou est surtout défensif — même principe que
// `skip: () => env.isTest` déjà utilisé sur les rate limiters.
function startScheduler() {
  if (env.isTest) return;

  // Tous les jours à 8h : notifie une fois chaque tâche qui vient de passer en retard.
  cron.schedule('0 8 * * *', () => {
    checkOverdueTasks().catch((error) => logger.error(`Échec de la vérification des tâches en retard: ${error.message}`));
  });

  // Tous les lundis à 8h : résumé hebdomadaire par e-mail.
  cron.schedule('0 8 * * 1', () => {
    sendWeeklyDigests().catch((error) => logger.error(`Échec de l'envoi des résumés hebdomadaires: ${error.message}`));
  });

  // Vérification immédiate au démarrage, pour ne pas attendre 8h en dev —
  // seulement pour les tâches en retard : lancer aussi le résumé hebdomadaire
  // ici enverrait un e-mail à chaque redémarrage du serveur.
  checkOverdueTasks().catch((error) =>
    logger.error(`Échec de la vérification initiale des tâches en retard: ${error.message}`)
  );

  logger.info('Planificateur démarré (tâches en retard : quotidien 8h · résumé hebdo : lundi 8h)');
}

module.exports = { startScheduler };
