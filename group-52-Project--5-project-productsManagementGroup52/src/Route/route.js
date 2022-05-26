const express=require('express')
const router = express.Router()


const UserController= require("../controllers/userController")
const ProductController= require("../controllers/productController")
const LoginAuth= require("../middleware/middle")

router.post("/register",UserController.createUser)
router.post("/login",UserController.login)
router.get("/user/:userId/profile",LoginAuth.loginCheck, UserController.getUser)
router.put("/user/:userId/profile", UserController.updateUser)

router.post("/products",ProductController.createProduct)






module.exports= router;