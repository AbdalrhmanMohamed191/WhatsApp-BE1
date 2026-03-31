const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authMiddleware = (req,res,next) => {
    try {
        const auth = req.headers["authorization"]// Assuming token is sent
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = auth.split(" ")[1]; // Extract token from
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = authMiddleware;
    

