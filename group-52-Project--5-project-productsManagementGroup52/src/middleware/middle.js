const jwt= require("jsonwebtoken")
const userModel= require("../controllers/userController")
const secretKey= "Secret-key"


const loginCheck = async function(req, res, next) {
    try {

        let token = req.header("Authorization","Bearer Token")
        if (!token) {
            return res.status(401).send({ status: false, message: `Missing authentication token in request` })
        }
       
        let splitToken=token.split(" ")

        let decoded =jwt.verify(splitToken[1],secretKey)

        if (!decoded) {
            return res.status(401).send({ status: false, message: `Invalid authentication token in request` })
        }

        req.userId= decoded.userId
        //res.setHeader("x-api-key", token)
        next()
    } catch (error) {
        res.status(500).send({ status: false, Error: error.message })
    }
}


module.exports.loginCheck=loginCheck;