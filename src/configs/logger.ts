import winston from 'winston';


import config from "./config";

const logLevels = {
  error: 0, // highest priority
  warning: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logger = winston.createLogger({
  levels: logLevels,
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    winston.format.printf(
      ({ timestamp, level, message, logMetadata, stack }) => {
        return `${timestamp} ${level}: ${logMetadata || ""} ${message} ${stack || ""}`;
      },
    ),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;


// const isDev = process.env.NODE_ENV !== 'production';

// const devFormat = winston.format.combine(
//   winston.format.colorize(),
//   winston.format.timestamp(),
//   winston.format.printf(({ level, message, timestamp, ...meta }) => {
//     const metaString = Object.keys(meta).length
//       ? JSON.stringify(meta, null, 2)
//       : '';
//     return `[${timestamp}] [${level}]: ${message} ${metaString}`;
//   }),
// );

// const prodFormat = winston.format.json();

// export const logger = winston.createLogger({
//   level: isDev ? 'debug' : 'info',
//   format: isDev ? devFormat : prodFormat,
//   transports: [new winston.transports.Console()],
// });