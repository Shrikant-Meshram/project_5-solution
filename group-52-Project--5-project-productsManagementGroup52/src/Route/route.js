const express=require('express')
const router = express.Router()


const UserController= require("../controllers/userController")
const ProductController= require("../controllers/productController")
const LoginAuth= require("../middleware/middle")
const CartController= require("../controllers/cartController")
const OrderController= require("../controllers/orderController")

//***********************************USER APIS*******************************************************/
router.post("/register",UserController.createUser)
router.post("/login",UserController.login)
router.get("/user/:userId/profile",LoginAuth.loginCheck, UserController.getUser)
router.put("/user/:userId/profile", UserController.updateUserDetails)

//*************************************PRODUCT APIS*********************************************/

router.post("/products", LoginAuth.loginCheck, ProductController.createProduct)
router.get("/products/:productId",ProductController.getProductsById)
router.delete("/products/:productId",ProductController.deleteProduct)
router.get("/products",ProductController.getByFilter)
router.put("/products/:productId",ProductController.updateProduct)

//***************************************CART APIS************************************************/
router.post("/users/:userId/cart", CartController.createCart)
router.get("/users/:userId/cart",CartController.getCart)
router.delete("/users/:userId/cart",CartController.deleteCart)
router.put("/users/:userId/cart",CartController.updateCart)

//****************************************ORDER APIS ***********************************/

router.post("/users/:userId/orders", OrderController.createOrder)
router.put("/users/:userId/orders", OrderController.updateOrder)










module.exports= router;