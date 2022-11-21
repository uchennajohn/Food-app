import { NextFunction, Request, Response } from "express"
import JWT, { JwtPayload } from "jsonwebtoken"
import { APP_SECRET } from "../config"
import { UserAttribute, UserInstance } from '../model/userModel'
import { vendorAttribute, VendorInstance } from "../model/vendorModel"


export const auth = async (req:JwtPayload, res:Response, next: NextFunction) => {
 // req.headers and req.cookies  
 //req.cookies.jwt 
   
 try {
    const authorization = req.headers.authorization //users signature is saved in the authorization

    if(!authorization) {
       return res.status(401).json({
        Error: 'kindly log in'

       })
    }
    //bearer egygygy
    const token = authorization.slice(7, authorization.length)
        //  pass jWT to check the validity of the signature(token) bt 
        let verified = JWT.verify(token, APP_SECRET)

        if(!verified) {
            return res.status(401).json({
                Error: "unauthorized"
            })
        }
        const {id} = verified as {[key:string]:string}
        const user = await UserInstance.findOne({
            where: {id:id}
        }) as unknown  as UserAttribute

      
                                                                    // middelware structure is the same across databases, except for the method
        if(!user) {
            return res.status(401).json({
                Error:"invalid Credentials"
            })
        }
            req.user = verified
            next()

 } catch (error) {
    return res.status(401).json({
        Error: "unauthorized"
    })
 }
 
 
 
}



export const authVendor = async (req:JwtPayload, res:Response, next: NextFunction) => {
    // req.headers and req.cookies  
    //req.cookies.jwt 
      
    try {
       const authorization = req.headers.authorization //users signature is saved in the authorization
   
       if(!authorization) {
          return res.status(401).json({
           Error: 'kindly log in'
           
          })
       }
       //bearer egygygy
       const token = authorization.slice(7, authorization.length)
           //  pass jWT to check the validity of the signature(token) bt 
           let verified = JWT.verify(token, APP_SECRET)
   
           if(!verified) {
               return res.status(401).json({
                   Error: "unauthorized"
               })
           }
           const {id} = verified as {[key:string]:string}
           const vendor = await VendorInstance.findOne({
               where: {id:id}
           }) as unknown  as vendorAttribute   
         
                                                                       // middelware structure is the same across databases, except for the method
           if(!vendor) {
               return res.status(401).json({
                   Error:"invalid Credentials"
               })
           }
               req.vendor = verified
               next()
   
    } catch (error) {
       return res.status(401).json({
           Error: "unauthorized"
       })
    }
    
    
    
   }