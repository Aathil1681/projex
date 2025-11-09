import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
}

export function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded.id;
  } catch {
    return null;
  }
}
