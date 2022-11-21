import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  adminSchema,
  GenerateOTP,
  generatePassword,
  GenerateSalt,
  GenerateSignature,
  option,
  vendorSchema,
} from "../utils";

import { UserAttribute, UserInstance } from "../model/userModel";

import { v4 as uuidv4 } from "uuid";
import { FromAdminMail, superAdmin1, userSubject } from "../config";
import { vendorAttribute, VendorInstance } from "../model/vendorModel";
import { ExternalCampaignList } from "twilio/lib/rest/messaging/v1/externalCampaign";

/**==============SUPER ADMIN REGISTRATION=============== */

export const SuperAdminRegister = async (req: JwtPayload, res: Response) => {
  try {
    // const id = req.user.id
    const { email, phone, password, firstName, lastName, address } = req.body;

    //to create user Id from uuid
    const uuiduser = uuidv4();

    const validateResult = adminSchema.validate(req.body, option);

    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    //generate salt
    const salt = await GenerateSalt();
    //encrypt password
    const userPassword = await generatePassword(password, salt);

    //Generte OTP
    const { otp, expiry } = GenerateOTP();

    //check if the admin exist
    const Admin = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttribute;

    //create admin if not existing
       


    if (!Admin) {
      //.role  === "superadmin")
      //to create admin u must add all the model properties
      await UserInstance.create({
        id: uuiduser, // user id created from uuidv4
        email,
        password: userPassword, //we set the password to user password that has been hashed
        firstName,
        lastName,
        salt,
        address,
        phone,
        otp,
        otp_expiry: expiry,
        lng: 0,
        lat: 0,
        verified: true,
        role: "superadmin", //admin
      });

      //send OTP to USer phone number
      //await onRequestOTP(otp, phone)

      //check if admin Exist, if yes, he is given a signature(token)
      const Admin = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAttribute; //attributes comes from the User attribute

      //generate signature
      const signature = await GenerateSignature({
        id: Admin.id,
        email: Admin.email,
        verified: Admin.verified,
      });

      //   console.log(signature)

      // return statement on creation of user
      return res.status(201).json({
        message: " Super Admin Created Successfull",
        signature,
        verified: Admin.verified,
      });
    }

    // return statement if user exist
    return res.status(400).json({
      message: " Super Admin already exist",
    });
  } catch (error) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/admins/signup",
    });
  }
};

/**=============ADMIN REGISTER ===================== */

export const AdminRegister = async (req: JwtPayload, res: Response) => {
  try {
    // const id = req.user.id
    const { email, phone, password, firstName, lastName, address } = req.body;

    //to create user Id from uuid
    const uuiduser = uuidv4();

    const validateResult = adminSchema.validate(req.body, option);

    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    //generate salt
    const salt = await GenerateSalt();
    //encrypt password
    const userPassword = await generatePassword(password, salt);

    //Generte OTP
    const { otp, expiry } = GenerateOTP();

    //check if the admin exist
    const Admin = (await UserInstance.findOne({
      where: {email: email},
    })) as unknown as UserAttribute;

    

    //create admin if not existing
    if(!Admin) {
        const superadmin = await UserInstance.findOne({
            where:{email:superAdmin1}
        }) as unknown as UserAttribute

        if (superadmin.role==="superadmin") {
      //.role  === "superadmin")
      //to create admin u must add all the model properties
      await UserInstance.create({
        id: uuiduser, // user id created from uuidv4
        email,
        password: userPassword, //we set the password to user password that has been hashed
        firstName,
        lastName,
        salt,
        address,
        phone,
        otp,
        otp_expiry: expiry,
        lng: 0,
        lat: 0,
        verified: true,
        role: "admin", //admin
      });

      //send OTP to USer phone number
      //await onRequestOTP(otp, phone)

      //check if admin Exist, if yes, he is given a signature(token)
      const Admin = (await UserInstance.findOne({
        where: { email: email},
      })) as unknown as UserAttribute; //attributes comes from the User attribute

      //generate signature
      const signature = await GenerateSignature({
        id: Admin.id,
        email: Admin.email,
        verified: Admin.verified,

      });

      //   console.log(signature)

      // return statement on creation of user
      return res.status(201).json({
        message: "Admin created Successfull",
        signature,
        verified: Admin.verified,
        
      });
    }
}

    // return statement if user exist
    return res.status(400).json({
      message: "Admin already exist",
    });
  } catch (error) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/admins/signup",
    });
  }
};


/**=========Create Vendor======== */

export const createVendor =async(req: JwtPayload, res: Response)=>{
try {
    const id = req.user.id
const { name,
        ownerName,
        pincode,
        email,
        password,
        address,
        phone} = req.body;

        const validateResult= vendorSchema.validate(req.body, option)

    if (validateResult.error) {
        return res.status(400).json({
         Error: validateResult.error.details[0].message,
        });
      }

          //to create user Id from uuid
    const uuidvendor = uuidv4();


      //generate salt
    const salt = await GenerateSalt();
    const vendorPassword = await generatePassword(password,salt)
    
    const Admin= (await UserInstance.findOne({
        where: { id:id},
      })) as unknown as UserAttribute; 

      const Vendor= (await VendorInstance.findOne({
        where: { id:id},
      })) as unknown as vendorAttribute; 

      if(Admin.role ==="admin" || Admin.role ==="superadmin") {
    
       if(!Vendor) {
         const createVendor = await VendorInstance.create({
          id: uuidvendor,
          email,
          password: vendorPassword,
          ownerName,
          pincode,
          name,
          salt,
          address,
          phone,
          serviceAvailable: false,
          rating: 0,
          role: "vendor"
      })

     return res.status(201).json({
                message: "VEndo created successfully",
                createVendor,
            });
        }
     return res.status(400).json({
            message:"Vendor already Exist"
        })


    }
        
    res.status(500).json({
        Message:"authorized"
    })
}catch (error) {
    res.status(500).json({
        Error: 'internal Server Error',
        route: "/admins/create-vendor"

    })
}}
