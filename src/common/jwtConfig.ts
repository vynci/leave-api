import jwt from "jsonwebtoken";
import tokens from "./tokens";

interface UserPayload {
  firstName: string;
  lastName: string;
  username: string;
  position: string;
  password: string;
  dateCreated: number;
  dateUpdated: number;
}

// input parameter (token)
// output decoded object
function decodeJwt(token: string) {
  try {
    return jwt.verify(token, tokens.ACCESS_TOKEN) as UserPayload;
  } catch (err) {
    return null;
  }
}

// create access token
function generateAccessToken(user: any) {
  return jwt.sign(user, tokens.ACCESS_TOKEN, { expiresIn: "10m" });
}

export default {
  decodeJwt,
  generateAccessToken,
};
