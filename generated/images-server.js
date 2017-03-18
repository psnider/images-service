"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const configure_local_1 = require("@sabbatical/configure-local");
const git_get_commit_id_1 = require("@sabbatical/git-get-commit-id");
const drop_root_privileges_1 = require("@sabbatical/drop-root-privileges");
const log_1 = require("./log");
const server_status_1 = require("@sabbatical/server-status");
const VERSION = require(`${process.cwd()}/package.json`).version;
let server_status = {
    server_name: 'images-server',
    version: VERSION,
    git_commit_id: null,
    latest_restart: new Date(),
    server_uptime: null,
    current_rss_memory_mb: 0,
    max_rss_memory_mb: 0,
    current_heapUsed_memory_mb: 0,
    max_heapUsed_memory_mb: 0
};
// init the git_commit_id, not caring that it is null for a short period
git_get_commit_id_1.getGitCommitID((error, result) => {
    if (!error) {
        server_status.git_commit_id = result.id;
    }
    else {
        throw error;
    }
});
function shutdown(reason) {
    let fname = 'shutdown';
    var succeeded = true;
    if (typeof reason !== 'string') {
        succeeded = false;
        log_1.log.error({ fname, reason });
    }
    else {
        log_1.log.info({ fname, reason });
    }
    log_1.log.info('======== CLEANING UP SERVER ========');
    // handle the error safely
    // safely shut-down other services, none as of Dec 12, 2016
    log_1.log.info('======== EXITING ========');
    process.exit(succeeded ? 0 : 1);
}
process.on('uncaughtException', shutdown);
process.on('SIGINT', () => {
    shutdown('Received SIGINT');
});
process.on('SIGTERM', () => {
    shutdown('Received SIGTERM');
});
function handleGetServerStatus(req, res) {
    log_1.log.info({ fname: 'handleGetServerStatus' });
    server_status_1.udpateServerStatus(server_status);
    res.json(server_status);
}
// this app must run on a fire-walled (protected) port
function create() {
    const IMAGE_SERVICE_CONFIG = configure_local_1.get('image-service');
    var app = express();
    app.post(IMAGE_SERVICE_CONFIG.get_status_api_url_path_prefix, handleGetServerStatus);
    app.use(IMAGE_SERVICE_CONFIG.api_url_path_prefix, express.static(IMAGE_SERVICE_CONFIG.images_root));
    // start the server after all data APIs have connected
    log_1.log.info(`images-server listening on port=${IMAGE_SERVICE_CONFIG.api_port}`);
    app.listen(IMAGE_SERVICE_CONFIG.api_port, () => {
        drop_root_privileges_1.dropRootPrivileges(IMAGE_SERVICE_CONFIG, log_1.log);
    });
    return app;
}
exports.create = create;
log_1.log.info({ version: VERSION });
var image_app = create();
