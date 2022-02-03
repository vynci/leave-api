import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import userModel from "../models/users";
import jwtConfig from "../common/jwtConfig";

// getting all users
const getAllUsers = async (req: Request, res: Response) => {
  if (userModel.users) {
    res.send({ data: userModel.users, count: userModel.users.length });
  } else {
    return res
      .status(401)
      .send({ message: "No users found!", status: "failed" });
  }
};

//getting user
const getUser = async (req: Request, res: Response) => {
  const user = userModel.users.find(
    (user) => user.username === req.params.username
  );
  if (!user)
    return res
      .status(401)
      .send({ message: req.params.username + " not found!", status: "failed" });
  res.send({ user, status: "success" });
};

// creating user
const addUser = async (req: Request, res: Response) => {
  console.log(req.body);
  const { firstName, lastName, username, position, password } = req.body;
  const hash_password = bcrypt.hashSync(password, 10);
  const user = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    position: position,
    password: hash_password,
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  };
  userModel.users.push(user);
  res.send(userModel.users);
};

//updating user
const updateUser = async (req: Request, res: Response) => {
  const { firstName, lastName, username, position, password } = req.body;
  const hash_password = bcrypt.hashSync(password, 10);
  const user = userModel.users.find(
    (user) => user.username === req.params.username
  );
  if (user) {
    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.position = position;
    user.password = hash_password;
    user.dateUpdated = new Date().getTime();

    res.send({ user, token: jwtConfig.generateRefreshToken(user) });
  }
  res.status(404).send(`${req.params.username} not found!`);
};

// deleting user
const deleteUser = async (req: Request, res: Response) => {
  const prevLength = userModel.users.length;
  userModel.users = userModel.users.filter(
    (user) => user.username !== req.params.username
  );
  if (prevLength === userModel.users.length)
    res.status(401).send({ status: "failed" });
  res.send({ message: "Successfully deleted", status: "success" });
};

export default { getAllUsers, getUser, addUser, updateUser, deleteUser };
