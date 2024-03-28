const jwt = require('jsonwebtoken');
const {errorsValidateToken} = require('../utils/tokenManager');

const requireToken = (req, res, next) => {
    try {
        let token = req.headers?.authorization;
        if (!token) throw new Error("No Bearer");

        token = token.split(" ")[1];
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);
        req.uid = uid;
        next();

    } catch (error) {
        console.log(error.message);

        return res.status(401)
            .send({ error: errorsValidateToken(error.message) });
    }
}

module.exports = requireToken;