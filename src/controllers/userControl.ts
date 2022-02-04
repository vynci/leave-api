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
    else
      return res
        .status(401)
        .send({ message: "No users found!", status: "failed" });
  } catch (error) {
    res.status(500).send({ status: "failed" });
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
    return res
      .status(401)
      .send({ message: req.params.username + " not found!", status: "failed" });
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
      ? res.status(201).send({
          message: `Successfully created a new user with id ${result.insertedId}`,
          status: "success",
        })
      : res
          .status(500)
          .send({ message: "Failed to create a new user.", status: "failed" });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Failed to create a new user.", status: "failed" });
  }
};

//updating user
const updateUser = async (req: Request, res: Response) => {
  const { firstName, lastName, username, position, password, refreshToken } =
    req.body;
  const hash_password = bcrypt.hashSync(password, 10);
  const updatedUser = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    position: position,
    password: hash_password,
    dateUpdated: new Date().getTime(),
  };

  try {
    const query = { username: username };
    // updating user
    const result = (await collections.users?.updateOne(query, {
      $set: updatedUser,
    })) as unknown as User;

    if (result) {
      // getting user
      const user = (await collections.users?.findOne(query)) as unknown as User;
      // creating refresh token
      const newRefreshToken = jwtConfig.generateRefreshToken(user);
      // updating refresh token
      const updateReresh = { token: newRefreshToken };
      const tokenQuery = { token: refreshToken };
      await collections.refreshTokens?.updateOne(tokenQuery, {
        $set: updateReresh,
      });
      return res.send({
        user,
        accessToken: jwtConfig.generateAccessToken(user),
        refreshToken: jwtConfig.generateRefreshToken(user),
        status: "success",
      });
    }
    res.status(304).send({
      message: `User with username: ${username} not updated`,
      status: "failed",
    });
  } catch (error) {
    res.status(304).send({
      message: `User with username: ${username} not updated`,
      status: "failed",
    });
  }
};

// deleting user
const deleteUser = async (req: Request, res: Response) => {
  try {
    const query = { username: req.params.username };
    const result = await collections.users?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send({
        message: `Successfully removed user ${req.params.username}`,
        status: "success",
      });
    } else if (!result) {
      res.status(400).send({
        message: `Failed to remove user with id ${req.params.username}`,
        status: "failed",
      });
    } else if (!result.deletedCount) {
      res.status(404).send({
        message: `Game with id ${req.params.username} does not exist`,
        status: "failed",
      });
    }
  } catch (error) {
    res.status(400).send({
      message: `Failed to remove user with id ${req.params.username}`,
      status: "failed",
    });
  }
};

export default { getAllUsers, getUser, addUser, updateUser, deleteUser };
