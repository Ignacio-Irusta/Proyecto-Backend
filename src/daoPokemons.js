const mongoose = require('mongoose')
const {Schema} = require('mongoose')

const noteSchema = new Schema ({
    id: { type: String, required: true },
    title: { type: String, required: true },
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
},{timestamps: true})

module.exports = mongoose.model('pokemons', noteSchema);