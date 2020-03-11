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

        //dal token treba? Ukoliko ga ne pospremamo nigdje?
        req.token = token
        req.user = user
        next()
    } catch (e) {
      res.status(401).redirect(`${process.env.STAGE}/user/login`)
    }
}


module.exports = auth