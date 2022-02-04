import express from "express";
import controller from "../controllers/leaveControl";
import accountVerification from "../common/accountVerification";
const router = express.Router();

router.get(
  "/leave/:username",
  accountVerification.authenticateUser,
  controller.getUserLeaveAdmin
);
router.get(
  "/employee/leave",
  accountVerification.authenticateUser,
  controller.getUserLeaveEmployee
);
router.post(
  "/employee/leave",
  accountVerification.authenticateUser,
  controller.addUserLeave
);

export = router;
