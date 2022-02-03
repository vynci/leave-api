const express = require("express");
import bcrypt from "bcrypt";
import { Response, Request, NextFunction } from "express";
import jwtConfig from "./common/jwtConfig";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let refreshTokens: any[] = [];
let users = [
  // list of employees
  {
    firstName: "J.C. James",
    lastName: "Arcilla",
    username: "jla@noaya.no",
    position: "Software Developer",
    password: "123456",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
  {
    firstName: "Vince",
    lastName: "Elizaga",
    username: "vne@noaya.no",
    position: "Software & System Engineer",
    password: "123456",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
  {
    firstName: "Kenji Mille",
    lastName: "Grava",
    username: "kmg@noaya.no",
    position: "Software Developer",
    password: "123456",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
];
let leaves = [
  // list of leaves
  {
    username: "kmg@noaya.no",
    date: new Date(2022, 0, 14).getTime(),
    type: "Sick",
    notes: "Headache and Fever",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
  {
    username: "kmg@noaya.no",
    date: new Date(2022, 5, 10).getTime(),
    type: "Vacation",
    notes: "N/A",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
  {
    username: "kmg@noaya.no",
    date: new Date(2022, 0, 12).getTime(),
    type: "Emergency",
    notes: "Family Emergency",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
  {
    username: "jla@noaya.no",
    date: new Date(2022, 0, 12).getTime(),
    type: "Sick",
    notes: "Headache and Fever",
    dateCreated: new Date(2022, 0, 14).getTime(),
    dateUpdated: new Date(2022, 0, 14).getTime(),
  },
];

//check token
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  if (req.headers && req.headers.authorization) {
    // decode token
    const result = jwtConfig.decodeJwt(req.headers.authorization.split(" ")[1]);

    console.log("result ", result);
    if (result == null) {
      return res.status(403).send({ message: "access token expired!" });
    }
    next();
  } else return res.status(401).send({ message: "no token found!" });
}

// regenerate access token
app.post("/account/token", (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken == null)
    return res.status(401).send({ message: "no refresh token!" });
  if (!refreshTokens.includes(refreshToken))
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
});

// Login
app.post("/account/authenticate", (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log(req.body);
  // find user in db
  const user = users.find((user) => user.username === username);
  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).send({
      message: "Authentication failed. Invalid user or password.",
    });
  }
  const refreshToken = jwtConfig.generateRefreshToken(user);
  refreshTokens.push(refreshToken);
  res.send({
    accessToken: jwtConfig.generateAccessToken(user),
    refreshToken: refreshToken,
  });
});

// change password
app.post("/account/change-password", (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (req.headers && req.headers.authorization) {
    let currentUser: any;
    currentUser = jwtConfig.decodeJwt(req.headers.authorization.split(" ")[1]);
    const user = users.find((user) => user.username === currentUser.username);

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
});

// logout account
app.delete("/account/logout", (req: Request, res: Response) => {
  refreshTokens = refreshTokens.filter(
    (token) => token !== req.body.refreshToken
  );
  res.send({ status: "success" });
});

// get users
app.get("/user", authenticateUser, (req: Request, res: Response) => {
  if (users) {
    res.send({ users, count: users.length });
  } else {
    return res
      .status(401)
      .send({ message: "No users found!", status: "failed" });
  }
});

// get user
app.get("/user/:username", authenticateUser, (req: Request, res: Response) => {
  const user = users.find((user) => user.username === req.params.username);
  if (!user)
    return res
      .status(401)
      .send({ message: req.params.username + " not found!", status: "failed" });
  res.send({ user, status: "success" });
});

// add user
app.post("/user", (req: Request, res: Response) => {
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
  users.push(user);
  res.send(users);
});

// update user
app.put("/user/:username", (req: Request, res: Response) => {
  console.log(users);
  const { firstName, lastName, username, position, password } = req.body;
  const hash_password = bcrypt.hashSync(password, 10);
  const user = users.find((user) => user.username === req.params.username);
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
});

// delete user
app.delete("/user/:username", (req: Request, res: Response) => {
  const prevLength = users.length;
  users = users.filter((user) => user.username !== req.params.username);
  if (prevLength === users.length) res.status(401).send({ status: "failed" });
  res.send({ message: "Successfully deleted", status: "success" });
});

// leave
// Get user leave
app.get("/leave/:username", authenticateUser, (req: Request, res: Response) => {
  const { username } = req.params;
  const employeeLeaves: any[] = [];
  leaves.map((leave) => {
    if (leave.username === username) {
      employeeLeaves.push(leave);
    }
  });
  if (employeeLeaves == null) res.status(401).send({ status: "failed" });
  res.send({ employeeLeaves, status: "success" });
});

// add user leave
app.post("/employee/leave", (req: Request, res: Response) => {
  const { date, type, notes } = req.body;
  if (req.headers && req.headers.authorization) {
    let user: any;
    user = jwtConfig.decodeJwt(req.headers.authorization.split(" ")[1]);
    const leave = {
      username: user.username,
      date: date,
      type: type,
      notes: notes,
      dateCreated: new Date().getTime(),
      dateUpdated: new Date().getTime(),
    };
    leaves.push(leave);
    res.send({ leave, status: "success" });
  }
  return res.status(401).send({ message: "no token found!" });
});

function comparePassword(inputPassword: string, userPassword: string) {
  return bcrypt.compareSync(inputPassword, userPassword);
}

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
