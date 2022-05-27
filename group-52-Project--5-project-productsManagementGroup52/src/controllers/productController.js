const productModel = require("../models/productModel")
const validator = require("validator")
const Validation = require("../validator/validation")
const bcrypt = require("bcrypt")
const jwt=require("jsonwebtoken")
//const saltRounds = 10;

const uploadFile= require ("../aws s3/aws")


const createProduct = async function (req, res) 
{
    try 
    {
        let data = req.body;
        let files = req.files;
      
        if (!Validation.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide some data" })
        }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;



       if(!title){
           return res.status(400).send({status:false, msg:"title required..!!"})
        };

        if(!Validation.isValid(title)){
             return res.status(400).send({status:false, msg:"title required..!!"})
        };

       let duplicateTitle = await productModel.findOne({title:title});

       if(duplicateTitle) {
            return res.status(400).send({status:false, msg: "title already exist in use..!!"})
       };


       
    if(!description) {
        return res.status(400).send({status:false, msg:"description required..!!"})
    };

    if(!Validation.isValid(description)){
        return res.status(400).send({status:false, msg:"description required..!!"})
    };


    if(!price) {
        return res.status(400).send({status:false, msg: "price required..!!"})
    };
    if(!currencyId){ 
        return res.status(400).send({status:false, msg: "currencyId required..!!"})
    };
        
    if(!currencyFormat) {
        return res.status(400).send({status:false, msg: "currency format required..!!"})
    };

    // if(!Validation.isValidTitle(availableSizes)) {
    //     return res.status(400).send({status:false, msg: "please choose the size from the available sizes.!!"})
    // };
    if(currencyId != "INR"){
         return res.status(400).send({status:false, msg: "only indian currencyId INR accepted..!!"})
        };
    if(currencyFormat != "₹"){
         return res.status(400).send({status:false, msg: "only indian currency ₹ accepted..!!"})
        };


    if (files.length > 0) 
    {
      var  profileImages = await uploadFile.uploadFile(files[0]);
    }

        data.productImage = profileImages;

       data.availableSizes = JSON.parse(availableSizes);

        if(!data.productImage) {
            return res.status(400).send({status:false, msg: "productImage required..!!"})
        };

        const saveData = await productModel.create(data);

        return res.status(201).send({ status: true, data: saveData });
    }
    catch (err) 
    {
        console.log(err);
        return res.status(500).send({ status: false, msg: err.message }) 
    }
}

const getProductsById = async (req, res) => {
    try{
      let productId = req.params.productId;
  
      //checking is product id is valid or not
      if (!Validation.isValidObjectId(productId)){
        return res.status(400).send({ status: false, message: 'Please provide valid productId' })
      }
    
      const product = await productModel.findOne({ _id: productId, isDeleted:false})
      if(!product) return res.status(404).send({ status: false, message:"No product found"})
  
      return res.status(200).send({ status: true, message: 'success', data: product})
    } catch (err) {
      res.status(500).send({ status: false, error: err.message })
    }
  }
