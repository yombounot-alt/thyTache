const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const userRoutes = require('./user.routes');

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(taskRoutes);
router.use(userRoutes);

module.exports = router;
