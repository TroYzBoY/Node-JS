import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";
import { signJwt } from "../utils/jwt.js";

export async function register(req, res) {
  const { username, name, email, password } = req.body;
  const safeUsername = username || name;

  if (!safeUsername || !email || !password) {
    return res.status(400).json({ message: "username, email and password are required" });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({ message: "email already in use" });
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
  const hashed = await bcrypt.hash(password, rounds);

  const user = await prisma.user.create({
    data: {
      username: safeUsername,
      email,
      password: hashed,
      role: "STUDENT",
    },
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "invalid email or password" });
  }

  const token = signJwt({
    id: user.id,
    role: user.role,
  });

  res.json({ token });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  res.json(user);
}