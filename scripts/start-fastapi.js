const http = require("http");
const path = require("path");
const { exec } = require("child_process");

function startFastApiServer() {
    const checkReq = http.get("http://127.0.0.1:8000/health", (res) => {
        if (res.statusCode === 200) {
            console.log("✅ FastAPI CNN Server is already active on port 8000");
        }
    });

    checkReq.on("error", () => {
        console.log("🚀 Auto-starting FastAPI CNN Server on port 8000...");
        const cnnDir = path.join(__dirname, "..", "cnn_model").replace(/\\/g, "/");

        const psCmd = `powershell -Command "Start-Process python -ArgumentList '-m uvicorn main:app --host 0.0.0.0 --port 8000' -WorkingDirectory '${cnnDir}' -WindowStyle Hidden"`;

        exec(psCmd, (err) => {
            if (err) {
                console.error("❌ Failed to launch FastAPI server:", err.message);
            } else {
                console.log("✅ Background FastAPI process successfully launched on port 8000");
            }
        });
    });
}

startFastApiServer();
