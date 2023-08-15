const fs = require('fs');
const express = require('express');
const CartModel = require('../Dao/Models/cart.model');
const CartManager = require('../Dao/CartManager');
const Router = express.Router;

const app = express();
const cartRouter = Router()
const cartManager = new CartManager('./cart.json');

app.use(express.json())
app.use(express.urlencoded({extended: true}))



// Obtener todos los carritos
cartRouter.get('/', async (req, res) => {
  try {
    const limit = req.query.limit; // Obtener el límite de resultados del query param

    const carts = await CartModel.find({}); // Usar el método find() de Mongoose para obtener todos los carritos

    // Aplicar el límite si se especificó en el query param
    const limitedCarts = limit ? carts.slice(0, limit) : carts;

    res.json(limitedCarts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los carritos' });
  }
});
  
  // Endpoint dinamico para obtener un carrito por su ID 
  cartRouter.get('/:cid', async (req, res) => {
    const cartId = req.params.cid; // Obtener el ID del carrito como entero
    console.log('paso 1')
    try {
      const cart = await CartModel.findById(cartId); // Usar el método findById() de Mongoose para buscar el carrito por su ID
      console.log('paso 2')
      if (!cart) {
        res.status(404).json({ error: 'Carrito no encontrado' });
        console.log('paso 3')
      } else {
        res.json(cart);
        console.log('paso 4')
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el carrito' });
      console.log('paso 5')
    }
  });


// Crear un nuevo carrito
cartRouter.post('/', async (req, res) => {
  try {
    const cartData = req.body;
    const newCart = await CartModel.create(cartData); // Usar el método create() de Mongoose para crear un nuevo carrito

    res.status(201).json({ message: 'Cart added successfully.', cart: newCart });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


  // Actualizar un carrito
  cartRouter.post('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid;
    console.log('paso 1');
    const productId = req.params.pid;
    console.log('paso 2');
    const quantity = req.body.quantity || 1;
    console.log('paso 3');
  
    try {
      const cart = await CartModel.findById(cartId);
      console.log('paso 4');
  
      if (!cart) {
        res.status(404).json({ error: 'Carrito no encontrado' });
        console.log('paso 5');
      } else {
        if (!cart.products) {
          cart.products = []; // Initialize the products array if it doesn't exist
        }

        const productIndex = cart.products.findIndex((element) => element.productID === productId);
        console.log('paso 6');
        
        if (productIndex === -1) {
          // Add a new product to the cart
          const newProduct = {
            productID: productId,
            quantity: quantity,
          };
          cart.products.push(newProduct);
          console.log('paso 7');
        } else {
          // Increment the quantity of an existing product
          cart.products[productIndex].quantity += quantity;
          console.log('paso 8');
        }
  
        const updatedCart = await cart.save(); // Use the save() method of Mongoose to save changes to the cart
  
        res.status(200).json({ message: 'Product updated successfully.', cart: updatedCart });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
      console.log('paso 9', error); // Log the specific error for debugging
    }
});



  // Eliminar un carrito
  cartRouter.delete('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const deletedCart = await CartModel.findByIdAndDelete(cartId);

    if (!deletedCart) {
      res.status(404).json({ error: 'Carrito no encontrado' });
    } else {
      res.json({ message: 'Cart deleted successfully.', cart: deletedCart });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


module.exports=cartRouter