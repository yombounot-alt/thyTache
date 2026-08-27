const { body, param, query } = require('express-validator');
const validate = require('./validate');
const { TASK_STATUSES, TASK_PRIORITIES, TASK_CATEGORIES } = require('../models/Task');

const taskIdParam = param('id').isMongoId().withMessage('Identifiant de tâche invalide');

const SORTABLE_FIELDS = ['title', 'status', 'priority', 'category', 'createdAt', 'dueDate', 'progress'];

// `scope=all` n'a d'effet que pour un admin (cf. task.service.resolveFilter) ;
// pour tout autre utilisateur la valeur est simplement ignorée côté service.
const scopeQuery = query('scope').optional().isIn(['all', 'mine']).withMessage('scope doit être "all" ou "mine"');

// qs ne renvoie un tableau que si le paramètre apparaît plusieurs fois dans
// l'URL (ex: status=todo&status=done) ; une seule occurrence reste une
// simple chaîne, d'où cette normalisation avant validation du contenu.
function toArray(value) {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

function enumListQuery(field, allowed, label) {
  return query(field)
    .optional()
    .customSanitizer(toArray)
    .custom((value) => value.every((v) => allowed.includes(v)))
    .withMessage(`${label} doit être parmi : ${allowed.join(', ')}`);
}

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est requis')
    .bail()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit contenir entre 3 et 200 caractères'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est requise')
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La description doit contenir entre 10 et 2000 caractères'),

  body('category')
    .notEmpty()
    .withMessage('La catégorie est requise')
    .bail()
    .isIn(TASK_CATEGORIES)
    .withMessage(`La catégorie doit être l'une des suivantes : ${TASK_CATEGORIES.join(', ')}`),

  body('priority')
    .optional()
    .isIn(TASK_PRIORITIES)
    .withMessage(`La priorité doit être l'une des suivantes : ${TASK_PRIORITIES.join(', ')}`),

  body('assigneeId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("L'identifiant de l'assigné est invalide"),

  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('La date limite doit être une date valide'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Les étiquettes doivent être une liste'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Chaque étiquette doit contenir entre 1 et 30 caractères'),

  validate,
];

const listTasksValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un entier positif').toInt(),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('pageSize doit être un entier entre 1 et 100')
    .toInt(),
  query('search').optional().isString().trim(),
  query('sortBy')
    .optional()
    .isIn(SORTABLE_FIELDS)
    .withMessage(`sortBy doit être parmi : ${SORTABLE_FIELDS.join(', ')}`),
  query('sortDir').optional().isIn(['asc', 'desc']).withMessage('sortDir doit être "asc" ou "desc"'),
  query('assigneeId').optional().isMongoId().withMessage("L'identifiant de l'assigné est invalide"),
  scopeQuery,
  enumListQuery('status', TASK_STATUSES, 'status'),
  enumListQuery('priority', TASK_PRIORITIES, 'priority'),
  enumListQuery('category', TASK_CATEGORIES, 'category'),

  validate,
];

const taskIdValidator = [taskIdParam, validate];

const updateTaskValidator = [
  taskIdParam,

  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La description doit contenir entre 10 et 2000 caractères'),

  body('category')
    .optional()
    .isIn(TASK_CATEGORIES)
    .withMessage(`La catégorie doit être l'une des suivantes : ${TASK_CATEGORIES.join(', ')}`),

  body('priority')
    .optional()
    .isIn(TASK_PRIORITIES)
    .withMessage(`La priorité doit être l'une des suivantes : ${TASK_PRIORITIES.join(', ')}`),

  body('status')
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage(`Le statut doit être l'un des suivants : ${TASK_STATUSES.join(', ')}`),

  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('La progression doit être comprise entre 0 et 100'),

  body('assigneeId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("L'identifiant de l'assigné est invalide"),

  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('La date limite doit être une date valide'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Les étiquettes doivent être une liste'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Chaque étiquette doit contenir entre 1 et 30 caractères'),

  validate,
];

const addCommentValidator = [
  taskIdParam,
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Le commentaire ne peut pas être vide')
    .bail()
    .isLength({ max: 2000 })
    .withMessage('Le commentaire est trop long (2000 caractères maximum)'),
  validate,
];

const addAttachmentValidator = [
  taskIdParam,
  body('name').trim().notEmpty().withMessage('Le nom du fichier est requis').isLength({ max: 200 }),
  body('sizeKb').isFloat({ min: 0 }).withMessage('La taille du fichier est invalide'),
  body('type').trim().notEmpty().withMessage('Le type de fichier est requis').isLength({ max: 100 }),
  validate,
];

const evolutionQueryValidator = [
  query('days').optional().isInt({ min: 1, max: 90 }).withMessage('days doit être un entier entre 1 et 90'),
  scopeQuery,
  validate,
];

const activityQueryValidator = [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit doit être un entier entre 1 et 50'),
  scopeQuery,
  validate,
];

const statsQueryValidator = [scopeQuery, validate];

module.exports = {
  createTaskValidator,
  listTasksValidator,
  taskIdValidator,
  updateTaskValidator,
  addCommentValidator,
  addAttachmentValidator,
  statsQueryValidator,
  evolutionQueryValidator,
  activityQueryValidator,
};
