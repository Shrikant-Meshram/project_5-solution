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

module.exports.createProduct=createProduct;
