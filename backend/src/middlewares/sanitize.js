/**
 * Sanitization légère et générique des entrées (body/query/params) :
 * suppression des octets nuls et des espaces superflus. Ne remplace pas la
 * validation métier (voir src/validators) ni les requêtes paramétrées côté base de données.
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value.replace(/\0/g, '').trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return sanitizeObject(value);
  }

  return value;
}

function sanitizeObject(obj) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = sanitizeValue(val);
  }
  return result;
}

// Mutation en place plutôt que réassignation : req.query est un getter en lecture
// seule sous Express 5, et req.body/req.params peuvent aussi être non réassignables
// selon le middleware amont.
function sanitizeInPlace(target) {
  if (!target || typeof target !== 'object') return;
  for (const key of Object.keys(target)) {
    target[key] = sanitizeValue(target[key]);
  }
}

function sanitizeInputs(req, _res, next) {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params);
  sanitizeInPlace(req.query);
  next();
}

module.exports = sanitizeInputs;
