const fs = require('fs');
const express = require('express');
const CartModel = require('../Dao/Models/cart.model');
const CartManager = require('../Dao/CartManager');
const Router = express.Router;

const app = express();
const cartRouterViews = Router()
const cartManager = new CartManager('./cart.json');

app.use(express.json())
app.use(express.urlencoded({extended: true}))



// Obtener todos los carritos
cartRouterViews.get('/', async (req, res) => {
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
  // cartRouter.get('/:cid', async (req, res) => {
  //   const cartId = req.params.cid; // Obtener el ID del carrito como entero
  //   console.log('paso 1')
  //   try {
  //     const cart = await CartModel.findById(cartId); // Usar el método findById() de Mongoose para buscar el carrito por su ID
  //     console.log('paso 2')
  //     if (!cart) {
  //       res.status(404).json({ error: 'Carrito no encontrado' });
  //       console.log('paso 3')
  //     } else {
  //       res.json(cart);
  //       console.log('paso 4')
  //     }
  //   } catch (error) {
  //     res.status(500).json({ error: 'Error al obtener el carrito' });
  //     console.log('paso 5')
  //   }
  // });

  cartRouterViews.get('/:cid', async (req, res) => {
    const cartId = req.params.cid;
  
    try {
      const cart = await CartModel.findById(cartId);
  
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }
  
      const params = {
        title: 'Detalles del Carrito',
        cart: cart.toObject(), // Convertir el carrito a un objeto plano
      };
  
      return res.render('cartDetails', params);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener los detalles del carrito' });
    }
  });


// Crear un nuevo carrito
cartRouterViews.post('/', async (req, res) => {
  try {
    const cartData = req.body;
    const newCart = await CartModel.create(cartData); // Usar el método create() de Mongoose para crear un nuevo carrito

    res.status(201).json({ message: 'Cart added successfully.', cart: newCart });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


  // Actualizar un carrito
  cartRouterViews.post('/:cid/product/:pid', async (req, res) => {
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
        // res.status(404).json({ error: 'Carrito no encontrado' });
        // console.log('paso 5');
        
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
  cartRouterViews.delete('/:cid', async (req, res) => {
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


// Eliminar un producto del carrito
cartRouterViews.delete('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const cart = await CartModel.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter(product => product.productID.toString() !== productId);

    await cart.save();

    return res.json({ message: 'Producto eliminado del carrito exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
  }
});


// Actualizar un carrito con un arreglo de productos
cartRouterViews.put('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  const newProducts = req.body.products;

  try {
    const cart = await CartModel.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.products = newProducts;

    await cart.save();

    return res.json({ message: 'Productos actualizados en el carrito exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar los productos del carrito' });
  }
});

// Actualizar la cantidad de un producto en el carrito
cartRouterViews.put('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const newQuantity = req.body.quantity;

  try {
    const cart = await CartModel.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const product = cart.products.find(product => product.productID.toString() === productId);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    product.quantity = newQuantity;

    await cart.save();

    return res.json({ message: 'Cantidad de producto actualizada exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
  }
});

// Eliminar todos los productos del carrito
cartRouterViews.delete('/:cid/products', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await CartModel.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.products = [];

    await cart.save();

    return res.json({ message: 'Todos los productos del carrito han sido eliminados' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar todos los productos del carrito' });
  }
});


module.exports=cartRouterViews


/// para testear los endpoints nuevos

// POST   http://localhost:8080/api/carts/{cartId}/product/{productId}

// {
//   "quantity": 2
// }

// PUT http://localhost:8080/api/carts/{cartId}/products/{productId}

// {
//   "quantity": 5
// }

// DELETE  http://localhost:8080/api/carts/{cartId}/products/{productId}

// PUT    http://localhost:8080/api/carts/{cartId}

// {

//   "products": [
//     {
//       "productID": "product-1",
//       "quantity": 3
//     },
//     {
//       "productID": "product-2",
//       "quantity": 1
//     }
//   ]
// }


// DELETE  http://localhost:8080/api/carts/{cartId}/products





