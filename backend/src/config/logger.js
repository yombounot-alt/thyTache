const winston = require('winston');
const { env } = require('./env');

const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.isProduction ? winston.format.json() : winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
      })
    )
  ),
  transports: [new winston.transports.Console()],
  silent: env.isTest,
});

module.exports = logger;
