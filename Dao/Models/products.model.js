const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  title: String,
  description: String,
  code: {
    type: String,
    unique: true
  },
  price: Number,
  status: Boolean,
  stock: Number,
  category: String,
  thumbnail: Array
});

const ProductModel = mongoose.model('products', productSchema);

module.exports = ProductModel;
