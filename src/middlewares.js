export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user || {};
    next();
    // console.log(req.session.user)
}

// 로그인이 안되어 있을때 접근할 경우 로그인 페이지로 가는 미들웨어
export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn){
        return next();
    } else {
        return res.redirect("/login");
    }
}

// 로그인이 되어 있을때  접근할 경우 홈페이지로 가는 미들웨어
export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){
        return next();
    } else {
        return res.redirect("/");
    }
}