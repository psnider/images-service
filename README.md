# images-service

A simple REST images-service.


## URLs

- /api/image/IMAGE-RESOURCE-ID  
where the IMAGE-RESOUCE-ID gives the name of an image file.

# build
```
npm run build
```

# test
There are no tests yet.

# deployment

## this module
If running this server from a module directly from the git workspace, run the server with:
> node generated/images-server.js


## as a dependent module
If running this server from a module installed as an npm package, run the server with:
> node node_modules/@sabbatical/images-service/generated/images-server.js



