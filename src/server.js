import express from "express";

const PORT = 4000;

const app = express();

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

const privateMiddleware = (req, res, next) => {
    const url = req.url;
    if(url === "/protected"){
        return res.send("<h1>막아짐</h1>");
    }
    console.log("지나가세요");
    next();
}

const handleHome = (req, res) => {
    return res.send("i still love you")
};
const handleProtected = (req, res) => {
    return res.send("welcome to the private lounge")
};
const handleLogin = (req, res) => {
    return res.send("Login here")
};

app.use(logger);
app.use(privateMiddleware);
app.get("/", handleHome);
app.get("/protected", handleProtected);
app.get("/login", handleLogin);


const handleListening = () => console.log(`Server listenting on port http://localhost:${PORT}`);

app.listen(4000, handleListening)