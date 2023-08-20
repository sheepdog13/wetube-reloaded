import express from "express";
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(morgan("dev"));
// express application이 form의 value들을 이해할 수 있도록 하고, 자바스크립트 형식으로 변형시켜준다
app.use(express.urlencoded({extended:true}));

app.use(session({
    secret:"Hello!",
    resave:true,
    saveUninitialized: true,
}))

app.use(localsMiddleware)
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app