const getProducts = async (req, res) => {
    try{
      let productId = req.params.productId;
  
      //checking is product id is valid or not
    //   if (!Validation.isValidObjectId(productId)){
    //     return res.status(400).send({ status: false, message: 'Please provide valid productId' })
    //   }
    
      const product = await productModel.find({  isDeleted:false})
      if(!product) return res.status(404).send({ status: false, message:"No product found"})
  
      return res.status(200).send({ status: true, message: 'success', data: product})
    } catch (err) {
      res.status(500).send({ status: false, error: err.message })
    }
  }

  const deleteProduct = async function (req, res) {
    try {
      let id = req.params.productId;
  
      if (!Validation.isValidObjectId(id)) {
        return res.status(400).send({ status: false, message: `productId is invalid.` });
      }
  
      let findProduct = await productModel.findOne({ _id: id });
  
      if (!findProduct) {
        return res.status(400).send({ status: false, msg: "No such Product found" });
      }
  
      const alreadyDeleted= await productModel.findOne({_id: id, isDeleted: true})
  
      if(alreadyDeleted) {
        return res.status(400).send({ status: false, msg: `${alreadyDeleted.title} is already been deleted.` })
      }
  
      
      
      let data = await productModel.findOne({ _id: id });
      if (data.isDeleted == false) {
        let Update = await productModel.findOneAndUpdate(
          { _id: id },
          { isDeleted: true, deletedAt: Date() },
          { new: true }
        );
        return res.status(200).send({status: true,message: "successfully deleted the product",data:Update});
      } 
  
    } catch (err) {
        console.log(err)
      res.status(500).send({ status: false, Error: err.message });
    }
  };






  const updateProductDetails = async function (req, res) {

    try {

        let files = req.files
        let productDetails = req.body
        let productId = req.params.productId
        
        //let userIdFromToken = req.userId

        if (!Validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid UserId" })
        }

        const findProductData = await productModel.findById(productId)

        if (!findProductData) {
            return res.status(400).send({ status: false, message: "user not found" })
        }

        // if (!Validation.isValidRequestBody(productDetails)) {
        //     return res.status(400).send({ status: false, message: "Please provide user's details to update." })
        // }

        // if (findUserData._id != userIdFromToken) {
        //     return res.status(401).send({ status: false, message: "You Are Not Authorized!!" })
        // }

        let { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes, installments } =productDetails

        // if (!Validation.isValid(title)) {
        // return res.status(400).send({ status: false, message: 'title is Required' })
        // }

        const checkTitleFromDb = await productModel.findOne({ title:title})

        if (checkTitleFromDb) {
        return res.status(400).send({ status: false, message: `${productDetails.title} is already in use, Please try a new title.` })
    }



      
        // if (!Validation.isValid(description)) {
        //     return res.status(400).send({ status: false, message: 'description is Required' })
        // }
       
       
      
      
        // if (! Validation.isValid(price)) {
        //     return res.status(400).send({ status: false, message: 'price should be in the form a number' })
        // }

        // if (!/\d/.test(price)) {
        //     return res.status(400).send({ status: false, message: 'price should be in the form a number only' })
        // }



        
    
        // if (!Validation.isValid(currencyId)) { 
        //     return res.status(400).send({ status: false, message: 'curencyId is not valid' })
        // }

        // if (currencyId != "INR") {
        //     return res.status(400).send({ status: false, message: 'Currency should be in the form of INR only.' })
        // }



        // if (!Validation.isValid(currencyFormat)) { 
        //     return res.status(400).send({ status: false, message: 'curencyFormat is not valid' })
        // }

        // if(currencyFormat != "₹"){
        //     return res.status(400).send({status:false, msg: "only indian currency ₹ accepted..!!"})
        //    };
   

    

        // if (!Validation.isValid(style)) {
        //     return res.status(400).send({ status: false, message: 'style should be valid.' })
        // }
        
 

        // if (!Validation.isValid(installments)) {
        //     return res.status(400).send({ status: false, message: 'installments should be valid.' })
        // }

        // if (!/\d/.test(installments)) {
        //     return res.status(400).send({ status: false, message: 'installments should be in the form a number only' })
        // }



       
    //    if(productImage){
    //     if (files) {
            
    //             if (!(files && files.length > 0)) 
    //             return res.status(400).send({ status: false, message: "please provide profile image" })
                
    //             let productImage = await aws_s3.uploadFile(files[0])
    //             userDetails.profileImage=productImage
    //         }
    //     }

        // if(
        //     req.body.availableSizes
        // ) 
      
    //    availableSizes= availableSizes.toString()

        // if (!Validation.isValidTitle(availableSizes)) {
        //     return res.status(400).send({status:false, msg: "Available sizes should be from given sizes"})   
        // }

        
        // let sizes = availableSizes.toUpperCase().split(" ")
        //     let arr = ["S", "XS","M","X", "L","XXL", "XL"]


            // if(sizes.some(x => !arr.includes(x.trim())))
            //    return res.status(400).send({status : false, message : `available sizes must be in ${arr}`})
            
              // productDetails.availableSizes = sizes
        

        console.log(productDetails)

        let updateProduct= await productModel.findOneAndUpdate({_id :productId}, {$set : {...productDetails}, updatedAt: Date.now()}, {new : true, upsert : true})
        

        return res.status(200).send({ status: true, msg:"Product Update Successful!!",data: updateProduct })
   



    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message })
    }
}


module.exports.createProduct=createProduct;
module.exports.getProductsById=getProductsById;
module.exports.deleteProduct=deleteProduct;
module.exports.getProducts=getProducts;
module.exports.updateProductDetails=updateProductDetails;
