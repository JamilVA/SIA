const jwt = require('jsonwebtoken');
const { errorsValidateToken } = require("../utils/tokenManager");

const requireRefreshToken = (req, res, next) => {
    try {
        const refreshTokenCookie = req.cookies.refreshToken;
        if (!refreshTokenCookie) throw new Error("the token does not exist");

        const { uid } = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH);
        req.uid = uid;
        next();

    } catch (error) {
        console.log(error);
        return res.status(401).send({ error: errorsValidateToken(error.message) });
    }
};

module.exports = requireRefreshToken;