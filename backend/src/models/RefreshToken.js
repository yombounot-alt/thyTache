const mongoose = require('mongoose');

/**
 * Sessions de refresh token. Seul le hash SHA-256 du token est stocké,
 * jamais sa valeur brute. Un document par appareil/connexion, ce qui
 * permet la révocation individuelle et la gestion multi-sessions.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, revoked: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
