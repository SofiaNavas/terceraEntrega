
const socket = io();

console.log(socket);


socket.emit('mi_mensaje', 'primer mensaje enviado desde el cliente')

socket.on('recibiendomensajebackend', (data) => {

    console.log(data)
})

socket.on('nuevoProducto', (data) => {
     console.log('New product received:', data);
    updateProductTable(data); // Actualizar la tabla con la lista de productos completa

    
})

socket.on('deleteProduct', (data) => {
    console.log('Product deleted:', data);
    updateProductTable(data); // Actualizar la tabla con la lista de productos completa
});



socket.on('updatedProduct', (data) => {
    // console.log('Product updated:', data);
    updateProductTable(data); // Actualizar la tabla con la lista de productos completa
    console.log('PC1');
});


function updateProductTable(products) {
    const table = document.getElementById('productos');
    table.innerHTML = `<tr>
    <th>ID</th>
    <th>Title</th>
    <th>Description</th>
    <th>Code</th>
    <th>Price</th>
    <th>Status</th>
    <th>Stock</th>
    <th>Category</th>
  </tr>`; // Limpiar la tabla antes de agregar los productos actualizados
  
    products.forEach((product) => {
      const row = document.createElement('tr');
  
      row.innerHTML = `
      <td>${product._id}</td>
      <td>${product.title}</td>
      <td>${product.description}</td>
      <td>${product.code}</td>
      <td>${product.price}</td>
      <td>${product.status}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>
      `;
  
      table.appendChild(row);
    });
  }