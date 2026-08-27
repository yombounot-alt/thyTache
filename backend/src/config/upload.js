const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { BadRequestError } = require('../errors');

const AVATAR_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const ALLOWED_AVATAR_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${ALLOWED_AVATAR_TYPES[file.mimetype]}`);
  },
});

const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_AVATAR_TYPES[file.mimetype]) {
      return cb(new BadRequestError("Format d'image non supporté (jpeg, png ou webp uniquement)"));
    }
    cb(null, true);
  },
});

// Best-effort : supprime l'ancien fichier d'avatar lors d'un remplacement.
// N'agit que sur nos propres fichiers locaux (jamais sur une URL externe),
// et ne doit jamais faire échouer la requête si la suppression rate.
function deleteLocalAvatar(avatarUrl) {
  if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) return;
  const filePath = path.join(AVATAR_DIR, path.basename(avatarUrl));
  fs.unlink(filePath, () => {});
}

module.exports = { avatarUpload, deleteLocalAvatar, AVATAR_DIR };
