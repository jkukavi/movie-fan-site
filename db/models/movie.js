const mongoose = require('mongoose')

var MovieSchema = new mongoose.Schema({

  title: String,

  poster_path: String,

  overview: String,

  id: String, 

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  } 

})
  

module.exports = mongoose.model('Movie', MovieSchema)