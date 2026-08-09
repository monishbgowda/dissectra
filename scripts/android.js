const { execSync, spawn } = require("child_process");

try{
  console.log("[ADB] Setting up reverse...");
  execSync("adb reverse tcp:4000 tcp:4000",{stdio:"inherit"});
}catch(e){
  console.log("[ADB] Reverse failed.");
}

console.log("[Android] Building app...");

spawn("npx",["react-native","run-android"],{
  stdio:"inherit",
  shell:true
});
