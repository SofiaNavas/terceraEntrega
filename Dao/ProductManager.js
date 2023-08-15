const fs = require('fs');

class ProductManager {
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
    if (!data.title || !data.description || !data.code || !data.price || !data.stock || !data.category) {
        throw new Error(
          "Title, description, code, price, stock, and category are mandatory properties."
        );
      }
    
    if (typeof data.title !== 'string' || typeof data.description !== 'string' ||
          typeof data.code !== 'string' || typeof data.price !== 'number' ||
          typeof data.status !== 'boolean' || typeof data.stock !== 'number' ||
          typeof data.category !== 'string' ) {
        throw new Error("Invalid data types for one or more fields.");
      }

    const findCode = this.products.find(function(element) {
        return element.code === data.code;
         });


        if (findCode) {
            throw new Error("El campo code no se puede repetir");
       }


    const product = {
      id: this.products.length + 1,  // CAMBIAR ESTO PARA QUE AGREGUE EN FUNCION DEL ID MAS GRANDE Y QUE NO SE PUEDA REPETIR
      title: data.title,
      description: data.description,
      code: data.code,
      price: data.price,
      status: data.status !== undefined ? data.status : true, // Default status is true
      stock: data.stock,
      category:data.category,
      thumbnail: data.thumbnail || [] // Default empty array for thumbnails
      
      
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

    getProductByCode (data) {

      const code = data.code
      const findCode = this.products.find(function(element) {
          return element.code === code;
        });

        if (!findCode) {
          throw new Error("Code not found");
      } else {
          return findCode
      }
  }

    updateProduct (id, updatedFields) {
        const findId = this.products.findIndex(function(element) {
            return element.id === id;
          });

          if (findId === -1) {
            throw new Error("ID not found");
        } else {
            
            const updatedProduct = {
                ...this.products[findId],
                ...updatedFields,
                id: this.products[findId].id, // Retain the original ID
              };
              
              this.products[findId] = updatedProduct;

              try {
                fs.writeFileSync(
                  this.path,
                  JSON.stringify(this.products, null, 2),
                  'utf-8'
                );
                console.log("Product updated successfully.");
              } catch (error) {
                console.error('Error in updateProduct:', error);
              }
            }
    }

    deleteProduct(id) {
        const findId = this.products.findIndex(function(element) {
            return element.id === id;
          });
    
        if (findId === -1) {
          throw new Error("ID not found");
        } else {
          this.products.splice(findId, 1);
    
          try {
            fs.writeFileSync(
              this.path,
              JSON.stringify(this.products, null, 2),
              'utf-8'
            );
            console.log("Product deleted successfully.");
          } catch (error) {
            console.error('Error in deleteProduct:', error);
          }
        }
    }
}

module.exports = ProductManager;

//Casos de prueba

// Prueba 1: crear una instancia de la clase "Product Manager"

/*
const manager = new ProductManager('./prueba.json');
console.log(manager.getProducts()); 
*/

//Prueba 2: 

/*
const manager = new ProductManager('./prueba.json');
console.log(manager.getProducts()); 
manager.addProduct({
      
    "title": "Prueba 06/07/2023",
    "description": "Description",
    "code": "a2",
    "price": 10,
    "status": true, // Default status is true
    "stock": 10,
    "category":"Category"
    }); 
console.log(manager.getProducts());



//Prueba 3
/*
const manager = new ProductManager('./prueba.json');
console.log(manager.getProductById(1));
*/

//Prueba 4
/*
const manager = new ProductManager('./prueba.json');
console.log(manager.updateProduct(1, {title: 'Nuevo título'}));
*/

//Prueba 5
/*
const manager = new ProductManager('./prueba.json');
console.log(manager.deleteProduct(1));
*/