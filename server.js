const express = require("express");
jwt = require("jsonwebtoken");
bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 3000;

const ACCESS_TOKEN = "6956a3cdb0d39855ad9b6acea7eaa7fae374461f";
const REFRESH_TOKEN = "6d9dcdc21ccf34410954067b50514520fba45af2";

app.use(express.json());

let refreshTokens = [];
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
    lastnAME: "Grava",
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
function authenticateUser(req, res, next) {
  if (req.headers && req.headers.authorization) {
    // decode token
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      ACCESS_TOKEN,
      function (err, decode) {
        if (err) {
          req.user = undefined;
          return res.status(403).send({ message: "access token expired!" });
        }
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    return res.status(401).send({ message: "no token found!" });
  }
}

// create access token
function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN, { expiresIn: "10m" });
}

// Login
app.post("/account/authenticate", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  // find user in db
  const user = users.find((user) => user.username === username);
  console.log(password + user.password);
  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).send({
      message: "Authentication failed. Invalid user or password.",
    });
  }
  return res.send({
    accessToken: generateAccessToken(user),
    refreshToken: jwt.sign(user, REFRESH_TOKEN),
  });
});

// change password
app.post("/account/change-password", (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = users.find((user) => user.username === req.user.username);

  if (oldPassword === newPassword)
    return res
      .status(401)
      .send({ message: "Password same with the old password" });

  const hash_password = bcrypt.hashSync(newPassword, 10);
  user.password = hash_password;
  user.dateUpdated = new Date().getTime();
  res.send({ user, token: jwt.sign(user, ACCESS_TOKEN), status: "success" });
});

// get users
app.get("/user", authenticateUser, (req, res) => {
  if (users) {
    res.send({ users, count: users.length });
    next();
  } else {
    return res
      .status(401)
      .send({ message: "No users found!", status: "failed" });
  }
});

// get user
app.get("/user/:username", authenticateUser, (req, res) => {
  const user = users.find((user) => user.username === req.params.username);
  if (!user)
    return res
      .status(401)
      .send({ message: req.params.username + " not found!", status: "failed" });
  res.send({ user, status: "success" });
});

// add user
app.post("/user", (req, res) => {
  const { firstName, lastName, username, position, password } = req.body;
  const hash_password = bcrypt.hashSync(password, 10);
  const user = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: hash_password,
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  };
  users.push(user);
  res.send(users);
});

// update user
app.put("/user/:username", (req, res) => {
  console.log(users);
  const { firstName, lastName, username, position, password } = req.body;
  const hash_password = bcrypt.hashSync(password, 10);
  const user = users.find((user) => user.username === req.params.username);
  if (!user) res.status(404).send(`${req.params.username} not found!`);

  user.firstName = firstName;
  user.lastName = lastName;
  user.username = username;
  user.position = position;
  user.password = hash_password;
  user.dateUpdated = new Date().getTime();

  res.send({ user, token: jwt.sign(user, ACCESS_TOKEN) });
});

// delete user
app.delete("/user/:username", (req, res) => {
  const prevLength = users.length;
  users = users.filter((user) => user.username !== req.params.username);
  if (prevLength === users.length) res.status(401).send({ status: "failed" });
  res.send({ message: "Successfully deleted", status: "success" });
});

// leave
// set user leave
app.get("/leave/:username", authenticateUser, (req, res) => {
  const { username } = req.params;
  const employeeLeaves = [];
  leaves.map((leave) => {
    if (leave.username === username) {
      employeeLeaves.push(leave);
    }
  });
  if (employeeLeaves == null) res.status(401).send({ status: "failed" });
  res.send({ employeeLeaves, status: "success" });
});

// add user leave
app.post("/leave/:username", (req, res) => {
  const { date, type, notes } = req.body;
  const leave = {
    username: req.params.username,
    date: date,
    type: type,
    notes: notes,
    dateCreated: new Date().getTime(),
    dateUpdated: new Date().getTime(),
  };
  leaves.push(leave);
  res.send({ leave, status: "success" });
});

function comparePassword(inputPassword, userPassword) {
  return bcrypt.compareSync(inputPassword, userPassword);
}

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
