const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const { authLimiter } = require('../middlewares/rateLimiters');
const {
  registerValidator,
  verifyEmailValidator,
  resendOtpValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Inscription d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string, example: Lamah }
 *               lastName: { type: string, example: Foromo }
 *               email: { type: string, example: lamah@example.com }
 *               password: { type: string, example: MotDePasseSecurise123! }
 *     responses:
 *       201:
 *         description: Compte créé, OTP envoyé par e-mail
 *       409:
 *         description: Adresse e-mail déjà utilisée
 *       422:
 *         description: Données invalides
 */
router.post('/auth/register', authLimiter, registerValidator, authController.register);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Vérifie l'adresse e-mail via le code OTP reçu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, example: lamah@example.com }
 *               otp: { type: string, example: "483921" }
 *     responses:
 *       200:
 *         description: E-mail vérifié
 *       400:
 *         description: Code invalide, expiré ou incorrect
 */
router.post('/auth/verify-email', authLimiter, verifyEmailValidator, authController.verifyEmail);

/**
 * @openapi
 * /auth/resend-otp:
 *   post:
 *     summary: Renvoie un nouveau code de vérification d'e-mail
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: lamah@example.com }
 *     responses:
 *       200:
 *         description: Réponse neutre (n'indique pas si le compte existe)
 *       400:
 *         description: Délai anti-abus non écoulé
 */
router.post('/auth/resend-otp', authLimiter, resendOtpValidator, authController.resendOtp);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion (retourne un access token et un refresh token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: lamah@example.com }
 *               password: { type: string, example: MotDePasseSecurise123! }
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 *       403:
 *         description: Compte désactivé ou e-mail non vérifié
 */
router.post('/auth/login', authLimiter, loginValidator, authController.login);

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Génère un nouvel access token à partir d'un refresh token valide (avec rotation)
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string, description: "Optionnel si envoyé via cookie httpOnly" }
 *     responses:
 *       200:
 *         description: Nouveau couple de tokens
 *       401:
 *         description: Refresh token manquant, invalide, expiré ou révoqué
 */
router.post('/auth/refresh-token', authController.refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Déconnexion (révoque le refresh token et supprime le cookie associé)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/auth/logout', authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Retourne l'utilisateur actuellement authentifié
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur courant
 *       401:
 *         description: Non authentifié
 */
router.get('/auth/me', authenticate, authController.me);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Déclenche l'envoi d'un code de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: lamah@example.com }
 *     responses:
 *       200:
 *         description: Réponse neutre (n'indique jamais si l'adresse existe)
 */
router.post('/auth/forgot-password', authLimiter, forgotPasswordValidator, authController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe à l'aide du code OTP reçu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email: { type: string, example: lamah@example.com }
 *               otp: { type: string, example: "483921" }
 *               newPassword: { type: string, example: NouveauMotDePasse456! }
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé
 *       400:
 *         description: Code invalide, expiré ou incorrect
 */
router.post('/auth/reset-password', authLimiter, resetPasswordValidator, authController.resetPassword);

/**
 * @openapi
 * /auth/change-password:
 *   patch:
 *     summary: Change le mot de passe de l'utilisateur authentifié
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, example: AncienMotDePasse123! }
 *               newPassword: { type: string, example: NouveauMotDePasse456! }
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 *       400:
 *         description: Mot de passe actuel incorrect
 *       401:
 *         description: Non authentifié
 */
router.patch('/auth/change-password', authenticate, changePasswordValidator, authController.changePassword);

module.exports = router;
