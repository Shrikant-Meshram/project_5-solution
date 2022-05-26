const userModel = require("../models/userModel")
const validator = require("validator")
const Validation = require("../validator/validation")
const bcrypt = require("bcrypt")
const jwt=require("jsonwebtoken")
//const saltRounds = 10;

const uploadFile= require ("../aws s3/aws")
const { json, send } = require("express/lib/response")




const createUser = async function (req, res) {
    try {
           let data = req.body
      
    let files= req.files
     
        const { fname, lname, email, profileImage, phone, password, address, } = data

        if (!Validation.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide some data" })
        }

        if (!fname) {
            return res.status(400).send({ status: false, msg: "please provide fname." })
        }

        if (!Validation.isValid(fname)) {
            return res.status(400).send({ status: false, msg: "please provide valid fname." })
        }

        if (!lname) {
            return res.status(400).send({ status: false, msg: "please provide lname." })
        }

        if (!Validation.isValid(lname)) {
            return res.status(400).send({ status: false, msg: "please provide valid lname." })
        }

        if (!email) {
            return res.status(400).send({ status: false, msg: "please provide email address." })
        }

        if (!Validation.isValid(email)) {
            return res.status(400).send({ status: false, msg: "please provide valid email address." })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, msg: "please provide a valid email address." })
        }

        const uniqueEmail = await userModel.findOne({ email: email })

        if (uniqueEmail) {
            return res.status(400).send({ status: false, msg: "email address already registered." })
        }

        // if (!profileImage) {
        //     return res.status(400).send({ status: false, msg: "please provide profileImage." })
        // }

        if (!phone) {
            return res.status(400).send({ status: false, msg: "please provide phone number." })
        }

        if (!validator.isNumeric(phone)) {
            return res.status(400).send({ status: false, msg: "please provide valid phone number." })  // test with indian number
        }

        if (phone.length != 10) {
            return res.status(400).send({ status: false, msg: "please provide valid 10 digit phone number." })
        }

        const uniquePhone = await userModel.findOne({ phone: phone })

        if (uniquePhone) {
            return res.status(400).send({ status: false, msg: "Phone Number already registered." })
        }


        if (!password) {
            return res.status(400).send({ status: false, msg: "please provide password." })
        }

        if (!Validation.isValid(password)) {
            return res.status(400).send({ status: false, msg: "please provide valid password." })
        }

        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, msg: "The length of password should be between 8 and 15" })
        }

        const salt = await bcrypt.genSalt(10)
        data.password= await bcrypt.hash(data.password, salt )



        if (!address) {
            return res.status(400).send({ status: false, msg: "please provide address" })
        }

        
        if (!Validation.isValid(address)) {
            return res.status(400).send({ status: false, msg: "please provide valid address." })
        }

        
        if (!address.shipping) {
            return res.status(400).send({ status: false, msg: "please provide shipping details" })
        }


        if (!Validation.isValid(address.shipping)) {
            return res.status(400).send({ status: false, msg: "please provide valid address." })
        }


        if (!address.shipping.street) {
            return res.status(400).send({ status: false, msg: "please provide shipping street details" })
        }

        
        if (!Validation.isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, msg: "please provide valid shipping street address." })
        }

        if (!address.shipping.city) {
            return res.status(400).send({ status: false, msg: "please provide shipping city details" })
        }


        if (!Validation.isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, msg: "please provide valid shipping city address." })
        }

        if (!address.shipping.pincode) {
            return res.status(400).send({ status: false, msg: "please provide shipping pincode details" })
        }

        if (!Validation.isValid(address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "please provide valid shipping pincode address." })
        }

        // if (!/^[1-9][0-9]{5}$/.test(address.billing.pincode)) {
        //     return res.status(400).send({ status: false, msg: "please provide a 6 digit pincode" })
        // }


        if (!(address.shipping.pincode).length == 6 ) {
            return res.status(400).send({ status: false, msg: "please provide valid 6 digit pincode ." })
        }

       

        if (!address.billing) {
            return res.status(400).send({ status: false, msg: "please provide billing details" })
        }


        if (!Validation.isValid(address.billing)) {
            return res.status(400).send({ status: false, msg: "please provide valid billing address." })
        }


        if (!address.billing.street) {
            return res.status(400).send({ status: false, msg: "please provide billing street details" })
        }

        
        if (!Validation.isValid(address.billing.street)) {
            return res.status(400).send({ status: false, msg: "please provide valid billing street address." })
        }

        if (!address.billing.city) {
            return res.status(400).send({ status: false, msg: "please provide city details for billing" })
        }


        if (!Validation.isValid(address.billing.city)) {
            return res.status(400).send({ status: false, msg: "please provide valid city address for billing." })
        }

        if (!address.billing.pincode) {
            return res.status(400).send({ status: false, msg: "please provide billing pincode details" })
        }

        if (!Validation.isValid(address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "please provide valid billing pincode address." })
        }

        
        // if (!/^[1-9][0-9]{5}$/.test(address.billing.pincode)) {
        //     return res.status(400).send({ status: false, msg: "please provide a 6 digit pincode" })
        // }
    


        if (!(address.billing.pincode).length == 6 ) {
            return res.status(400).send({ status: false, msg: "please provide valid 6 digit pincode ." })
        }

      let profileImgUrl = await uploadFile.uploadFile(files[0]);
     data.profileImage = profileImgUrl;



        let allData= await userModel.create(data);
        return res.status(201).send({status:true, msg:"user created successfully..", msg2: allData})


     
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }

}

