import { Request, Response, NextFunction } from "express";
import jwtConfig from "../common/jwtConfig";
import passwordConfig from "../common/passwordConfig";
import userModel from "../models/users";
import tokenModel from "../models/refreshTokens";
import bcrypt from "bcrypt";

// logging in
const accountLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(req.body);
  // find user in db
  const user = userModel.users.find((user) => user.username === username);
  if (!user || !passwordConfig.comparePassword(password, user.password)) {
    return res.status(401).send({
      message: "Authentication failed. Invalid user or password.",
    });
  }
  const refreshToken = jwtConfig.generateRefreshToken(user);
  tokenModel.refreshTokens.push(refreshToken);
  res.send({
    accessToken: jwtConfig.generateAccessToken(user),
    refreshToken: refreshToken,
  });
};

// changing password
const changeAccountPassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (req.headers && req.headers.authorization) {
    let currentUser: any;
    currentUser = jwtConfig.decodeJwt(req.headers.authorization.split(" ")[1]);
    const user = userModel.users.find(
      (user) => user.username === currentUser.username
    );

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
  tokenModel.refreshTokens = tokenModel.refreshTokens.filter(
    (token) => token !== req.body.refreshToken
  );
  res.send({ status: "success" });
};

// generating access token
const generateAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken == null)
    return res.status(401).send({ message: "no refresh token!" });
  if (!tokenModel.refreshTokens.includes(refreshToken))
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
