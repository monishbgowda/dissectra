const admin = require("firebase-admin");

let initialized = false;

function initializeFirebase() {

    if (initialized) {

        return;

    }

    if (!process.env.FIREBASE_PROJECT_ID) {

        throw new Error(
            "FIREBASE_PROJECT_ID is missing."
        );

    }

    if (!process.env.FIREBASE_CLIENT_EMAIL) {

        throw new Error(
            "FIREBASE_CLIENT_EMAIL is missing."
        );

    }

    if (!process.env.FIREBASE_PRIVATE_KEY) {

        throw new Error(
            "FIREBASE_PRIVATE_KEY is missing."
        );

    }

    admin.initializeApp({

        credential: admin.credential.cert({

            projectId:
                process.env.FIREBASE_PROJECT_ID,

            clientEmail:
                process.env.FIREBASE_CLIENT_EMAIL,

            privateKey:
                process.env.FIREBASE_PRIVATE_KEY.replace(
                    /\\n/g,
                    "\n",
                ),

        }),

    });

    initialized = true;

}

async function verifyGoogleToken(idToken) {

    initializeFirebase();

    const decodedToken =
        await admin
            .auth()
            .verifyIdToken(idToken);

    return {

        googleId:
            decodedToken.uid,

        email:
            decodedToken.email,

        name:
            decodedToken.name || "",

        picture:
            decodedToken.picture || "",

        emailVerified:
            decodedToken.email_verified,

    };

}

module.exports = {

    verifyGoogleToken,

};