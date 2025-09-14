const express = require('express');
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
    secret: "mysupersecretstring",  // use colon here
    resave: false,
    saveUninitialized: true,
};

app.use(session(sessionOptions)); // don't forget to use session middleware!
app.use(flash());

app.use ((req,res,next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
});

app.get("/register",(req,res) => {
    let { name = "anonymous"} = req.query;
    req.session.name =name;

    if(name== "anonymous") {
        req.flash("error","user not registered");
    } else {
        req.flash("success","user registered successfull! ");
    }
    
    res.redirect("/hello"); 
});

app.get("/hello", (req, res) => {
    res.render("page.ejs", { name: req.session.name });
});


app.listen(3000, () => {
    console.log("server is listening on port 3000");
}); 
