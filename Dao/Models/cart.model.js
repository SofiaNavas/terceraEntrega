const mongoose = require('mongoose');

const productSchema = mongoose.Schema({

  productID: String,
  quantity: Number
});

const cartSchema = mongoose.Schema({
  socketID: String,
  products: [productSchema]
});
const CartModel = mongoose.model('carts', cartSchema);

module.exports = CartModel;
