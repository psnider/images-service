"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pino = require("pino");
var enable_logging = (process.env.DISABLE_LOGGING == null) || ((process.env.DISABLE_LOGGING.toLowerCase() !== 'true') && (process.env.DISABLE_LOGGING !== '1'));
exports.log = pino({ name: 'images', enabled: enable_logging });
