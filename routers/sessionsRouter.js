const express = require('express');
const session = require('express-session')
const passport = require('passport')


const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')
const mongoose= require('mongoose');
const sessionsUserModel = require('../Dao/Models/sessionsUserModel');
const handlebars = require ('express-handlebars');
const { createHash, isValidPassword } = require('../utils/passwordHash');

const Router = express.Router;
const sessionsRouter = Router()

sessionsRouter.use(express.json())
sessionsRouter.use(express.urlencoded({extended: true}))
sessionsRouter.use(cookieParser('secretkey'))

MONGODB_CONNECT= 'mongodb+srv://sofianavasg:Coder01!@cluster0.8ieczog.mongodb.net/ecommerce?retryWrites=true&w=majority'


mongoose.connect(MONGODB_CONNECT)
.then(async _ => {
    console.log('conectado a la base de datos')
})



sessionsRouter.use(session({
    secret: 'secretkey', // Replace with your secret key
    resave: true,
    saveUninitialized: true
}))


sessionsRouter.get('/', (req, res) => {
    return res.json(req.session)
    
});

sessionsRouter.post('/register', 
passport.authenticate('register', {failureRedirect: '/failregister'}), 
async(req, res) => {

//    const body = req.body
//    body.password = createHash(body.password)
//    console.log({body})
//    const user = await sessionsUserModel.create(body)

    return res.redirect('/login')
    // return res.status(201).json(req.user)
 })

 sessionsRouter.get('/failRegister', (req, res) => {
    return res.json({
        error: 'Error al registrarse'
    })
 })

 sessionsRouter.get('/faillogin', (req, res) => {
    return res.json({
        error: 'Error al iniciar sesion'
    })
 })


 sessionsRouter.post('/login',
 passport.authenticate('login', {failureRedirect: '/faillogin'}), 
  async (req, res) => {

 
console.log('Redirecting to /products with user:', req.user);
req.session.user = req.user
console.log('Redirecting to /products with req.session.user:', req.session.user);

 return res.redirect('/products');  
 
//  return res.json(req.user)

})



sessionsRouter.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            console.log('Session destroyed successfully');
        }
        res.render('login'); // Render the login page after successful logout
    });
});


sessionsRouter.post('/recovery-password', async (req, res) => {
    
    let user = await sessionsUserModel.findOne({email: req.body.email}) 

    if (!user) {       
              
            return res.status(401).json({
                error: 'El usuario no existe en el sistema'
            });
        }
    
const newPassword = createHash(req.body.password)
   console.log({newPassword})
    await sessionsUserModel.updateOne({email: user.email},{password: newPassword})

    return res.redirect('/login')

})

sessionsRouter.get('/github', passport.authenticate('github', {scope:['user:email'] }),
async(req, res) => {

})

sessionsRouter.get('/github-callback', passport.authenticate('github', {failureRedirect: '/login'}),
async(req, res) => {
    // return res.json(req.user)
    req.session.user = req.user
    req.session.user.name = req.user.username
    console.log(req.session.user, 'user de github')
    return res.redirect('/products'); 
})


module.exports=sessionsRouter


// 42.09


