const { param } = require('express-validator');
const validate = require('./validate');

const notificationIdValidator = [
  param('id').isMongoId().withMessage('Identifiant de notification invalide'),
  validate,
];

module.exports = { notificationIdValidator };
