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

      if (!Validation.isValidRequestBody(requestBody)){
        return res.status(400).send({ status: false, message:"Please provide some input" })
      }

      const {orderId, status}= requestBody

      if(!Validation.isValidObjectId(orderId)){
        return res.status(400).send({ status: false, message:"Please provide valid order id" })
      }

      if (!orderId){
        return res.status(400).send({ status: false, message:`Please provide order id`})
      }


      if(!Validation.isValidObjectId(userId)){
        return res.status(400).send({ status: false, message:"Please provide valid user id" })
      }

      const userExist= await userModel.findOne({_id: userId}) 
      if (!userExist){
        return res.status(404).send({ status: false, message:"User does not exist" })
      }

      const orderBelong= await orderModel.findOne({userId: userId}) 
          if (!orderBelong) {
            return res.status(404).send({ status: false, message:"This Order do not belong to the user." })    
      }

      if (!status) {
        return res.status(400).send({ status: false, message:"please provide a status" }) 
      }

   

    if (!Validation.isValid(status)){ 
        return res.status(400).send({ status: false, message:"please provide a valid status" }) 
    }

    if(orderBelong.status== "completed") {
        return res.status(400).send({ status: false, message:"oreder already completed, cannot update" }) 
    }
    if(orderBelong.status== "cancelled") {
        return res.status(400).send({ status: false, message:"oreder already completed, cannot update" }) 
    }

    if (orderBelong.status=="pending") {
        const updateOrder= await orderModel.findOneAndUpdate({_id: orderId}, {$set:{status:status}}, {new:true})
        return res.status(200).send({ status: true, message:"order updated successfully", data: updateOrder})
    }

    
    } catch(err){
        console.log(err)
    return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports.createOrder=createOrder;
module.exports.updateOrder=updateOrder;
