const passport = require('passport')
const PassportLocal = require('passport-local')
const userModel = require('../Dao/Models/sessionsUserModel')
const {createHash, isValidPassword} = require ('../utils/passwordHash')
const sessionMiddleware = require('../routers/sessionsRouter');
const githubStrategy = require('passport-github2') 

passport.use(sessionMiddleware);


const LocalStrategy = PassportLocal.Strategy

const initializePassport = () => {



passport.use(passport.initialize());
passport.use(passport.session());
    

    
    passport.use('register', 
    //  new LocalStrategy(
         new LocalStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            try{
                const user = await userModel.findOne({email: username})
    
                if (user) {
                    console.log('Usuario ya existe')
                    return done(null, false)
                }
                
                const body = req.body
                
                console.log('user from passportconfig')
                body.password = createHash(body.password)
                console.log({body})
                newUser = await userModel.create(body)
    
                return done(null, newUser)
    
            } catch(e) {
                return done(e)
            }
        }
     )
    )

    passport.use('login', new LocalStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async(req, email, password, done)=> {
            try{
                
                let user = await userModel.findOne({email:email})

                if (!user) {
                    // // Verificar si las credenciales coinciden con las de administrador
                    // if (req.body.email === 'adminCoder@coder.com' && req.body.password === 'adminCod3r123') {
                    //     // Establecer 'admin' en 'true' en lugar de crear un usuario en la base de datos
                    //     user = {
                    //         email: 'adminCoder@coder.com',
                    //         admin: true
                    //     };
                
                    //      req.session.user = user
                    //      done(null, user)
                    //     // return res.redirect('/products')
                
                    // } else {
                        console.log('el usuario no existe en el sistema')
                        return done(null, false)
                        };
                    

                    if (user) {

                        if (!isValidPassword(password, user.password)) {
                            console.log('datos incorrectos')
                            return done (null, false)
                        
                           }
                    
                        user = user.toObject()
                        delete user.password
                        console.log(user )
                        console.log('user de passport config')
                        console.log(req.body )
                        console.log('req.body de passport config')
                        // req.session.user = user
                        console.log('')
                                                
                        
                        done(null, user)
                    }; 

                    
                } catch (e) {
                return done(e)
            }
        } ))


    passport.use('github', new githubStrategy({
        clientID: 'Iv1.2aa04966a8d7b834',
        clientSecret:'23ed4afc672f119acff38be6143eaf7b6b8f461e',
        callbackURL: 'http://localhost:8080/api/sessions/github-callback'
    }, async (accessToken, refreshToken, profile, done) => {

        console.log({accessToken, refreshToken, profile})

        try {
            const user = await userModel.findOne({username: profile._json.login})
            if (user) {
                console.log('El usuario ya existe')
                return done(null, user)
            }

            const newUser = await userModel.create({
                username: profile._json.login,
                name: profile._json.name
            })

            return done(null, newUser)

    } catch (e) {
        return done(e)
    }
            
         }))    


    passport.serializeUser((user, done) => {  // a partir del usuario original que referencia nos vamos a quedar
        console.log('serializeUser')
        done(null, user._id)
    })

    passport.deserializeUser(async(id, done) => { // a partir de la referencia, como vamos a obtener el usuario completo
        console.log('deserializeUser')
        const user = await userModel.findOne(id)
        done(null, user)
    }) 


}

module.exports = initializePassport



// 24.59


