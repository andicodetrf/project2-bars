const express = require('express');
const Mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const passport = require('./lib/passportConfig');
const session = require('express-session');
const flash = require('connect-flash');
const isLoggedIn = require('./lib/loginBlocker');
require('dotenv').config();

/* Connect to MongoDB */
Mongoose.connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex: true,
}, 
() => {
    console.log('MongoDB Connected')
}
);

/* MIDDLEWARE */
app.use(express.static('public'));
app.use(express.urlencoded({extended: true})); //collects form data
app.set('view engine', 'ejs'); //view engine setup
app.use(expressLayouts); 

app.use(
    session({
        secret: process.env.SECRET,
        saveUninitialized: true,
        resave: false,
        cookie: {maxAge : 360000} //0.1 hour
    })
);

//these passports init must be after sessions
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//set global variable for ejs files //generally 3rd param is called "next()"
app.use(function(req,res, next){
    res.locals.alerts = req.flash(); //alert
    res.locals.currentUser = req.user; //this would enable you to identify the user in all of your ejs pages
    next();

})

/* ROUTES */
app.use('/auth', require('./routes/auth.route'));
app.use('/location', require('./routes/location.route'));







/*test browser connect*/

app.get('/', (req,res) => {
    res.send('port 4200 home page')
})


app.listen(process.env.PORT, () => {
    console.log(`running on ${process.env.PORT}`)
})