const mongoose = require('mongoose')
const { Schema } = mongoose;
const bcrypt = require('bcrypt-nodejs')

const userSchema = new Schema({
    email: String,
    password: String,
    name: String,
    direction: String,
    phone: String,
    image: String,
    type: String
});

userSchema.methods.encryptPassword = (password) =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

userSchema.methods.encryptPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
};

module.exports = mongoose.model('users', userSchema)