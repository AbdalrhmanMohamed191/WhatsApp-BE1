
function roleMiddleware(...roles) {
    return (req, res, next) => {
        const userRole = req.user.role; // Assuming the user's role is stored in req.user.role
        if (!userRole) {
            return res.status(401).json({ message: "Unauthorized" }); // User is not authenticated
        }
        const isExsist = roles.includes(userRole);
        if (!isExsist) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
};  
}

module.exports = roleMiddleware;
