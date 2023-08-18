import express from "express";
import {home, search} from "../controllers/videoController";
import {getjoin, postjoin, getLogin, postLogin} from "../controllers/userController";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getjoin).post(postjoin);
rootRouter.route("/login").get(getLogin).post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;