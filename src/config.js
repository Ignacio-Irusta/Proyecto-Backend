const mongoose = require('mongoose')

const mongoUri = 'mongodb://localhost:27017/Proyecto-Coder'

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.log(err))