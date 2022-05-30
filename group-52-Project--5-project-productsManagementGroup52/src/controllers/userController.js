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

    
     
        const { fname, lname, email, phone, password, address } = data

        if (!Validation.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide some data" })
        }

        if(!files || files.length == 0){
            return res.status(400).send({status:false,msg:"file is required"})
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




const updateUserDetails = async function (req, res) {

    try {

        let files = req.files
        let userDetails = req.body
        let userId = req.params.userId
        let userIdFromToken = req.userId

        if (!Validation.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid UserId" })
        }

        const findUserData = await userModel.findById(userId)

        if (!findUserData) {
            return res.status(400).send({ status: false, message: "user not found" })
        }

        if (!Validation.isValidRequestBody(userDetails)) {
            return res.status(400).send({ status: false, message: "Please provide user's details to update." })
        }

        // if (findUserData._id != userIdFromToken) {
        //     return res.status(401).send({ status: false, message: "You Are Not Authorized!!" })
        // }

        let { fname, lname, email, phone, password, address, profileImage } =userDetails

        if (!Validation.isValidString(fname)) {
        return res.status(400).send({ status: false, message: 'first name is Required' })
        }

      
        if (!Validation.isValidString(lname)) {
            return res.status(400).send({ status: false, message: 'last name is Required' })
        }
       
       
        if (!Validation.isValidString(email)) {
            return res.status(400).send({ status: false, message: 'email is Required' })
        }
        if (email) {
            
            if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(userDetails.email))
            return res.status(400).send({ status: false, message: "Invalid Email id." })
        
            const checkEmailFromDb = await userModel.findOne({ email :userDetails.email})
        
            if (checkEmailFromDb) 
            return res.status(400).send({ status: false, message: `emailId is Exists. Please try another email Id.` })
        }

    
        if (!Validation.isValidString(phone)) {
            return res.status(400).send({ status: false, message: 'phone number is Required' })
        }

        if (phone) {
            if (!(/^(\+\d{1,3}[- ]?)?\d{10}$/).test(userDetails.phone))
        return res.status(400).send({ status: false, message: "Phone number must be a valid Indian number." })

        const checkPhoneFromDb = await userModel.findOne({ phone:userDetails.phone })

        if (checkPhoneFromDb) {
        return res.status(400).send({ status: false, message: `${userDetails.phone} is already in use, Please try a new phone number.` })
    }
        }

        
        if (!Validation.isValidString(password)) {
            return res.status(400).send({ status: false, message: 'password is Required' })
        }
        
        if (password) {
           
            if (!(password.length >= 8 && password.length <= 15)) {
                return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
            }
            var hashedPassword = await bcrypt.hash(password, 10)
            userDetails.password=hashedPassword
        }

        if (!Validation.isValidString(address)) {
            return res.status(400).send({ status: false, message: 'Address is Required' })
        }
        
        if (address) {
            
            let userAddress=JSON.parse(userDetails.address)
            userDetails.address=userAddress
    
        if(userAddress.shipping){
            if(userAddress.shipping.street){
            if (!validator.isValid(userAddress.shipping.street)) {
                return res.status(400).send({ status: false, message: "Please provide address shipping street" });
            }
            userDetails.address.shipping.street = userAddress.shipping.street
        }
            if(userAddress.shipping.city){
            if (!validator.isValid(userAddress.shipping.city)) {
                return res.status(400).send({ status: false, message: "Please provide address shipping city" });
            }
            userDetails.address.shipping.city = userAddress.shipping.city
        }
            if(userAddress.shipping.pincode){
            if (!validator.isValid(userAddress.shipping.pincode)) {
                return res.status(400).send({ status: false, message: "Please provide address shipping pincode" });
            }
            userDetails.address.shipping.pincode =userAddress.shipping.pincode
        }
        }

        if(userAddress.billing){
            if(userAddress.billing.street){
            if (!validator.isValid(userAddress.billing.street)) {
                return res.status(400).send({ status: false, message: "Please provide address billing street" });
            }
            userDetails.address.billing.street = userAddress.billing.street
        }
            if(userAddress.billing.city){
            if (!validator.isValid(userAddress.billing.city)) {
                return res.status(400).send({ status: false, message: "Please provide address billing city" });
            }
            userDetails.address.billing.city = userAddress.billing.city
        }
            if(userAddress.billing.pincode){
            if (!validator.isValid(userAddress.billing.pincode)) {
                return res.status(400).send({ status: false, message: "Please provide address billing pincode" });
            }
            userDetails.address.billing.pincode =userAddress.billing.pincode
        }
        }}
       
       if(profileImage){
        if (files) {
            
                if (!(files && files.length > 0)) 
                return res.status(400).send({ status: false, message: "please provide profile image" })
                
                let userImage = await aws_s3.uploadFile(files[0])
                userDetails.profileImage=userImage
            }
        }

        console.log(userDetails)

        let updateProfileDetails = await userModel.findOneAndUpdate(
            { _id: userId },
             {$set: userDetails}, 
             { new: true })

        return res.status(200).send({ status: true, msg:"User Update Successful!!",data: updateProfileDetails })
   



    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message })
    }
}







module.exports.createUser= createUser;
module.exports.login= login;
module.exports.getUser= getUser;
module.exports. updateUserDetails=  updateUserDetails;



