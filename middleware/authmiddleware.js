const jwt = require("jsonwebtoken");
require("dotenv").config();

function myLogger(req, res, next) {
  next(); // Ensure next() is called to continue middleware chain
}

const authenticateRequests = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .send("Unauthorized access: No Authorization header provided");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized access: Token not provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // Store decoded token info (username, role)
    next(); // Continue to the next middleware
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(403).send("Invalid or expired token");
  }
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user; // Extract role from decoded JWT

    if (!role) {
      return res.status(403).send("Forbidden: No role found in token");
    }

    if (allowedRoles.includes(role)) {
      return next(); // Role is authorized, continue to the next middleware
    } else {
      return res.status(403).send({message:"Forbidden: Insufficient permissions"});
    }
  };
};

module.exports = { myLogger, authenticateRequests, authorizeRole };
