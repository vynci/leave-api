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
router.post("/user", accountVerification.authenticateUser, controller.addUser);
router.put(
  "/user/:username",
  accountVerification.authenticateUser,
  controller.updateUserAdmin
);
router.put(
  "/employee/user",
  accountVerification.authenticateUser,
  controller.updateUserEmployee
);
router.delete(
  "/user/:username",
  accountVerification.authenticateUser,
  controller.deleteUser
);

export = router;
