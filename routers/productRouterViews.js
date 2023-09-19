const express = require('express');
const ProductModel = require('../Dao/Models/products.model');

const Router = express.Router;

const app = express();
const productRouterViews = Router()


app.use(express.json())
app.use(express.urlencoded({extended: true}))


  
  // Endpoint dinamico para obtener un producto por su ID 
  productRouterViews.get('/:pid', async (req, res) => {
    const productId = req.params.pid; // Obtener el ID del producto como entero
   console.log('paso 1')
    try {
      const product = await ProductModel.findById(productId); // Usar el método findById() de Mongoose para buscar el producto por su ID
      console.log('paso 2')
      

      if (!product) {
        res.status(404).json({ error: 'Producto no encontrado' });
        console.log('paso 3-1')
      } else {

        const formattedProduct = 
       { ...product.toObject(), // Convert Mongoose object to plain object
       _id: product._id.toString()};
      
        return res.render('product', formattedProduct)
        
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el producto' });
      console.log('paso 4')
    }
  });

// Ruta para mostrar todos los productos con paginación y filtros
productRouterViews.get('/', async (req, res) => {
  // user = {name:"juan", lastname:"perez", email:"email", age:30}
  user= req.session.user
  console.log(user)
  try {
      const { limit, page, sort, query } = req.query;

      let products = await ProductModel.find({});
      let formattedProducts = products.map(product => ({
        ...product.toObject(), // Convert Mongoose object to plain object
         _id: product._id.toString()
      }));

      // Aplicar filtros según el query param "query"
      // if (query) {
      //   formattedProducts = formattedProducts.filter(product => product.category === query);
      // } 
      try {
        if (query) {
          formattedProducts = formattedProducts.filter(product => product.category === query);
        }
      } catch (error) {
        console.error('Error al filtrar productos por categoría:', error);
      }

      // Ordenar según el query param "sort"
      if (sort === 'desc') {
        formattedProducts.sort((a, b) => b.price - a.price);
      } else if (sort === 'asc') {
        formattedProducts.sort((a, b) => a.price - b.price);
      }

      // Calcular paginación
      const perPage = limit ? parseInt(limit) : 10;
      const currentPage = page ? parseInt(page) : 1;
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;

      // Aplicar paginación
      const paginatedProducts = formattedProducts.slice(startIndex, endIndex);
      

      const params = {
          title: 'Prueba',
          products: paginatedProducts,
          totalPages: Math.ceil(formattedProducts.length / perPage),
          prevPage: currentPage > 1 ? currentPage - 1 : null,
          nextPage: currentPage < Math.ceil(formattedProducts.length / perPage) ? currentPage + 1 : null,
          currentPage: currentPage,
          user:user
      };

      
      res.render('products', params);
  } catch (error) {
      res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// Agregar un nuevo producto
productRouterViews.post('/', async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await ProductModel.create(productData); // Usar el método create() de Mongoose para crear un nuevo producto
    const updatedProducts = await ProductModel.find({}); // Obtener la lista actualizada de productos
    const formattedProducts = updatedProducts.map(product => ({
      ...product.toObject(), // Convert Mongoose object to plain object
       _id: product._id.toString()
    }));
    // Emitir el evento de nuevo producto y actualizar productos a través del socket.io
    req.io.emit('nuevoProducto', formattedProducts);
    console.log('Product added:', newProduct);
    console.log('nuevoProducto - PC2')
    
    res.status(201).json({ message: 'Product added successfully.', product: newProduct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

  // Actualizar un producto
  productRouterViews.put('/:pid', async (req, res) => {
  const productId = req.params.pid;
  const updatedFields = req.body;
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updatedFields,
      { new: true } // La opción { new: true } devuelve el producto actualizado después de la actualización
    );

    if (!updatedProduct) {
      res.status(404).json({ error: 'Producto no encontrado' });
    } else {
           
        const updatedProducts3 = await ProductModel.find({}); // Obtener la lista actualizada de productos
        const formattedProducts3 = updatedProducts3.map(product => ({
          ...product.toObject(), // Convert Mongoose object to plain object
           _id: product._id.toString()
        }));
    
          req.io.emit('updatedProduct', formattedProducts3);
      res.json({ message: 'Product updated successfully.', product: updatedProduct });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
  


productRouterViews.delete('/:pid', async (req, res) => {
  const productId = req.params.pid;
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    
    if (deletedProduct) {

      
    const updatedProducts2 = await ProductModel.find({}); // Obtener la lista actualizada de productos
    const formattedProducts2 = updatedProducts2.map(product => ({
      ...product.toObject(), // Convert Mongoose object to plain object
       _id: product._id.toString()
    }));

      req.io.emit('deleteProduct', formattedProducts2);
      console.log('Product deleted:', productId);
      console.log('deletedProduct')
      res.json({ message: 'Product deleted successfully.', product: deletedProduct });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



  module.exports=productRouterViews



  /// Para probar filtros y paginado

//  http://localhost:8080/api/products?query=Comestibles&sort=desc

// http://localhost:8080/api/products?query=Electronicos

// http://localhost:8080/api/products?sort=asc

// http://localhost:8080/api/products?limit=5&page=2