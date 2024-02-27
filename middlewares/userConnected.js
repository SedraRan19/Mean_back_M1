const jwt = require("jsonwebtoken");
const config = require('../config/database');

module.exports = (req, res, next) => {
    const authorizationHeader = req.get("Authorization");

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not connected" });
    }

    const token = authorizationHeader.split("Bearer ")[1];

    try {
        const decodedToken = jwt.verify(token, config.secret);

        if (!decodedToken) {
            return res.status(401).json({ error: "Login failed" });
        }

        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Echec de la connexion. Token invalide" });
        }

        console.error(error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


// const token = authorizationHeader.split("Bearer ")[1];
// try {
//     const decodedToken = jwt.verify(token, config.secret);
//     console.log("Decoded Token:", decodedToken);
//     if (!decodedToken) {
//         return res.status(401).json({ error: "Login failed" });
//     }
//     req.userId = decodedToken.userId;
//     next();
// } catch (error) {
//     console.error("JWT Verification Error:", error);
// }
