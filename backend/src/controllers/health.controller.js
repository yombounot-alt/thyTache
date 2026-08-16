const { env } = require('../config/env');
const { sendSuccess } = require('../utils/apiResponse');
const { getConnectionStatus } = require('../config/database');

function getHealth(_req, res) {
  sendSuccess(res, {
    message: 'API opérationnelle',
    data: {
      environment: env.nodeEnv,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: getConnectionStatus(),
      },
    },
  });
}

module.exports = { getHealth };
