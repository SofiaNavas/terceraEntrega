const express = require('express');
const mongoose = require('mongoose')
const app = express();


MONGODB_CONNECT= 'mongodb+srv://sofianavasg:Coder01!@cluster0.8ieczog.mongodb.net/ecommerce?retryWrites=true&w=majority'
mongoose.connect(MONGODB_CONNECT)
.catch(err =>{
    if (err) {
        console.log('No se pudo conectar a la DB', err)
        process.exit()
    }
})

const handlebars = require ('express-handlebars')
const {Server} = require('socket.io')

const ProductModel = require('./Dao/Models/products.model')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.engine('handlebars', handlebars.engine())
app.set('views', './views')
app.set('view engine', 'handlebars')

app.use(express.static('public'))

const productRouter = require('./routers/productRouter')
const cartRouter = require('./routers/cartRouter')

const ChatModel = require('./Dao/Models/chat.model');



const PORT = 8080
const httpServer = app.listen (PORT, ()  => console.log (`Servidor iniciado en http://localhost:${PORT}`))

const io = new Server(httpServer);


app.use('/api/carts', cartRouter)

app.use('/api/products', (req, res, next) => {
    req.io = io; // Pass the io instance to the request object
    next();
  }, productRouter);

  
io.on ('connection', (socket) =>{

  socketId = socket.id
 
  
  console.log('Nuevo cliente conectado', socket.id)

  socket.on('mi_mensaje', (data) =>{  //para recibir mensajes del lado del servidor
    console.log(data)
  })

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



  // socket.emit('recibiendomensajebackend', 'primer mensaje enviado desde el backend')

})

  
  app.get('/healthcheck', (req,res) => {
      return res.json({
          status: 'running',
          date: new Date()
      })
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


app.get('/login', (req,res) => {

  return res.render('login')
})

app.post('/login',  async (req,res) => {

  const user = req.body

  const username = user.name
  //  const newProduct = await ChatModel.create(user);
  

  // io.emit('newUser', username)
  
  return res.redirect(`/chat?username=${username}`)
  
})

app.get('/chat', (req,res) => {

  return res.render('chat')
})
