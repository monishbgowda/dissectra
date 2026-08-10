const authService =
    require("../services/authService");

class AuthController {

    async googleLogin(req, res, next) {

        try {

            const {

                idToken,

            } = req.body;

            const result =
                await authService.loginWithGoogle(
                    idToken,
                );

            res.json({

                success: true,

                ...result,

            });

        }

        catch (err) {

            next(err);

        }

    }

    async me(req, res, next) {

        try {

            res.json({

                success: true,

                user: req.user,

            });

        }

        catch (err) {

            next(err);

        }

    }

}

module.exports =
    new AuthController();