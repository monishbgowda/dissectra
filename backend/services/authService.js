const {

    generateAccessToken,

} = require("../utils/jwt");

const User = require("../models/User");

const {
    verifyGoogleToken,
} = require("./firebaseService");

async function loginWithGoogle(idToken) {

    if (!idToken) {

        throw new Error(
            "Google ID token is required."
        );

    }

    const googleUser =
        await verifyGoogleToken(
            idToken,
        );

    if (!googleUser.emailVerified) {

        throw new Error(
            "Google email is not verified."
        );

    }

    let user =
        await User.findOne({

            googleId:
                googleUser.googleId,

        });

    if (!user) {

        user =
            await User.create({

                googleId:
                    googleUser.googleId,

                email:
                    googleUser.email,

                name:
                    googleUser.name,

                picture:
                    googleUser.picture,

            });

    }

    else {

        user.name =
            googleUser.name;

        user.picture =
            googleUser.picture;

        user.email =
            googleUser.email;

        await user.save();

    }

    const token =
    generateAccessToken(user);

    return {

        token,

        user,

    };

}

module.exports = {

    loginWithGoogle,

};