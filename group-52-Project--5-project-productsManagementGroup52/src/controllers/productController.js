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

module.exports.createProduct=createProduct;
module.exports.getProductsById=getProductsById;
module.exports.deleteProduct=deleteProduct;
