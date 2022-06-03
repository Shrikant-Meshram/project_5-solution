const cartModel= require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const Validation= require("../validator/validation")


const createCart = async function (req, res)
{
  try 
  {
      const data=req.body;
      const userIdbyParams=req.params.userId;
      let {userId, productId, cartId} = data;

      if (!Validation.isValid(userId)) return res.status(400).send({ status: false, message: 'please provide userId..!!' });
      
      const userByuserId = await userModel.findById(userIdbyParams);
      if (!userByuserId) return res.status(404).send({ status: false, message: 'user not found..!!' });
        
      if(userIdbyParams!==data.userId) return res.status(400).send({status:false, message:"Plz Provide Similar UserId's in params and body..!!"});

      const isProductPresent=await productModel.findOne({_id:productId, isDeleted:false});

      if(!isProductPresent) return res.status(404).send({status: false, message: `Product not found by this productId ${productId}`});
      
      if (data.hasOwnProperty("cartId")) 
      {  
          if (!Validation.isValid(cartId)) return res.status(400).send({ status: false, message: "cartId could not be blank..!!" });
          
          if (!Validation.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "cartId  is not valid..!!" });
            
          const isCartIdPresent = await cartModel.findById(cartId);

          if (!isCartIdPresent) return res.status(404).send({ status: false, message: `Cart not found by this cartId ${cartId}` });
          
          const cartIdForUser = await cartModel.findOne({ userId: userId });

          if (!cartIdForUser) return res.status(403).send({status: false,message: `User is not allowed to update this cart`});
          
          if (cartId !== cartIdForUser._id.toString()) return res.status(403).send({status: false,message: `User is not allowed to update this cart` });

          const isProductPresentInCart = isCartIdPresent.items.map((product) => (product["productId"] = product["productId"].toString()));

          if (isProductPresentInCart.includes(productId)) 
          {
          const updateExistingProductQuantity = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId":productId},
                  { $inc: {totalPrice: +isProductPresent.price,"items.$.quantity": +1,},}, { new: true });

          return res.status(200).send({ status: true, message: "Product quantity updated to cart",data: updateExistingProductQuantity});
          }

          const addNewProductInItems = await cartModel.findOneAndUpdate(
                  { _id: cartId },
                  {
                    $addToSet: { items: { productId: productId, quantity: 1 } },
                    $inc: { totalItems: +1, totalPrice: +isProductPresent.price },
                  },
                  { new: true }
              );

              return res.status(200).send({status: true, message: "Item updated to cart", data: addNewProductInItems,});

      }
      else{
          const isCartPresentForUser = await cartModel.findOne({ userId: userId });

          if (isCartPresentForUser) {
            return res.status(400).send({status: false, message: "cart already exist, provide cartId in req. body..!!"});
          }

          const productData = 
          {
            productId: productId,
            quantity: 1
          }

          const cartData = {
              userId: userId,
              items: [productData],
              totalPrice: isProductPresent.price,
              totalItems: 1,
            };

          const addedToCart = await cartModel.create(cartData);

          return res.status(201).send({ status: true, message: "New cart created and product added to cart", data: addedToCart });
      }
      }

       catch (err) {
       return res.status(500).send({status:false, message:err.message})
  }
}


