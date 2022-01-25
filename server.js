const express = require("express");
jwt = require("jsonwebtoken");
bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const users = [
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
const leaves = [
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
app.use(function (req, res, next) {
  if (req.headers && req.headers.authorization) {
    // decode token
    jwt.verify(
      req.headers.authorization,
      "RESTFULAPIs",
      function (err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});

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
    token: jwt.sign(user, "RESTFULAPIs"),
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
  res.send({ user, token: jwt.sign(user, "RESTFULAPIs"), status: "success" });
});

// get users
app.get("/user", (req, res) => {
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
app.get("/user/:username", (req, res) => {
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
    position: position,
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

  res.send({ user, token: jwt.sign(user, "RESTFULAPIs") });
});

// delete user
app.delete("/user/:username", (req, res) => {
  const prevLength = users.length;
  for (var i = users.length - 1; i >= 0; --i) {
    if (users[i].username == req.params.username) {
      users.splice(i, 1);
      break;
    }
  }
  if (prevLength === users.length) res.status(401).send({ status: "failed" });
  res.send({ message: "Successfully deleted", status: "success" });
});

// leave
// set user leave
app.get("/leave/:username", (req, res) => {
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

// add user leave TODO
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
