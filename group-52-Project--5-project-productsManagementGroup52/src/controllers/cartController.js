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

module.exports.createCart=createCart;
