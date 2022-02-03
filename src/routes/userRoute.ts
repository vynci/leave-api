import express from "express";
import controller from "../controllers/userControl";
import accountVerification from "../common/accountVerification";
const router = express.Router();

router.get(
  "/user",
  accountVerification.authenticateUser,
  controller.getAllUsers
);
router.get(
  "/user/:username",
  accountVerification.authenticateUser,
  controller.getUser
);
router.post("/user", controller.addUser);
router.put("/user/:username", controller.updateUser);
router.delete("/user/:username", controller.deleteUser);

export = router;
