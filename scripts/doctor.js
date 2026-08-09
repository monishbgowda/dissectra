const {execSync}=require("child_process");
["node -v","adb version","adb devices"].forEach(c=>{
try{console.log(execSync(c).toString())}catch(e){console.log("Failed:",c)}
});
