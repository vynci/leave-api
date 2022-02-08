import { Request, Response, NextFunction } from "express";
import jwtConfig from "../common/jwtConfig";

//check token
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  if (req.headers && req.headers.authorization) {
    // decode token
    const result = jwtConfig.decodeJwt(req.headers.authorization.split(" ")[1]);
    if (result == null) {
      return res.send({ message: "access token expired!" });
    }
    next();
  } else return res.send({ message: "no token found!" });
}

export default { authenticateUser };