const login= async function(req, res)
{
    try
    {
        let user= req.body

       let email= req.body.email
       let password= req.body.password

        if (!Validation.isValidRequestBody(user)) {
            return res.status(400).send({ status: false, msg:"please provide some data in the body." })
        }
        

        if(!email) {
            return res.status(400).send({ status: false, msg:"email is required." })
        }
     
        if(!Validation.isValid(email)) { 
            return res.status(400).send({ status: false, msg:"valid email is required." })
        }
     
        if(!password) {
            return res.status(400).send({ status: false, msg:"password is required." })
        }

        if(!Validation.isValid(password)) { 
            return res.status(400).send({ status: false, msg:"valid password is required." })
        }

        

        let duplicateEmail= await userModel.findOne({email:email})
        if(!duplicateEmail) {
            return res.status(400).send({ status: false, msg:"User is not registered." })
        }

        // if (req.body.password != password) {
        //     return res.status(400).send({status: false, msg: "password is not correct"})
        // }
        let hashpassword=duplicateEmail.password

       let hashed=await bcrypt.compare(password,hashpassword)

       if(!hashed) {
        return res.status(400).send({ status: false, msg:"Please provide correct password" })
       }
        
            //if(result)
            
                let token= jwt.sign({
                    userId: duplicateEmail._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now()/ 1000) + 10 *60 * 60
                }, "Secret-key");
              
                res.status(200).setHeader("x-api-key", token);
                return res.status(201).send({ status: true, message:"User login successfull", data:{userId:duplicateEmail._id, token: token}  });
                
            
        
     

    } catch(err){
        res.status(500).send({status:false, msg: err.msg})
    }
    
}

const getUser= async function(req, res) {

    try{
        const fromParams= req.params.userId
        const usetoken=req.fromParams
        

     

        if(!Validation.isValidObjectId(fromParams)) {
            return res.status(400).send({ status: false, msg:"Please provide valid id." })
        }

       const userExist= await userModel.findOne({_id:fromParams}) 

        if(!userExist) {
            return res.status(404).send({ status: false, msg:"user not found" })
        }

        return res.status(200).send({status: true, message:"User profile details", data: userExist})
          

            
    

    }catch(err) {

        res.status(500).send({status:false, msg: err.msg  });
    }

}


