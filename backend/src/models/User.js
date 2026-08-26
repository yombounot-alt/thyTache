const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../utils/password');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, 'Adresse e-mail invalide'],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    // 'user' est conservé uniquement pour compatibilité avec les documents
    // existants créés avant l'introduction des rôles 'member'/'manager'
    // (voir normalizeRole côté user.service.js) ; les nouveaux comptes
    // utilisent directement 'member'.
    role: {
      type: String,
      enum: ['user', 'member', 'manager', 'admin'],
      default: 'member',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    phone: { type: String, trim: true, maxlength: 30, default: null },
    avatarUrl: { type: String, trim: true, maxlength: 500, default: null },
    preferences: {
      darkMode: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash centralisé : couvre à la fois la création (register) et les mises à jour
// (reset/change password), qui passent toutes par `user.password = ...; user.save()`.
// Style promesse (pas de paramètre `next`) : Mongoose 8+ ne transmet pas de
// callback aux hooks déclarés `async`, l'appeler provoquerait "next is not a function".
userSchema.pre('save', async function hashPasswordBeforeSave() {
  if (!this.isModified('password')) return;
  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = function comparePasswordMethod(candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
