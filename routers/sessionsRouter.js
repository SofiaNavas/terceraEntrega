

const express = require('express');
const session = require('express-session')
const FileStore = require ('session-file-store')
const fileStorage = FileStore(session)
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')



const Router = express.Router;
const sessionsRouter = Router()

sessionsRouter.use(express.json())
sessionsRouter.use(express.urlencoded({extended: true}))
sessionsRouter.use(cookieParser('secretkey'))

MONGODB_CONNECT= 'mongodb+srv://sofianavasg:Coder01!@cluster0.8ieczog.mongodb.net/ecommerce?retryWrites=true&w=majority'



sessionsRouter.use(session({
    // store: new fileStorage({
    //     path: './sessions',
    //     ttl: 100,
    //     retries: 0
    // }),
    store: MongoStore.create({
        mongoUrl: MONGODB_CONNECT,
        ttl: 120
    }),
    secret: 'secretSession',
    resave:true,
    saveUninitialized: true,
}))

sessionsRouter.get('/', (req, res) => {

    if(!req.session.counter) {
        req.session.counter = 1
        req.session.name = req.query.name

        return res.json(`Bienvenido ${req.session.name}`)
    } else {
        req.session.counter++
        return res.json (`${req.session.name} has visitado la pagina ${req.session.counter} veces`)
    } 
});


module.exports=sessionsRouter


// 1.05.51' clase