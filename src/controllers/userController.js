import User from "../models/User";
import fetch from "node-fetch";
import bcrypt, { compareSync } from "bcrypt"
import { json } from "express";
import { restart } from "nodemon";
import session from "express-session";

export const getjoin = (req, res) => res.render("join", {pageTitle: "join"});
export const postjoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    const pageTitle = "join"
    if( password !== password2 ){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match."
        }); 
    }
    const exists = await User.exists({$or:[{username}, {email}]});
    if(exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username/email is already taken."
        });
    }
    try{
        await User.create({
            name, 
            username, 
            email, 
            password, 
            location
        })
    } catch(error){
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    } 
    return res.redirect("/login");
};

export const getLogin = (req, res) => res.render("login",{pageTitle:"Login"});
export const postLogin = async (req, res) => {
    const pageTitle = "Login"
    const {username, password} = req.body;
    const user = await User.findOne({username, socialOnly: false});
    if(!user){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        })
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password",
        })
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};
export const startGithubLogin = (req,res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        // 공백을 줘야한다 공식문서 참조
        scope:"read:user user:email"
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}
export const finishGithubLogin = async (req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token"
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    })).json();
    
    if("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await (await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json()
        const emailData = await (await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json()
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({email: emailObj.email});
        if(!user) {
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name : userData.name ? userData.name : "Unknown",
                username: userData.login,
                email: emailObj.email,
                password:"",
                socialOnly: true,
                location:userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
}
export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile"});
}
export const postEdit = async (req, res) => {
    const {
        session:{
            user: {_id},
        },
        body: {name, email, username, location},
    } = req;
    const sessionUsername = req.session.user.username;
    const sessionEmail = req.session.user.email;
    if(sessionUsername !== username){
        // 이때 기존의 username이랑 겹치는게 있는지 확인해줘야 한다
        const exists = await User.exists({username});
        if(exists){
            return res.status(400).render("edit-profile", {
                pageTitle:"Edit Profile",
                errorMessage: "This username is already taken."
            });
        }
    }
    if(sessionEmail !== email){
        const exists = await User.exists({email});
        if(exists){
            return res.status(400).render("edit-profile", {
                pageTitle:"Edit Profile",
                errorMessage: "This email is already taken."
            });
        }
    }
    const updateUser = await User.findByIdAndUpdate(_id,
         {
            name,
            email,
            username,
            location,
        },
        { new: true }
    );
    req.session.user = updateUser;
    return res.redirect("/users/edit");
}
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

export const getChangePassword = (req, res) => {
    return res.render("change-password", {pageTitle:"Change Password"})
}

export const postChangePassword = async (req, res) => {
    const {
        session:{
            user: {_id, password},
        },
        body: {oldPassword, newPassword, newPassword1},
    } = req;
    const ok = await bcrypt.compare(oldPassword, password);
    if(!ok){
        return res.status(400).render("change-password", {
            pageTitle:"change Password",
            errorMessage: "The current password is incorrect",
        })
    }
    if(newPassword !== newPassword1){
        return res.status(400).render("change-password", {
            pageTitle:"change Password",
            errorMessage: "The password does not match the confirmation",
        })
    }
    const user = await User.findById(_id);
    user.password = newPassword;
    // hash 미들웨어를 사용하기위해서
    await user.save();
    req.session.user.password = user.password
    return res.redirect("/users/logout");
};
export const see = (req, res) => res.send("See");



