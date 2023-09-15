const express = require('express');
const session = require('express-session')


const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')
const mongoose= require('mongoose');
const sessionsUserModel = require('../Dao/Models/sessionsUserModel');
const handlebars = require ('express-handlebars')

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

sessionsRouter.post('/register', async (req, res) => {

    // const user = await sessionsUserModel.create(req.body)
    await sessionsUserModel.create(req.body)
    return res.redirect('/login')
    // return res.status(201).json(user)
 })

 sessionsRouter.post('/login', async (req, res) => {

   let user = await sessionsUserModel.findOne({email: req.body.email})

   if (!user){
    return res.status(401).json({
        error: 'El usuario no existe en el sistema'
    })
   }

   if (user.password !== req.body.password) {
    return res.status(401).json({
        error: 'Password incorrecta'
    })

   }
   user = user.toObject()
   delete user.password
   req.session.user = user
//    console.log('User data saved in sessionsRouter:', req.session.user);

    
        req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
        } else {
            console.log('Session data saved successfully');
        }

      
        return res.redirect('/products');  
        // return res.redirect('/profile');  
    });


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

module.exports=sessionsRouter


// 1.30.05


