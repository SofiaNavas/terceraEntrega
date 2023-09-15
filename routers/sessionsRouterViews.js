const express = require('express');
const session = require('express-session')

const sessionMiddleware = require('../routers/sessionsRouter');

const Router = express.Router;
const sessionsRouterViews = Router()
sessionsRouterViews.use(sessionMiddleware);


sessionsRouterViews.get('/register', (req, res, next) => {

    if(req.session.user) {
        return res.redirect('/profile')
    }
return next ()
},(req, res) => {
    return res.render('register')
})


sessionsRouterViews.get('/login', (req, res, next) => {

    if(req.session.user) {
        return res.redirect('/profile')
    }
return next ()
},(req, res) => {
    return res.render('login')
})

sessionsRouterViews.get('/profile', (req, res, next) => {

    if(!req.session.user) {
        return res.redirect('/login')
    }
return next ()
}, (req, res) => {

 const user = req.session.user;
//  console.log('User data in sessionsRouterViews:', user);
//  console.log('Session data in sessionsRouterViews:', req.session);
  
   return res.render('profile', {user});
})




module.exports= sessionsRouterViews