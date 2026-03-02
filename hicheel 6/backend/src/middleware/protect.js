import { verifyJwt } from "../utils/jwt.js";

export default function protect(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "not authorized (missing token)" });
  }

  const token = auth.split(" ")[1];
  const decoded = verifyJwt(token);

  if (!decoded) {
    return res.status(401).json({ message: "not authorized (invalid token)" });
  }

  req.user = decoded;
  next();
}