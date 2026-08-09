const { spawn } = require("child_process");

// CHANGE THIS to match your backend start command.
const backendCommand = "npm";
const backendArgs = ["run","backend"];

console.log("[Backend] Starting...");

const p = spawn(backendCommand, backendArgs,{
  stdio:"inherit",
  shell:true
});

p.on("exit",(code)=>{
  console.log(`[Backend] exited with code ${code}`);
});
