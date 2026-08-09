const {execSync}=require("child_process");
try{execSync("taskkill /F /IM node.exe",{stdio:"ignore"});}catch{}
console.log("Done.");
