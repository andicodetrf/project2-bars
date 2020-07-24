const authRouter = require('express').Router();
const passport = require("../lib/passportConfig");
const isLoggedIn = require("../lib/loginBlocker");
const User = require("../models/user.model");

/* REGISTER USER */
authRouter.get('/register', (req,res) => {
    // res.send('route: /auth/register')

    res.render('auth/register')  
})


authRouter.post('/register', (req,res) => {
    // res.send('route: /auth/register')

    console.log('-- req body --', req.body)


    let user = new User(req.body);

    if (req.body.role == 'patron') {
        user.isPatron = true;
    } else if (req.body.role == 'owner') {
        user.isBarOwner = true;
    } else if (req.body.role == 'admin') {
        user.isAdmin = true;
    } 

    console.log('user registered --->>', user);
    // res.send('user registered')

    user.save()
    .then(() => {
        passport.authenticate('local', {
            successRedirect: '/',
            successFlash: "you are logged in"
        })(req,res);
    })
    .catch((err) => {
        console.log(err)
    })

});


/* USER LOG IN */
authRouter.get('/login', (req,res) => {
    // res.send('route: /auth/register')
    res.render('auth/login')
})


authRouter.post("/login",
    passport.authenticate("local", {
      successRedirect: "/", //after login success
      failureRedirect: "/auth/login", //if fail
      failureFlash: "Invalid Email or Password",
      successFlash: "Welcome back!"

    })
    
)

authRouter.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "See you soon!")
    res.redirect('/')
  });


module.exports = authRouter;