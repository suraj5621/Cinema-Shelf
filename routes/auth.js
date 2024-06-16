const express =  require('express');
const User = require('../models/User');
const router = express.Router();
const passport = require('passport');

// to show the form of signup
router.get('/register' ,(req,res)=>{
    res.render('auth/register');
})



// actually want to register a user in my DB
router.post('/register' , async (req,res)=>{
    try{
        let {username , email ,  password } = req.body;
        let post_count =0;
        let user = new User({username , email  , post_count});
        
        const newUser = await User.register(user , password );
        // res.redirect('/login');
        req.login( newUser , function(err){
            if(err){return next(err)}


            return res.redirect('/home');
        })
    }
    catch(err){
        res.send("error");
    }
})



// to get login form
router.get('/login' ,(req,res)=>{
    res.render('auth/login');
})


// to actually login via the db
router.post('/login', 
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureMessage: true 
    }),
    (req,res)=>{
        res.redirect('/home');
})

// logout

router.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }

      res.redirect('/login');
    });
  });




module.exports = router;