const jwt = require("jsonwebtoken");

function generateAccessToken(user) {

    return jwt.sign(

        {

            userId: user._id,

            email: user.email,

        },

        process.env.JWT_SECRET,

        {

            expiresIn: "15m",

        },

    );

}

function verifyAccessToken(token) {

    return jwt.verify(

        token,

        process.env.JWT_SECRET,

    );

}

module.exports = {

    generateAccessToken,

    verifyAccessToken,

};