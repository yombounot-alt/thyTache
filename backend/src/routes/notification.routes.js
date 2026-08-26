const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const { notificationIdValidator } = require('../validators/notification.validator');
const notificationController = require('../controllers/notification.controller');

const router = Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Liste les notifications de l'utilisateur connecté (les plus récentes en premier)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *       401:
 *         description: Non authentifié
 */
router.get('/notifications', authenticate, notificationController.listNotifications);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     summary: Marque toutes les notifications de l'utilisateur connecté comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marquées comme lues
 */
router.patch('/notifications/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marque une notification comme lue (propriétaire uniquement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification mise à jour
 *       404:
 *         description: Notification introuvable (ou non accessible)
 */
router.patch('/notifications/:id/read', authenticate, notificationIdValidator, notificationController.markAsRead);

module.exports = router;
