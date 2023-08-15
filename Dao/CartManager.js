const fs = require('fs');

class CartManager {
  constructor(path) {
    this.path = path;
    this.products = [];
    this.checkPath();
  }

  checkPath() {
    try {
      const fileContent = fs.readFileSync(this.path, 'utf-8');
      console.log("The file exists. The path is " + this.path);
      this.products = JSON.parse(fileContent) || [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('The file does not exist. Creating an empty file.');
        fs.writeFileSync(this.path, '[]', 'utf-8');
        console.log("The file was created in the path " + this.path);
      } else {
        console.error('Error reading products file:', error);
      }
    }
  }

  addProduct(data) {
    
    
     const product = {
      id: this.products.length + 1,
      product: data.product || [] // Default empty array for products
      
      
    };

    try {
      this.products.push(product);
      fs.writeFileSync(
        this.path,
        JSON.stringify(this.products, null, 2),
        'utf-8'
      );
      console.log("Product added successfully.");
    } catch (error) {
      console.error('Error in addProduct:', error);
    }
  }

  getProducts(){
    return this.products;
    }

    getProductById (id) {
        const findId = this.products.find(function(element) {
            return element.id === id;
          });

          if (!findId) {
            throw new Error("ID not found");
        } else {
            return findId
        }
    }

    updateProduct(cid, pid, quantity = 1) {
      const cartId = parseInt(cid);
      const productId = parseInt(pid);
      const productIndex = this.products.findIndex((element) => element.id === cartId);
  
      if (productIndex === -1) {
        throw new Error('The cart ID does not exist.');
      } else {
        const product = this.products[productIndex];
        const existingProductIndex = product.product.findIndex(
          (element) => element.productID === productId
        );
  
        if (existingProductIndex === -1) {
          // Add a new product to the cart
          const newProduct = {
            productID: productId,
            quantity: quantity,
          };
          product.product.push(newProduct);
        } else {
          // Increment the quantity of an existing product
          product.product[existingProductIndex].quantity += quantity;
        }
  
        fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
        console.log('Product updated successfully.');
      }
    }

    
}

module.exports = CartManager;