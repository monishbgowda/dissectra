const express = require("express");
const os = require("os");

const router = express.Router();

function getLocalIp() {

    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {

        for (const iface of interfaces[name]) {

            if (
                iface.family === "IPv4" &&
                !iface.internal
            ) {

                return iface.address;

            }

        }

    }

    return "127.0.0.1";

}

router.get("/", (_req, res) => {

    res.json({

        name: "Dissectra Backend",

        ip: getLocalIp(),

        port: process.env.PORT || 4000,

        version: "1.0.0",

        status: "online"

    });

});

module.exports = router;