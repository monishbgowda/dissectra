const { execSync, spawn } = require("child_process");
try{execSync("taskkill /F /IM node.exe",{stdio:"ignore"});}catch{}
try{execSync("adb reverse tcp:4000 tcp:4000",{stdio:"inherit"});}catch{}
spawn("node",["scripts/start-fastapi.js"],{stdio:"inherit",shell:true});
spawn("npx",["react-native","start","--reset-cache"],{stdio:"inherit",shell:true});
