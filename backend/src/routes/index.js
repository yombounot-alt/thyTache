const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const userRoutes = require('./user.routes');
const notificationRoutes = require('./notification.routes');

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(taskRoutes);
router.use(userRoutes);
router.use(notificationRoutes);

module.exports = router;
