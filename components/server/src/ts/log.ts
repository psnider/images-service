import pino = require('pino')
export {Logger} from 'pino'
var enable_logging = (process.env.DISABLE_LOGGING == null) || ((process.env.DISABLE_LOGGING.toLowerCase() !== 'true') && (process.env.DISABLE_LOGGING !== '1'))
export var log: pino.Logger = pino({name: 'images', enabled: enable_logging})

