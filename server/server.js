const Hapi = require('@hapi/hapi');
require('dotenv').config();
const routes = require('./routes');

async function init(){
    const server = Hapi.server({
        host: "0.0.0.0",
        port: process.env.PORT || 3000,
        routes: {
          cors: {
            origin: ['*'],
            additionalHeaders: ['Content-Type']
          }
        },
    })

    server.route(routes);

    await server.start();
    console.log("Server is running on : ",server.info.uri);
}

init();