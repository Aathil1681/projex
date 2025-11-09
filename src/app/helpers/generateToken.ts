import jwt from "jsonwebtoken";
export default function generateToken(id: string) {
  try {
    const token = jwt.sign(
      {
        id,
      },
      process?.env?.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );
    return token;
  } catch (error) {
    throw {
      code: "error-generating-jwt",
      message: "failed to generate token",
    };
  }
}
