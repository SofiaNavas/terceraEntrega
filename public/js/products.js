const socket = io();

console.log(socket);

function addToCart(productId) {
    
    // Emitir el evento 'addToCart' al servidor con el productId
    socket.emit('addToCart', { socketId: socket.id, productId });
    console.log('Agregando al carrito: ' + productId);
}