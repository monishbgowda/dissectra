const net=require("net");

function waitForPort(port,host="127.0.0.1"){
  return new Promise(resolve=>{
    const retry=()=>{
      const socket=new net.Socket();

      socket.setTimeout(1000);

      socket.on("connect",()=>{
        socket.destroy();
        resolve();
      });

      socket.on("error",()=>{
        socket.destroy();
        setTimeout(retry,1000);
      });

      socket.on("timeout",()=>{
        socket.destroy();
        setTimeout(retry,1000);
      });

      socket.connect(port,host);
    };

    retry();
  });
}

module.exports={waitForPort};
