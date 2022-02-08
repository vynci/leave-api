import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwtConfig from "../common/jwtConfig";
import passwordConfig from "../common/passwordConfig";
import User from "../models/users";
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
      return res.send({
        message: "Authentication failed. Invalid username or password!",
      });
    }
    res.send({
      accessToken: jwtConfig.generateAccessToken(user),
    });
  } catch (err) {
    console.log(err);
    return res.send({
      message: "Authentication failed.Invalid username or password!",
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

    if (!user) return res.send({ message: "user not found!" });

    if (oldPassword === newPassword)
      return res.send({ message: "Password same with the old password" });

    const hash_password = bcrypt.hashSync(newPassword, 10);
    user.password = hash_password;
    user.dateUpdated = new Date().getTime();
    res.send({
      user,
      accesstoken: jwtConfig.generateAccessToken(user),
      status: "success",
    });
  }
  return res.send({ message: "no token found!" });
};

export default {
  accountLogin,
  changeAccountPassword,
};
