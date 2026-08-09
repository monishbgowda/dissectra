const { execSync, spawn } = require("child_process");

const PACKAGE = "com.dissectra"; // <-- replace with your package name

try {
    const pid = execSync(
        `adb shell pidof ${PACKAGE}`
    ).toString().trim();

    console.log(`Dissectra PID: ${pid}`);

    spawn(
        "adb",
        ["logcat", `--pid=${pid}`],
        {
            stdio: "inherit",
            shell: true,
        }
    );

} catch {
    console.log("Dissectra is not running.");
}