import express from "express";
import controller from "../controllers/leaveControl";
import accountVerification from "../common/accountVerification";
const router = express.Router();

router.get(
  "/leave/:username",
  accountVerification.authenticateUser,
  controller.getUserLeave
);
router.post("/employee/leave", controller.getUserLeave);

export = router;
