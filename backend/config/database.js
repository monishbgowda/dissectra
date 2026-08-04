const mongoose = require("mongoose");

async function connectDatabase() {

    try {

        await mongoose.connect(

            process.env.MONGODB_URI,

            {

                serverSelectionTimeoutMS: 30000,

                socketTimeoutMS: 45000,

                maxPoolSize: 10,

            },

        );

        console.log("MongoDB Connected");

    }

    catch (err) {
mongoose.connection.on("disconnected", () => {
    console.log("MongoDB Disconnected");
});

mongoose.connection.on("error", (err) => {
    console.error("MongoDB Error:", err);
});

        process.exit(1);

    }

}

module.exports = {
    connectDatabase,
};