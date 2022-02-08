import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/users";
import jwtConfig from "../common/jwtConfig";
import { collections } from "../services/database.service";

// getting all users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = (await collections.users
      ?.find({})
      .toArray()) as unknown as User[];
    if (users) res.send({ data: users, count: users.length });
    else return res.send({ message: "No users found!", status: "failed" });
  } catch (error) {
    res.send({ status: "failed" });
  }
};

//getting user
const getUser = async (req: Request, res: Response) => {
  try {
    const query = { username: req.params.username };
    const user = (await collections.users?.findOne(query)) as unknown as User;

    if (user) {
      res.send({ user, status: "success" });
    }
  } catch (error) {
    return res.send({
      message: req.params.username + " not found!",
      status: "failed",
    });
  }
};

// creating user
const addUser = async (req: Request, res: Response) => {
  try {
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
    const result = await collections.users?.insertOne(user);

    result
      ? res.send({
          message: `Successfully created a new user with id ${result.insertedId}`,
          status: "success",
        })
      : res.send({ message: "Failed to create a new user.", status: "failed" });
  } catch (error) {
    res.send({ message: "Failed to create a new user.", status: "failed" });
  }
};
// updating user (admin)
const updateUserAdmin = async (req: Request, res: Response) => {
  const { firstName, lastName, position, password } = req.body;
  const hash_password = bcrypt.hashSync(password, 10);
  const updatedUser = {
    firstName: firstName,
    lastName: lastName,
    position: position,
    password: hash_password,
    dateUpdated: new Date().getTime(),
  };
  try {
    const query = { username: req.params.username };
    // updating user
    const result = await collections.users?.updateOne(query, {
      $set: updatedUser,
    });

    if (result) {
      // getting user
      const user = (await collections.users?.findOne(query)) as unknown as User;
      return res.send({
        user,
        status: "success",
      });
    }
    res.send({
      message: `User with username: ${req.params.username} not updated`,
      status: "failed",
    });
  } catch (error) {
    res.send({
      message: `User with username: ${req.params.username} not updated`,
      status: "failed",
    });
  }
};

// updating user (employee)
const updateUserEmployee = async (req: Request, res: Response) => {
  // checking auth header
  if (req.headers && req.headers.authorization) {
    let user: any;
    user = jwtConfig.decodeJwt(req.headers.authorization.split(" ")[1]);
    const { firstName, lastName, position } = req.body;
    const updatedUser = {
      firstName: firstName,
      lastName: lastName,
      position: position,
      dateUpdated: new Date().getTime(),
    };
    try {
      const query = { username: user.username };
      // updating user
      const result = await collections.users?.updateOne(query, {
        $set: updatedUser,
      });

      if (result) {
        // getting user
        const user = (await collections.users?.findOne(
          query
        )) as unknown as User;
        return res.send({
          user,
          accessToken: jwtConfig.generateAccessToken(user),
          status: "success",
        });
      }
      res.send({
        message: `User with username: ${user.username} not updated`,
        status: "failed",
      });
    } catch (error) {
      res.send({
        message: `User with username: ${user.username} not updated`,
        status: "failed",
      });
    }
  }
  return res.send({ message: "no token found!" });
};

// deleting user
const deleteUser = async (req: Request, res: Response) => {
  try {
    const query = { username: req.params.username };
    const result = await collections.users?.deleteOne(query);

    if (result && result.deletedCount) {
      res.send({
        message: `Successfully removed user ${req.params.username}`,
        status: "success",
      });
    } else if (!result) {
      res.send({
        message: `Failed to remove user with id ${req.params.username}`,
        status: "failed",
      });
    } else if (!result.deletedCount) {
      res.send({
        message: `Game with id ${req.params.username} does not exist`,
        status: "failed",
      });
    }
  } catch (error) {
    res.send({
      message: `Failed to remove user with id ${req.params.username}`,
      status: "failed",
    });
  }
};

export default {
  getAllUsers,
  getUser,
  addUser,
  updateUserAdmin,
  updateUserEmployee,
  deleteUser,
};
