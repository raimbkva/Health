// backend/auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET";

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Bad Authorization header" });
  }
  const token = parts[1];

  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { verifyToken, SECRET };
