import express from "express";
import controller from "../controllers/accountControl";
const router = express.Router();

router.post("/account/token", controller.generateAccessToken);
router.post("/account/authenticate", controller.accountLogin);
router.post("/account/change-password", controller.changeAccountPassword);
router.delete("/account/logout", controller.accountLogout);

export = router;
