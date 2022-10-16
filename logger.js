const { format, createLogger, transports }  = require('winston');
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    level: 'debug',
    format: combine(
        timestamp(),
        logFormat,
        format.colorize({ all : true })
    ),
    transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
        new transports.Console({ format: logFormat })
        // new transports.File({ filename: 'logs/error.log', level: 'error' }),
        // new transports.File({ filename: 'logs/combined.log' })
    ]
});

module.exports = logger;