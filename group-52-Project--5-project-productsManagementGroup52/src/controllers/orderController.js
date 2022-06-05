const orderModel= require('../models/orderModel')
const cartModel= require('../models/cartModel')
const Validation= require('../validator/validation')
const userModel= require('../models/userModel')
const productModel= require('../models/productModel')

const createOrder = async (req, res) => {
    try {
        let data = req.body
        let Userid = req.params.userId


        // if (Object.keys(data).length == 0) {
        //     return res.status(400).send({ status: false, meassage: "please enter data in body " })
        // }

        if (!Validation.isValidObjectId(Userid)) {
            return res.status(400).send({ status: false, message: "Enter valid UserId" })
        }

            let cartDeatils = await cartModel.findOne({ userId: Userid })

            
         

            data.userId = Userid   
        
            const itemList = cartDeatils.items
            data.items = itemList     


            data.totalPrice = cartDeatils.totalPrice  

            data.totalItems = cartDeatils.totalItems 

            let totalquantitye = 0
            for (let i = 0; i < itemList.length; i++) {
                totalquantitye += itemList[i].quantity
            }


            data.totalQuantity = totalquantitye  

            let order = await orderModel.create(data)

            return res.status(201).send({ status: true, message: "order created succefully", data: order })


    

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateOrder= async function (req,res) {
    try{
      const userId= req.params.userId;
      const requestBody= req.body
      const tokenId = req.userId
      if (!Validation.isValidRequestBody(requestBody)){
        return res.status(400).send({ status: false, message:"Please provide some input" })
      }

      const {orderId, status}= requestBody

      if (!orderId){
        return res.status(400).send({ status: false, message:`Please provide order id`})
      }

      if(!Validation.isValidObjectId(orderId)){
        return res.status(400).send({ status: false, message:"Please provide valid order id" })
      }

     


      if(!Validation.isValidObjectId(userId)){
        return res.status(400).send({ status: false, message:"Please provide valid user id" })
      }

      const userExist= await userModel.findOne({_id: userId}) 
      if (!userExist){
        return res.status(404).send({ status: false, message:"User does not exist" })
      }

      if (userExist._id.toString() != tokenId) {
        res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
        return
    }



      const isOrderBelongsToUser= await orderModel.findOne({_id: orderId}) 
      console.log(isOrderBelongsToUser)  
          if (!isOrderBelongsToUser) {
            return res.status(404).send({ status: false, message:"This Order do not belong to the user." }) 
            console.log(isOrderBelongsToUser)   
      }
      if(isOrderBelongsToUser.userId != userId){
        return res.status(400).send({status:false,msg:"This order does not belongs to you"})
      }
        

      if (!status) {
        return res.status(400).send({ status: false, message:"please provide a status" }) 
      }

   

      if (!Validation.isValidStatus(status)) {
        return res
            .status(400)
            .send({
                status: false,
                message: "Invalid ,Please Choose either 'pending','completed', or 'cancelled'."
            });
    }

    //if cancellable is true then status can be updated to any of te choices.
    if (isOrderBelongsToUser["cancellable"] == true) {
        if ((Validation.isValidStatus(status))) {
            if (isOrderBelongsToUser['status'] == 'pending') {
                const updateStatus = await orderModel.findOneAndUpdate({ _id: orderId }, {
                    $set: { status: status }
                }, { new: true })
                return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updateStatus })
            }

            //if order is in completed status then nothing can be changed/updated.
            if (isOrderBelongsToUser['status'] == 'completed') {
                return res.status(400).send({ status: false, message: `Unable to update or change the status, because it's already in completed status.` })
            }

            //if order is already in cancelled status then nothing can be changed/updated.
            if (isOrderBelongsToUser['status'] == 'cancelled') {
                return res.status(400).send({ status: false, message: `Unable to update or change the status, because it's already in cancelled status.` })
            }
        }
    }
    //for cancellable : false
    if (isOrderBelongsToUser['status'] == "completed") {
        if (status) {
            return res.status(400).send({ status: false, message: `Cannot update or change the status, because it's already in completed status.` })
        }
    }

    if (isOrderBelongsToUser['status'] == "cancelled") {
        if (status) {
            return res.status(400).send({ status: false, message: `Cannot update or change the status, because it's already in cancelled status.` })
        }
    }

    if (isOrderBelongsToUser['status'] == "pending") {
        if (status) {
            if (status == "cancelled") {
                return res.status(400).send({ status: false, message: `Cannot cancel the order due to Non-cancellable policy.` })
            }
            if (status == "pending") {
                return res.status(400).send({ status: false, message: `Cannot update status from pending to pending.` })
            }

            const updatedOrderDetails = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })

            return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updatedOrderDetails })
           
        }
    }

} catch (err) {
    return res.status(500).send({ status: false, message: err.message });
}
}


module.exports.createOrder=createOrder;
module.exports.updateOrder=updateOrder;
