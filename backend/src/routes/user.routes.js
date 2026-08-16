const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const userController = require('../controllers/user.controller');

const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Liste les utilisateurs (annuaire minimal pour affichage des noms/assignations)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non authentifié
 */
router.get('/users', authenticate, userController.listUsers);

module.exports = router;
