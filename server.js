const express = require('express');
const mongoose = require('mongoose')
const app = express();

const passport = require('passport')
const initializePassport = require('./config/passport.config')


// MONGODB_CONNECT= 'mongodb+srv://sofianavasg:Coder01!@cluster0.8ieczog.mongodb.net/ecommerce?retryWrites=true&w=majority'
// mongoose.connect(MONGODB_CONNECT)
// .catch(err =>{
//     if (err) {
//         console.log('No se pudo conectar a la DB', err)
//         process.exit()
//     }
// })

const MONGODB_CONNECT= 'mongodb+srv://sofianavasg:Coder01!@cluster0.8ieczog.mongodb.net/ecommerce?retryWrites=true&w=majority'
mongoose.connect(MONGODB_CONNECT)
.then(async _ => {
  console.log('conectado a la db (log desde server.js)')
})
.catch(err =>{
    if (err) {
        console.log('No se pudo conectar a la DB', err)
        process.exit()
    }
})

const handlebars = require ('express-handlebars')
const {Server} = require('socket.io')



const ProductModel = require('./Dao/Models/products.model')
const CartModel = require('./Dao/Models/cart.model');

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.engine('handlebars', handlebars.engine())
app.set('views', './views')
app.set('view engine', 'handlebars')

app.use(express.static('public'))

// app.use(cookieParser('secretkey'))

// app.use(session({
//   secret: 'secretkey', // Replace with your secret key
//   resave: true,
//   saveUninitialized: true
// }))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

const productRouter = require('./routers/productRouter')
const cartRouter = require('./routers/cartRouter')
const sessionsRouter = require('./routers/sessionsRouter')
const sessionsRouterViews = require('./routers/sessionsRouterViews')

const ChatModel = require('./Dao/Models/chat.model');
const productRouterViews = require('./routers/productRouterViews');
const cartRouterViews = require('./routers/cartRouterViews');
const cookieParser = require('cookie-parser');



const PORT = 8080
const httpServer = app.listen (PORT, ()  => console.log (`Servidor iniciado en http://localhost:${PORT}`))

const io = new Server(httpServer);


app.use('/api/carts', cartRouter)
app.use('/carts', cartRouterViews)
app.use('/api/sessions', sessionsRouter)
app.use('/', sessionsRouterViews)

app.use('/api/products', (req, res, next) => {
    req.io = io; // Pass the io instance to the request object
    next();
  }, productRouter);

  app.use('/products', (req, res, next) => {
    req.io = io; // Pass the io instance to the request object
    next();
  }, productRouterViews);

  
io.on ('connection', (socket) =>{

  socketId = socket.id
 
  
  console.log('Nuevo cliente conectado', socket.id)

   // Crear un nuevo carrito asociado al socketId
   const newCart = new CartModel({
    socketID: socketId,
    products: []
  });

  newCart.save()
    .then((savedCart) => {
      const cartId = savedCart._id; // Obtener el _id del carrito
      // console.log('Carrito nuevo creado:', savedCart);
      // console.log('ID del carrito:', cartId);

      // Emitir el evento 'createCart' con el socketId y cartId
      socket.emit('createCart', { socketId, cartId });
    })
    .catch((error) => {
      console.error('Error al crear carrito:', error);
    });

    socket.on('addToCart', async ({ socketId, productId }) => {
      try {
        const cart = await CartModel.findOne({ socketID: socketId });
  
        if (!cart) {
          console.error('Carrito no encontrado');
          return;
        }
  
        // Buscar si el producto ya existe en el carrito
        const existingProductIndex = cart.products.findIndex((product) => product.productID === productId);
  
        if (existingProductIndex !== -1) {
          // Si el producto existe, incrementar la cantidad en 1
          cart.products[existingProductIndex].quantity += 1;
        } else {
          // Si el producto no existe, agregarlo al carrito con cantidad 1
          cart.products.push({ productID: productId, quantity: 1 });
        }
  
        await cart.save();
  
        console.log(`Producto ${productId} agregado al carrito ${cart._id}`);
      } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
      }
    });

  socket.on('joinChat', async (username) =>{  

    try {
      await ChatModel.create({
        name: username,
        socketId: socket.id
        
      });
 
      console.log(`Usuario ${username} con ID ${socket.id} agregado a la base de datos`);
      socket.broadcast.emit('newUser', username)

      try{

        const chatHistory = await ChatModel.findOne({
          $and: [{ name: "chatHistory" }, { socketId: "S_K7oTKllR8O5BV_AAAR" }]
        });
      
      
      if (chatHistory) {
        socket.emit('chatHistory', chatHistory.messages);
      } else {
        console.log('No se encontró el historial de chat para este usuario.');
      }
    } catch (error) {
      console.error('Error al obtener el historial de chat:', error);
    }

      socket.emit('messages', messages) 
     
    } catch (error) {
      console.error('Error al agregar usuario a la base de datos:', error);
    }
    // console.log(username, socket.id)

  

    socket.on('newMessage', async (messageObj) => {
      try {
        const chatHistory = await ChatModel.findOne({
          $and: [{ name: "chatHistory" }, { socketId: "S_K7oTKllR8O5BV_AAAR" }]
        });
        
        console.log('se encuentra chathistory')
        const user = await ChatModel.findOne({ socketId: socketId });
        console.log('se encuentra al user')
        if (user && chatHistory) {
          chatHistory.messages.push({
            username: user.name, // Utiliza el nombre del usuario que envió el mensaje
            message: messageObj.message
          });
          console.log('se agrega el mensaje al chathistory')
          await chatHistory.save();
          console.log('Nuevo mensaje agregado al historial del chat en la base de datos:', messageObj.message);
          io.emit('message', messageObj)
          // io.emit('chatHistory', chatHistory.messages);
        } else {
          console.log('No se encontró el usuario en la base de datos.');
        }
      } catch (error) {
        console.error('Error al agregar mensaje al usuario en la base de datos:', error);
      }
    });
  });

})

  
  app.get('/realtimeproducts', async (req,res) => {

try{
const products = await ProductModel.find({});
    
    // Convert ObjectId to string for each product
    const formattedProducts = products.map(product => ({
      ...product.toObject(), // Convert Mongoose object to plain object
       _id: product._id.toString()
    }));

    const params = {
      title: 'Productos',
      products: formattedProducts
    };

return res.render('realTimeProducts', params)

} catch (e) {
    console.error(e)
    
}     
})


app.get('/loginChat', (req,res) => {

  return res.render('loginChat')
})

app.post('/login',  async (req,res) => {

  const user = req.body

  const username = user.name

  
  return res.redirect(`/chat?username=${username}`)
  
})

app.get('/chat', (req,res) => {

  return res.render('chat')
})
