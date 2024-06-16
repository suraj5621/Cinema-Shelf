const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const LocalStrategy =  require('passport-local')
const passport = require('passport');
const User = require('./models/User');



const moviesRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');


const dbURL = process.env.dbURL;
mongoose.connect(dbURL)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err);
    });

let configSession = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        httpOnly : true,
        expires : Date.now() + 7*24*60*60*1000,   // 7 din 24 ghante 60 min 60 sec 1000 milisec
        maxAge : 7*24*60*60*1000
    }
};

app.engine('ejs' , ejsMate);
app.set('view engine' , "ejs");
app.set('views' , path.join(__dirname , 'views'));
app.use(express.static(path.join(__dirname , 'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json()); //json data
app.use(session(configSession))

app.use(passport.session())
app.use(passport.initialize());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));





app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
})

app.use(moviesRoutes);
app.use(authRoutes);

app.listen(5000, () => {
    console.log("Server is running on port 8080");
});
