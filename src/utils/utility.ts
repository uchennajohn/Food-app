import Joi, { expression } from 'joi';
import bcrypt from 'bcrypt';
import { AuthPayload } from '../interface';
import JWT from 'jsonwebtoken'
import { APP_SECRET } from '../config';


export const registerSchema = Joi.object().keys({
    email: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
    //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    confirm_password: Joi.any().equal(Joi.ref('password')).required().label('confirm password')
    .messages({'any.only':'{{#label}} does not match'})
   
})

export const option ={
    abortEarly: false,
    errors:{
        wrap:{
            label: " "
        }
    }
}

//schema for admin
export const adminSchema = Joi.object().keys({
    email: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
    //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    
   
})


//generating Salt to hash our password
export const GenerateSalt =async()=>{
    return await bcrypt.genSalt()
}
//hashing our password
export const generatePassword = async(password:string, salt:string)=> {
    return await bcrypt.hash(password,salt)
}

//genearating JWT
export const GenerateSignature = async(payload:AuthPayload)=>{
// JWT.sign takes two argument the payload and secret keys, the payload is 
return JWT.sign(payload,APP_SECRET,
    {expiresIn:'1d'})
}

export const verifySignature = async (signature:string)=>{
    return JWT.verify(signature, APP_SECRET)
}


export const loginSchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
    //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    
})
//compare and rehasing user password if preswnt in DB
export const validatePassword = async (enterPassword:string,savedPassword:string, salt:string)=>{

 return await generatePassword(enterPassword, salt) === savedPassword
}


export const updateSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),

   
})


// export const vendorSchema =  async() =>{
    
// }


export const vendorSchema = Joi.object().keys({
    email: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
    //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    name: Joi.string().required(),
    restaurantName: Joi.string().required(),
    address: Joi.string().required(),
    pincode: Joi.string().required(),
    
   
})



export const updateVendorSchema = Joi.object().keys({

    name: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    coverImage: Joi.string()
    
   
})