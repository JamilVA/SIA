const jwt = require('jsonwebtoken');

const generateToken = (uid) => {
    const expiresIn = 60 * 60 * 12;
    try {
        const token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn });
        return { token, expiresIn };
    } catch (error) {
        console.log(error);
    }
}

const generateRefreshToken = (uid, res) => {
    const expiresIn = 60 * 60 * 24 * 30;
    try {
        const refresToken = jwt.sign({ uid }, process.env.JWT_REFRESH, { expiresIn });
        res.cookie("refreshToken", refresToken, {
            httpOnly: true,
            secure: !(process.env.MODO === "developer"),
            expires: new Date(Date.now() + expiresIn * 1000)
        });
    } catch (error) {
        console.log(error);
        console.log('sin refresh');
    }
}

const errorsValidateToken = (error) => {
    switch (error) {
        case "invalid signature":
            return "La firma del JWT no es válida";
        case "jwt expired":
            return "JWT expirado";
        case "invalid token":
            return "Token no válido";
        case "No Bearer":
            return "Utiliza el formato Bearer";
        case "jwt malformed":
            return "JWT formato no válido";
        case "the token does not exist":
            return "El token no existe"
    }
}

module.exports = { generateToken, generateRefreshToken, errorsValidateToken };