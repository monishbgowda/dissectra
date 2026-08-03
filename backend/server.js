const express = require("express");
const cors = require("cors");
const path = require("path");

const config =
    require("./config/config");

const logger =
    require("./utils/logger");

const errorHandler =
    require("./middleware/errorHandler");

const discoveryRoutes =
    require("./routes/discoveryRoutes");

const scanRoutes =
    require("./routes/scanRoutes");



const app =
    express();

/*
|--------------------------------------------------------------------------
| Global Middleware
|--------------------------------------------------------------------------
*/

app.use(

    cors(),

);

app.use(

    express.json({
        limit: "25mb",
    }),

);

app.use(

    express.urlencoded({

        extended: true,

        limit: "25mb",

    }),

);

/*
|--------------------------------------------------------------------------
| Static Assets
|--------------------------------------------------------------------------
*/

app.use(

    "/storage",

    express.static(

        path.join(
            config.uploadRoot,
        ),

    ),

);

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use(

    "/discover",

    discoveryRoutes,

);

app.use(

    "/api",

    scanRoutes,

);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(

    (_req, res) => {

        res.status(404).json({

            success: false,

            error: "Route not found.",

        });

    },

);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(

    errorHandler,

);

/*
|--------------------------------------------------------------------------
| Server Startup
|--------------------------------------------------------------------------
*/

async function startServer() {

    try {

        app.listen(

            config.port,

            () => {

                logger.info(
                    `Dissectra Backend running on port ${config.port}`,
                );

                logger.info(
                    `Environment: ${config.env}`,
                );

            },

        );

    }

    catch (err) {

        logger.error(
            "Server startup failed",
            err,
        );

        process.exit(1);

    }

}

startServer();

module.exports =
    app;