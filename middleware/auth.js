const jwt = require('jsonwebtoken')
const User = require('../db/models/user')


const auth = async (req, res, next) => {
  
  try {
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({_id: decoded._id})

    if (!user) {
      res.status(401).redirect(`${process.env.STAGE}user/login`)
    }

    //it is neccessary to pass on the user in order to querry favorite movies
    req.user = user
    next()

  } catch (e) {
      res.status(401).redirect(`${process.env.STAGE}/user/login`)
  }

}


module.exports = auth