const { body } = require('express-validator');
const validate = require('./validate');

// Minimum 8 caractères, au moins une majuscule, une minuscule, un chiffre et un caractère spécial.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z\s]).{8,}$/;

const emailField = body('email')
  .trim()
  .notEmpty()
  .withMessage("L'adresse e-mail est requise")
  .bail()
  .isEmail()
  .withMessage('Adresse e-mail invalide')
  .bail()
  .customSanitizer((value) => value.toLowerCase());

const otpField = body('otp')
  .trim()
  .notEmpty()
  .withMessage('Le code de vérification est requis')
  .bail()
  .isLength({ min: 6, max: 6 })
  .withMessage('Le code doit contenir exactement 6 chiffres')
  .bail()
  .isNumeric()
  .withMessage('Le code doit contenir uniquement des chiffres');

function passwordField(fieldName, label) {
  return body(fieldName)
    .notEmpty()
    .withMessage(`${label} est requis`)
    .bail()
    .isLength({ min: 8 })
    .withMessage(`${label} doit contenir au moins 8 caractères`)
    .bail()
    .matches(PASSWORD_REGEX)
    .withMessage(`${label} doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial`);
}

function nameField(fieldName, label) {
  return body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${label} est requis`)
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${label} doit contenir entre 2 et 50 caractères`);
}

const registerValidator = [
  nameField('firstName', 'Le prénom'),
  nameField('lastName', 'Le nom'),
  emailField,
  passwordField('password', 'Le mot de passe'),
  validate,
];

const verifyEmailValidator = [emailField, otpField, validate];

const resendOtpValidator = [emailField, validate];

const loginValidator = [emailField, body('password').notEmpty().withMessage('Le mot de passe est requis'), validate];

const forgotPasswordValidator = [emailField, validate];

const resetPasswordValidator = [emailField, otpField, passwordField('newPassword', 'Le nouveau mot de passe'), validate];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  passwordField('newPassword', 'Le nouveau mot de passe'),
  validate,
];

module.exports = {
  registerValidator,
  verifyEmailValidator,
  resendOtpValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
