import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
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
    secret: process.env.COOKI_SECRET,
    resave:false,
    // 세션을 수정할 때만 세션을 DB에 저장하고 쿠키를 넘겨준다
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DB_URL})
}))

app.use(localsMiddleware)
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app