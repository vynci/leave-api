import { Request, Response, NextFunction } from "express";
import leaveModel from "../models/leaves";
import jwtConfig from "../common/jwtConfig";

// getting user leave
const getUserLeave = async (req: Request, res: Response) => {
  const { username } = req.params;
  const employeeLeaves: any[] = [];
  leaveModel.leaves.map((leave: any) => {
    if (leave.username === username) {
      employeeLeaves.push(leave);
    }
  });
  if (employeeLeaves == null) res.status(401).send({ status: "failed" });
  res.send({ employeeLeaves, status: "success" });
};

// creating user leave
const addUserLeave = async (req: Request, res: Response) => {
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
    leaveModel.leaves.push(leave);
    res.send({ leave, status: "success" });
  }
  return res.status(401).send({ message: "no token found!" });
};

export default { getUserLeave };
