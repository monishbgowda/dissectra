const { spawn } = require("child_process");

console.log("[Metro] Starting...");

spawn("npx",["react-native","start","--reset-cache"],{
  stdio:"inherit",
  shell:true
});
