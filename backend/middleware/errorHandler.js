const logger =
    require("../utils/logger");

function errorHandler(
    err,
    _req,
    res,
    _next,
) {

    const status =

        err.statusCode ||

        err.status ||

        500;

    logger.error(

        err.message,

        err.stack,

    );

    res.status(status).json({

        success: false,

        error:

            process.env.NODE_ENV === "production"

                ? (

                    status >= 500

                        ? "Internal Server Error"

                        : err.message

                )

                : err.message,

    });

}

module.exports =
    errorHandler;