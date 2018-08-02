import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

module.exports.winston = winston.createLogger({
  level: 'silly',
  colorize: true,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => {
          let other = info.results || info.error || '';
          other = other ? JSON.stringify(other, null, 4) : '';
          return `${info.timestamp} [${info.label}] ${info.level}: ${
            info.message
          } ${other}`;
        })
      )
    }),
    new DailyRotateFile({
      filename: 'src/logging/logs/%DATE%.log',
      datePattern: 'DD-MM-YYYY',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => {
          let other = info.results || info.error || '';
          other = other ? JSON.stringify(other, null, 4) : '';
          return `${info.timestamp} [${info.label}] ${info.level}: ${
            info.message
          } ${other}`;
        })
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'exceptions.log' })
  ]
});
