const { spawn }=require("child_process");

spawn("gradlew",["assembleRelease"],{
  cwd:"android",
  stdio:"inherit",
  shell:true
});
