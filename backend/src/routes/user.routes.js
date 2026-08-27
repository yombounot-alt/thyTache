const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { avatarUpload } = require('../config/upload');
const userController = require('../controllers/user.controller');
const validators = require('../validators/user.validator');

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
router.get('/users', authenticate, validators.userListValidator, userController.listUsers);
router.get('/users/:id', authenticate, validators.idValidator, userController.getUser);
router.post('/users', authenticate, authorize('admin'), validators.createUserValidator, userController.createUser);
// Pas de authorize('admin') ici : un utilisateur peut modifier son propre
// profil, la distinction self/admin se fait dans le contrôleur.
router.patch('/users/:id', authenticate, validators.updateUserValidator, userController.updateUser);
router.post('/users/me/avatar', authenticate, avatarUpload.single('avatar'), userController.uploadAvatar);
router.delete('/users/:id', authenticate, authorize('admin'), validators.idValidator, userController.deleteUser);
router.patch('/users/:id/status', authenticate, authorize('admin'), validators.statusValidator, userController.setStatus);
router.patch('/users/:id/role', authenticate, authorize('admin'), validators.roleValidator, userController.setRole);
router.post('/users/:id/reset-password', authenticate, authorize('admin'), validators.resetPasswordValidator, userController.resetPassword);

module.exports = router;
