/**
 * Enveloppe un handler async pour transmettre automatiquement les erreurs à next().
 * Express 5 le fait nativement, mais l'enveloppe explicite documente l'intention
 * et garde le code portable si le framework change.
 */
function catchAsync(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;
