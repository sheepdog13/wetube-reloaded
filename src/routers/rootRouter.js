import express from "express";
import {home, search} from "../controllers/videoController";
import {getjoin,login, postjoin} from "../controllers/userController";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getjoin).post(postjoin);
rootRouter.get("/login", login);
rootRouter.get("/search", search);

export default rootRouter;