const updateUser= async function (req, res)
{
    try{

        let data= req.body
        const userIdFromParams= req.params.userId
        const userIdFromToken= req.userId;
        
        const{fname, lname, email, phone, password, address}= data

        const updatedData= {}

        if (!Validation.isValidObjectId(userIdFromParams)) {
            return res.status(404).send({ status: false, msg:"userId is not valid" })
        }

        const userByuserId= await userModel.findById(userIdFromParams)

        if (!userByuserId) return res.status(404).send({ status: false, message: 'user not found..!!' });

      //  if (userIdFromToken != userIdFromParams) return res.status(403).send({status: false,message: "Unauthorized access..!!"});

        if (!Validation.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide some data" })
        }


        if (fname) 
        {
            if (!Validation.isValid(fname))  return res.status(400).send({ status: false, Message: "First name is required..!!" });
            updatedData.fname = fname
        }
      
        //===================================lname validation==========================================
      
        if (lname) {
            if (!Validation.isValid(lname)) return res.status(400).send({ status: false, Message: "Last name is required..!!" });
            updatedData.lname = lname
        }
      
        //================================email validation==============================================
      
        if (email)
         {
            if (!(Validation.isEmailValid(email.trim()))) return res.status(400).send({ status: false, msg: "Please provide a valid email..!!" });
            const isEmailUsed = await userModel.findOne({ email: email });
            if (isEmailUsed) return res.status(400).send({ status: false, msg: "email must be unique..!!" });
            updatedData.email = email;
        }
      
        //=======================profile pic upload and validation==========================
      
        let saltRounds = 10;
        const files = req.files;
      
        if (files && files.length > 0) 
        {
            const profilePic = await aws.uploadFile(files[0]);
            updatedData.profileImage = profilePic;
        }
      
        //===============================phone validation-========================================
      
        if (phone)
        {
      
            if (!(Validation.isPhoneValid(phone))) return res.status(400).send({ status: false, msg: "please provide a valid phone number..!!" });
      
            const isPhoneUsed = await userModel.findOne({ phone: phone });
            if (isPhoneUsed) return res.status(400).send({ status: false, msg: "phone number must be unique..!!" });
            updatedData.phone = phone;
        }
      
        //======================================password validation-====================================
      
        if (password) 
        {
            if (!Validation.isValid(password))  return res.status(400).send({ status: false, message: "password is required..!!" });
            const encryptPassword = await bcrypt.hash(password, saltRounds);
            updatedData.password = encryptPassword;
        }
      
        //========================================address validation=================================
      
        if (address)
        {
      
            if (address.shipping)
            {
      
                if (!Validation.isValid(address.shipping.street)) return res.status(400).send({ status: false, Message: "street name is required..!!" }); 
                updatedData["address.shipping.street"] = address.shipping.street;
      
                if (!Validation.isValid(address.shipping.city)) return res.status(400).send({ status: false, Message: "city name is required..!!" });
      
                updatedData["address.shipping.city"] = address.shipping.city;
      
                if (!Validation.isValid(address.shipping.pincode)) return res.status(400).send({ status: false, Message: "pincode is required..!!" });
                
                updatedData["address.shipping.pincode"] = address.shipping.pincode;
            }
      
            if (address.billing)
             {
                if (!Validation.isValid(address.billing.street)) return res.status(400).send({ status: false, Message: "Please provide street name in billing address..!!" });
                
                updatedData["address.billing.street"] = address.billing.street;
      
                if (!Validation.isValid(address.billing.city)) return res.status(400).send({ status: false, Message: "Please provide city name in billing address..!!" });
                
                updatedData["address.billing.city"] = address.billing.city
      
                if (!Validation.isValid(address.billing.pincode)) return res.status(400).send({ status: false, Message: "Please provide pincode in billing address..!!;" })
                
                updatedData["address.billing.pincode"] = address.billing.pincode;
            }
        }
      
        //=========================================update data=============================
      
        const updatedUser = await userModel.findOneAndUpdate({ _id: userIdFromToken }, updatedData, { new: true });
      
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser });
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({staus: false, message: err.message});
    }

}








module.exports.createUser= createUser;
module.exports.login= login;
module.exports.getUser= getUser;
module.exports. updateUser=  updateUser;

