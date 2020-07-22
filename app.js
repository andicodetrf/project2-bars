const express = require('express');
const Mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const passport = require('./lib/passportConfig');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const isLoggedIn = require('./lib/loginBlocker');
require('dotenv').config();
const Location = require('./models/location.model');

//WHEN PUSH TO SERVER FOR DEPLOYMENT
//PORT SMTH SMTH

Mongoose.Promise = Promise;

/* Connect to MongoDB */
Mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("mongodb is running!");
  })
  .catch((e) => {
    console.log(e);
  });

  // app.get('/about', (req,res) => {
  //   res.send('about page')
  // })

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
        cookie: {maxAge : 3600000}, //0.1 hour
        store: new MongoStore({ url: process.env.MONGODBLIVE }),
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
app.use('/bar', require('./routes/bar.route'));
app.use('/user', isLoggedIn, require('./routes/user.route'));
app.use('/', require('./routes/main.route'));






/*test browser connect*/





app.listen(process.env.PORT, () => {
    console.log(`running on ${process.env.PORT}`)
})