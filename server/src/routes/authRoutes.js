import express from "express";
import passport from "passport";
import "../config/passport.js";
import {validateUser, userRegister, userLogin, getUser, putUser, searchUser} from "../controllers/authController.js"

export const authRouter = express.Router();

authRouter.get("/", (req, res) => res.json({message: "auth"}));
authRouter.post("/register", validateUser, userRegister);
authRouter.post("/login", userLogin);
authRouter.get("/user", passport.authenticate("jwt", {session: false}), getUser);
authRouter.put("/user", passport.authenticate("jwt", {session: false}), putUser);
authRouter.post("/searchUser", passport.authenticate("jwt", {session: false}), searchUser);