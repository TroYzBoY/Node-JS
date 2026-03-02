export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ message: "not authorized (no user role)" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "forbidden (insufficient role)" });
    }

    next();
  };
}