const jwt = require("jsonwebtoken");

const User = require("../models/User");

async function authMiddleware(
    req,
    res,
    next,
) {

    try {

        const authorization =
            req.headers.authorization;

        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                error: "Authorization token missing.",

            });

        }

        const token =
            authorization.substring(7);

        const payload =
            jwt.verify(

                token,

                process.env.JWT_SECRET,

            );

        const user =
            await User.findById(
                payload.userId,
            );

        if (!user) {

            return res.status(401).json({

                success: false,

                error: "User not found.",

            });

        }

        req.user = user;

        next();

    }

    catch (err) {

        return res.status(401).json({

            success: false,

            error: "Invalid or expired token.",

        });

    }

}

module.exports =
    authMiddleware;