const mongoose = require('mongoose');

/**
 * Codes OTP (vérification e-mail / réinitialisation mot de passe).
 * Le code brut n'est jamais stocké : seul `codeHash` (SHA-256) l'est.
 */
const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL : MongoDB supprime automatiquement le document une fois expiresAt dépassé.
// La logique métier vérifie néanmoins l'expiration explicitement (le TTL monitor
// ne tourne que toutes les ~60s, ce n'est pas une garantie temps réel).
verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationSchema.index({ user: 1, purpose: 1, used: 1 });

module.exports = mongoose.model('Verification', verificationSchema);
