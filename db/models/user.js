const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
})

userSchema.virtual('movies', {
  ref: 'Movie',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.statics.authenticateByCredentials = async (username, password) => { 

  const user = await User.findOne({username})
  if (!user) {throw new Error('Unable to login. Check your username and password.')}
                      
  const isMatch = await bcrypt.compare(password, user.password)
  if(!isMatch) {throw new Error('Unable to login. Check your username and password.')}

  return user
  
}

userSchema.methods.GenerateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET)
  return token
}

const User = mongoose.model('User', userSchema)

module.exports = User