const updateCart = async function (req, res) {
    try {
  
        const userId = req.params.userId
        let data = req.body
         let tokenId = req.userId
  
        let { cartId, productId, removeProduct } = data
        
        // user validation
        if(!Validation.isValid(userId)){
            return res.status(400).send({status : false, message : "user Id is missing in length"})
        }
  
        if (!Validation.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "user id is not valid" })
        }
        const validUser = await userModel.findById(userId);
        if (!validUser) {
            return res.status(404).send({ status: false, message: "User not present" })
        }
        // Authorisation
        if (tokenId !== userId) {
            return res.status(403).send({ status: false, message: "Unauthorized user" })
        }
  
        // checking data in request body
  
        if (!Validation.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please enter details to update the document" })
  
        }
        // cart validation
        
        if(!cartId){
            return res.status(400).send({status : flase, message : "cart id is a required field"})
        }
  
        if (!Validation.isValid(cartId)) {
            return res.status(400).send({ status: false, message: "cart id is missing in length" })
        }
  
        if (!Validation.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "cart id is not valid" })
        }
  
        const validCart = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!validCart) {
            return res.status(404).send({ status: false, message: "Cart with this parameters not present" })
        }
        // product validation
  
        if(!productId){
            return res.status(400).send({status : false, message : "Product id is required to this action"})
        }
  
        if (!Validation.isValid(productId)) {
            return res.status(400).send({ status: false, message: "product id is missing in length" })
        }
  
        if (!Validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "product id is not valid" })
        }
    
        const validProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!validProduct) {
            return res.status(404).send({ status: false, message: "Product not present" })
        }
  
        let items = validCart.items
        
        let productArr = items.filter(x => x.productId.toString() == productId)
        
        if (productArr.length == 0) {
            return res.status(404).send({ status: false, message: "Product is not present in cart" })
        }
  
        let index = items.indexOf(productArr[0])
  
        if(!removeProduct){
            return res.status(400).send({ status: false, message: "remove Product is a required field" })
        }
  
        if (!Validation.isValid(removeProduct)) {
            return res.status(400).send({ status: false, message: "Please enter removeProduct is missing in length" })
        }
  
        if (!([0, 1].includes(removeProduct))) {
            return res.status(400).send({ status: false, message: "RemoveProduct field can have only 0 or 1 value" })
        }
  
  
        if (removeProduct == 0) {
            
            validCart.totalPrice = (validCart.totalPrice - (validProduct.price * validCart.items[index].quantity)).toFixed(2)
            validCart.items.splice(index, 1)
  
            validCart.totalItems = validCart.items.length
            validCart.save()
  
        }
  
        if (removeProduct == 1) {
          
            validCart.items[index].quantity -= 1
            validCart.totalPrice = (validCart.totalPrice - validProduct.price).toFixed(2)
            
            if (validCart.items[index].quantity == 0) {
                validCart.items.splice(index,1)
  
            }
            validCart.totalItems = validCart.items.length
  
            validCart.save()
  
        }
       
        
        return res.status(200).send({ status: true, data: validCart })
  
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
  
    }
  }







const getCart = async function (req, res) {

    try {
        const userId = req.params.userId
        const jwtUserId = req.userId

        //    authroization 

        if (!(userId === jwtUserId)) {
            return res.status(400).send({ status: false, msg: "unauthorized access" })
        }

        const checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) {
            return res.status(400).send({ status: false, msg: 'cart does not exist ' })
        }
        const checkUser = await userModel.findById(userId)
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: 'user does  does not exist ' })
        }

        res.status(200).send({ status: true, msg: 'sucess', data: checkCart })
    }
    catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }

}


const deleteCart = async function (req, res) {
    try {
        //let userId = req.params.userId
        let userIdFromParams = req.params.userId
        let userIdFromToken = req.userId
        if (! Validation.isValidObjectId(userIdFromParams)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }

        const findUserById = await userModel.findOne({ _id: userIdFromParams})

        if (!findUserById) {
            return res.status(404).send({ status: false, message: "No user found" })
        }

        if (userIdFromToken != userIdFromParams) {
          return res.status(403).send({status: false,message: "Unauthorized access.",});
      }

        const findCartById = await cartModel.findOne({ userId: userIdFromParams})

        if (!findCartById) {
            return res.status(404).send({ status: false, message: "No cart Available,Already deleted" })
        }


        const deleteProductData = await cartModel.findOneAndUpdate({ userId: userIdFromParams  },
            { $set: { items:[],totalItems:0,totalPrice:0} },
            { new: true })

            await cartModel.findOne({ userId: userIdFromParams })

        return res.status(200).send({ status: true, message: "cart deleted successfullly.",data:deleteProductData })

        
    }catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}





module.exports.createCart=createCart;
module.exports.getCart=getCart;
module.exports.deleteCart=deleteCart;
module.exports.updateCart=updateCart;


