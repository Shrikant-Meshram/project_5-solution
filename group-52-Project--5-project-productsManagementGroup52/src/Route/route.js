const express=require('express')
const router = express.Router()


const UserController= require("../controllers/userController")
const ProductController= require("../controllers/productController")
const LoginAuth= require("../middleware/middle")
const CartController= require("../controllers/cartController")

router.post("/register",UserController.createUser)
router.post("/login",UserController.login)
router.get("/user/:userId/profile",LoginAuth.loginCheck, UserController.getUser)
router.put("/user/:userId/profile", UserController.updateUserDetails)

//*************************************PRODUCT APIS******************************************** */

router.post("/products",ProductController.createProduct)
router.get("/products/:productId",ProductController.getProductsById)
router.delete("/products/:productId",ProductController.deleteProduct)
router.get("/products",ProductController.getByFilter)
router.put("/products/:productId",ProductController.updateProduct)

//***************************************CART APIS************************************************/
router.post("/users/:userId/cart",CartController.createCart)










module.exports= router;