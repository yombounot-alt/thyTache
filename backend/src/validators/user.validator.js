const { body, param, query } = require('express-validator');
const validate = require('./validate');

const userIdParam = param('id').isMongoId().withMessage('Identifiant utilisateur invalide');
const roleField = body('role').isIn(['admin', 'manager', 'member']).withMessage('Rôle utilisateur invalide');

const userListValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('role').optional().isIn(['admin', 'manager', 'member']),
  query('status').optional().isIn(['active', 'inactive']),
  validate,
];

const createUserValidator = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('Prénom invalide'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Nom invalide'),
  body('email').trim().isEmail().withMessage('Adresse e-mail invalide').customSanitizer((value) => value.toLowerCase()),
  roleField,
  validate,
];

const updateUserValidator = [
  userIdParam,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Prénom invalide'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Nom invalide'),
  body('email').optional().trim().isEmail().withMessage('Adresse e-mail invalide').customSanitizer((value) => value.toLowerCase()),
  body('phone').optional({ nullable: true }).isString().isLength({ max: 30 }),
  body('avatarUrl').optional({ nullable: true }).isURL().isLength({ max: 500 }),
  body('preferences').optional().isObject(),
  validate,
];

const roleValidator = [userIdParam, roleField, validate];
const statusValidator = [userIdParam, body('isActive').isBoolean().withMessage('Le statut est invalide'), validate];
const idValidator = [userIdParam, validate];
const resetPasswordValidator = [userIdParam, validate];

module.exports = { userListValidator, createUserValidator, updateUserValidator, roleValidator, statusValidator, idValidator, resetPasswordValidator };