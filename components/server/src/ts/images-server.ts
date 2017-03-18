import express = require('express')
import {get as getConfig} from '@sabbatical/configure-local'
import {getGitCommitID} from '@sabbatical/git-get-commit-id'
import {dropRootPrivileges} from '@sabbatical/drop-root-privileges'
import {log} from './log'
import {ServerStatus, udpateServerStatus}  from '@sabbatical/server-status'



const VERSION = require(`${process.cwd()}/package.json`).version


let server_status: ServerStatus = {
    server_name: 'images-server',
    version: VERSION,
    git_commit_id: null,
    latest_restart: new Date(),
    server_uptime: null,
    current_rss_memory_mb: 0,
    max_rss_memory_mb: 0,
    current_heapUsed_memory_mb: 0,
    max_heapUsed_memory_mb: 0
}
// init the git_commit_id, not caring that it is null for a short period
getGitCommitID((error, result) => {
    if (!error) {
        server_status.git_commit_id = result.id
    } else {
        throw error
    }
})


function shutdown(reason: string | Error) {
    let fname = 'shutdown'
    var succeeded = true
    if (typeof reason !== 'string') {
        succeeded = false
        log.error({fname, reason})
    } else {
        log.info({fname, reason})
    }
    log.info('======== CLEANING UP SERVER ========')
    // handle the error safely
    // safely shut-down other services, none as of Dec 12, 2016
    log.info('======== EXITING ========')
    process.exit(succeeded ? 0 : 1)
}


process.on('uncaughtException', shutdown)
process.on('SIGINT', () => {
    shutdown('Received SIGINT')
})
process.on('SIGTERM', () => {
    shutdown('Received SIGTERM')
})



function handleGetServerStatus(req, res) {
    log.info({fname: 'handleGetServerStatus'})
    udpateServerStatus(server_status)
    res.json(server_status)
}



// this app must run on a fire-walled (protected) port
export function create() {
    const IMAGE_SERVICE_CONFIG = getConfig('image-service')
    var app = express()
    app.post(IMAGE_SERVICE_CONFIG.get_status_api_url_path_prefix, handleGetServerStatus)
    app.use(IMAGE_SERVICE_CONFIG.api_url_path_prefix, express.static(IMAGE_SERVICE_CONFIG.images_root))

    // start the server after all data APIs have connected
    log.info(`images-server listening on port=${IMAGE_SERVICE_CONFIG.api_port}`)
    app.listen(IMAGE_SERVICE_CONFIG.api_port, () => {
        dropRootPrivileges(IMAGE_SERVICE_CONFIG, log)
    })
    return app
}


log.info({version: VERSION})
var image_app = create()
