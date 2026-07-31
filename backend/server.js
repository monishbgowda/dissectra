require("dotenv").config();

const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

const scanRoutes =
    require("./routes/scanRoutes");

const errorHandler =
    require("./middleware/errorHandler");

// Auto-launch FastAPI CNN server on port 8000 if not already running
function ensureFastApiServer() {
    const checkReq = http.get("http://127.0.0.1:8000/health", (res) => {
        if (res.statusCode === 200) {
            console.log("✅ FastAPI CNN server is active on port 8000");
        }
    });

    checkReq.on("error", () => {
        console.log("🚀 Auto-launching FastAPI CNN server on port 8000...");
        const cnnDir = path.join(__dirname, "..", "cnn_model").replace(/\\/g, "/");
        const psCmd = `powershell -Command "Start-Process python -ArgumentList '-m uvicorn main:app --host 0.0.0.0 --port 8000' -WorkingDirectory '${cnnDir}' -WindowStyle Hidden"`;

        const { exec } = require("child_process");
        exec(psCmd, (err) => {
            if (err) {
                console.error("❌ Failed to start FastAPI server:", err.message);
            } else {
                console.log("✅ FastAPI CNN server launched on port 8000");
            }
        });
    });
}

ensureFastApiServer();

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