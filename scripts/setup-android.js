const { execSync } = require("child_process");
try {
  console.log("Setting up ADB reverse...");
  execSync("adb reverse tcp:4000 tcp:4000",{stdio:"inherit"});
  console.log("ADB reverse complete.");
} catch {
  console.error("ADB reverse failed.");
}
