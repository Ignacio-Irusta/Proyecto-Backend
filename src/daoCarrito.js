const mongoose = require('mongoose')
const { Schema } = mongoose;

const noteSchema = new Schema ({
    id: String,
    title: String,
    stock: Number,
    price: Number,
    image: String
},)

module.exports = mongoose.model('carrito', noteSchema);