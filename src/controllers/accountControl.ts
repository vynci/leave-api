import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwtConfig from "../common/jwtConfig";
import passwordConfig from "../common/passwordConfig";
import User from "../models/users";
import RefreshToken from "../models/refreshTokens";
import { collections } from "../services/database.service";

// logging in
const accountLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(req.body);
  try {
    // find user in db
    const query = { username: username };
    const user = (await collections.users?.findOne(query)) as unknown as User;
    console.log(user);
    if (!user || !passwordConfig.comparePassword(password, user.password)) {
      return res.status(401).send({
        message: "Authentication failed. Invalid user or password.",
      });
    }
    const refreshToken = jwtConfig.generateRefreshToken(user);
    const addReresh = { token: refreshToken };
    await collections.refreshTokens?.insertOne(addReresh);
    res.send({
      accessToken: jwtConfig.generateAccessToken(user),
      refreshToken: refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(401).send({
      message: "Authentication failed.",
    });
  }
};

// changing password
const changeAccountPassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (req.headers && req.headers.authorization) {
    let currentUser: any;
    currentUser = jwtConfig.decodeJwt(req.headers.authorization.split(" ")[1]);
    const query = { usernme: currentUser.username };
    const user = (await collections.users?.findOne(query)) as unknown as User;

    if (!user) return res.status(401).send({ message: "user not found!" });

    if (oldPassword === newPassword)
      return res
        .status(401)
        .send({ message: "Password same with the old password" });

    const hash_password = bcrypt.hashSync(newPassword, 10);
    user.password = hash_password;
    user.dateUpdated = new Date().getTime();
    res.send({
      user,
      token: jwtConfig.generateRefreshToken(user),
      status: "success",
    });
  }
  return res.status(401).send({ message: "no token found!" });
};

// logging out
const accountLogout = async (req: Request, res: Response) => {
  try {
    const query = { token: req.body.refreshToken };
    await collections.refreshTokens?.deleteOne(query);
    res.send({ status: "success" });
  } catch (err) {
    return res.status(401).send({ message: "connection error!" });
  }
};

// generating access token
const generateAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken == null)
    return res.status(401).send({ message: "no refresh token!" });
  const query = { token: refreshToken };
  const token = (await collections.refreshTokens?.findOne(
    query
  )) as unknown as RefreshToken;
  if (!token)
    return res.status(401).send({ message: "invalid refresh token!" });
  const decode = jwtConfig.decodeJwtRefresh(refreshToken);

  if (decode == null)
    return res.status(401).send({ message: "refresh token expired!" });

  const user = {
    firstName: decode.firstName,
    lastName: decode.lastName,
    username: decode.username,
    dateCreated: decode.dateCreated,
    dateUpdated: decode.dateUpdated,
  };

  res.send({
    accessToken: jwtConfig.generateAccessToken(user),
  });
};

export default {
  accountLogin,
  changeAccountPassword,
  accountLogout,
  generateAccessToken,
};
