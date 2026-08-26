const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const {
  createTaskValidator,
  listTasksValidator,
  taskIdValidator,
  updateTaskValidator,
  addCommentValidator,
  addAttachmentValidator,
  evolutionQueryValidator,
  activityQueryValidator,
} = require('../validators/task.validator');
const taskController = require('../controllers/task.controller');

const router = Router();

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Liste les tâches de l'utilisateur connecté (créateur ou assigné)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: sortDir
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: status
 *         schema: { type: array, items: { type: string } }
 *       - in: query
 *         name: priority
 *         schema: { type: array, items: { type: string } }
 *       - in: query
 *         name: category
 *         schema: { type: array, items: { type: string } }
 *       - in: query
 *         name: assigneeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des tâches
 *       401:
 *         description: Non authentifié
 *       422:
 *         description: Paramètres de requête invalides
 */
router.get('/tasks', authenticate, listTasksValidator, taskController.listTasks);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Crée une nouvelle tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category]
 *             properties:
 *               title: { type: string, example: "Préparer la démo client" }
 *               description: { type: string, example: "Préparer le support de démonstration pour le client X" }
 *               category: { type: string, example: development }
 *               priority: { type: string, example: medium }
 *               assigneeId: { type: string, nullable: true, example: "6512f1..." }
 *               dueDate: { type: string, format: date-time, nullable: true }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Tâche créée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: assigneeId différent de l'utilisateur connecté
 *       404:
 *         description: Utilisateur assigné introuvable
 *       422:
 *         description: Données invalides
 */
router.post('/tasks', authenticate, createTaskValidator, taskController.createTask);

// Routes statiques enregistrées AVANT /tasks/:id, sinon Express interpréterait
// "stats", "evolution", etc. comme une valeur du paramètre :id.

/**
 * @openapi
 * /tasks/stats:
 *   get:
 *     summary: Statistiques agrégées sur les tâches de l'utilisateur connecté
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques (total, terminées, en cours, en attente, en retard)
 */
router.get('/tasks/stats', authenticate, taskController.getStats);

/**
 * @openapi
 * /tasks/evolution:
 *   get:
 *     summary: Évolution du nombre de tâches créées/terminées par jour
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 14 }
 *     responses:
 *       200:
 *         description: Série temporelle { date, created, completed }
 */
router.get('/tasks/evolution', authenticate, evolutionQueryValidator, taskController.getEvolution);

/**
 * @openapi
 * /tasks/status-distribution:
 *   get:
 *     summary: Répartition des tâches par statut
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste { status, count }
 */
router.get('/tasks/status-distribution', authenticate, taskController.getStatusDistribution);

/**
 * @openapi
 * /tasks/assignees-distribution:
 *   get:
 *     summary: Répartition des tâches par assigné
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste { userId, count }
 */
router.get('/tasks/assignees-distribution', authenticate, taskController.getAssigneeDistribution);

/**
 * @openapi
 * /tasks/activity:
 *   get:
 *     summary: Activité récente (historique) sur les tâches de l'utilisateur connecté
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 8 }
 *     responses:
 *       200:
 *         description: Liste des entrées d'historique les plus récentes, tous statuts confondus
 */
router.get('/tasks/activity', authenticate, activityQueryValidator, taskController.getRecentActivity);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Détail d'une tâche (créateur ou assigné uniquement)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Détail de la tâche
 *       404:
 *         description: Tâche introuvable (ou non accessible)
 */
router.get('/tasks/:id', authenticate, taskIdValidator, taskController.getTask);

/**
 * @openapi
 * /tasks/{id}:
 *   patch:
 *     summary: Met à jour une tâche (créateur ou assigné uniquement)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               priority: { type: string }
 *               status: { type: string }
 *               progress: { type: integer }
 *               assigneeId: { type: string, nullable: true }
 *               dueDate: { type: string, format: date-time, nullable: true }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Tâche mise à jour
 *       403:
 *         description: assigneeId différent de l'utilisateur connecté
 *       404:
 *         description: Tâche introuvable (ou non accessible)
 *       422:
 *         description: Données invalides
 */
router.patch('/tasks/:id', authenticate, updateTaskValidator, taskController.updateTask);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Supprime une tâche (créateur uniquement)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tâche supprimée
 *       404:
 *         description: Tâche introuvable (ou non accessible)
 */
router.delete('/tasks/:id', authenticate, taskIdValidator, taskController.deleteTask);

/**
 * @openapi
 * /tasks/{id}/comments:
 *   post:
 *     summary: Ajoute un commentaire à une tâche (créateur ou assigné uniquement)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Commentaire ajouté, tâche retournée avec le commentaire
 *       404:
 *         description: Tâche introuvable (ou non accessible)
 */
router.post('/tasks/:id/comments', authenticate, addCommentValidator, taskController.addComment);

/**
 * @openapi
 * /tasks/{id}/attachments:
 *   post:
 *     summary: Ajoute une pièce jointe (métadonnées uniquement, pas d'upload réel) à une tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sizeKb, type]
 *             properties:
 *               name: { type: string }
 *               sizeKb: { type: number }
 *               type: { type: string }
 *     responses:
 *       201:
 *         description: Pièce jointe ajoutée, tâche retournée avec la pièce jointe
 *       404:
 *         description: Tâche introuvable (ou non accessible)
 */
router.post('/tasks/:id/attachments', authenticate, addAttachmentValidator, taskController.addAttachment);

module.exports = router;
