require("dotenv").config();

const path = require("path");

const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

const scanRoutes =
    require("./routes/scanRoutes");

const errorHandler =
    require("./middleware/errorHandler");

const app = express();

const PORT =
    process.env.PORT || 4000;

app.use(helmet());

app.use(cors({

    origin:

        process.env.CORS_ORIGIN ||

        "*"

}));

app.use(morgan("dev"));

app.use(express.json({

    limit: "5mb"

}));

app.use(

    "/files",

    express.static(

        path.join(

            __dirname,

            "storage"

        )

    )

);

app.use(

    "/api",

    scanRoutes

);

app.use(

    errorHandler

);

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `🚀 Dissectra Backend running on port ${PORT}`
        );
    }
);