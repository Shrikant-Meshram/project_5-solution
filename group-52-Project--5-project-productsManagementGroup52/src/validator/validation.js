const mongoose = require('mongoose')

const isValid = function (value) {     
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false; 
    return true;
};

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};


const isValidString = function (value) {
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidTitle = function (title) {
    return ["S", "XS","M","X", "L","XXL", "XL"].indexOf(title) !== -1;
  };

  const isValidStatus = function(status) {
    return ['pending', 'completed', 'cancelled'].indexOf(status) !== -1
}






module.exports= {isValid, isValidRequestBody, isValidObjectId, isValidString, isValidTitle,isValidStatus}