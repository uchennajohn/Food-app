import express, { Request, Response } from "express";
import { UserAttribute, UserInstance } from "../model/userModel";
import bcrypt from "bcrypt";
import {
  registerSchema,
  option,
  generatePassword,
  GenerateSalt,
  GenerateOTP,
  // onRequestOTP,
  emailHtml,
  mailSent,
  GenerateSignature,
  verifySignature,
  loginSchema,
  validatePassword,
  updateSchema,
} from "../utils";
import { v4 as uuidv4 } from "uuid";
import { FromAdminMail, userSubject } from "../config";
import { JwtPayload, verify } from "jsonwebtoken";
import { where } from "sequelize";

/**=====================Register USer ============================ */
export const Register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, confirm_password } = req.body;

    //to create user Id from uuid
    const uuiduser = uuidv4();

    const validateResult = registerSchema.validate(req.body, option);

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

    //check if the user exist
    const User = await UserInstance.findOne({
      where: { email: email },
    });

    //create user if not existing

    if (!User) {
      //to create user u must add all the model properties
      let user = await UserInstance.create({
        id: uuiduser, // user id created from uuidv4
        email,
        password: userPassword, //we set the password to user password that has been hashed
        firstName: "",
        lastName: "",
        salt,
        address: "",
        phone,
        otp,
        otp_expiry: expiry,
        lng: 0,
        lat: 0,
        verified: false,
        role: "user",
      });

      //send OTP to USer phone number
      //await onRequestOTP(otp, phone)

      //Send OTP to Email
      const html = emailHtml(otp);

      await mailSent(FromAdminMail, email, userSubject, html); //from utils and config ARRANGEMENT IS VERY IMPORTANT, follow from mailsent in notifcation

      //check if user Exist, if yes, he is given a signature(token)
      const User = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAttribute; //attributes comes from the User attribute

      //generate signature
      const signature = await GenerateSignature({
        id: User.id,
        email: User.email,
        verified: User.verified,
      });

      //   console.log(signature)

      // return statement on creation of user
      return res.status(201).json({
        message:
          "User created Successfull check your email or phone for OTP verification",
        signature,
        verified: User.verified,
      });
    }

    // return statement if user exist
    return res.status(400).json({
      message: "User already exist",
    });
  } catch (error) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/users/signup",
    });
  }
};
/** ===============Verify User=============*/

export const verifyUSer = async (req:Request, res:Response) => {
  try {
    //users/verify/id`
    const token = req.params.signature; // const {id} = req.params
    const decode = (await verifySignature(token)) as JwtPayload;
    //check if the user is a registered user
    const User = (await UserInstance.findOne({
      //decode object has a email property
      where: { email: decode.email },
    })) as unknown as UserAttribute;

    if (User) {
      const { otp } = req.body; //comparing the otp the user is inputing is same with otp in the database n the time difference btwn otp_expiry and current time

      if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
        const updateUser = (await UserInstance.update(
          {
            verified: true,
          },
          { where: { email: decode.email } }
        )) as unknown as UserAttribute;

        //generate a new signature
        let signature = await GenerateSignature({
          id: updateUser.id,
          email: updateUser.email,
          verified: updateUser.verified,
        });

        if (updateUser) {
          const User = (await UserInstance.findOne({
            where: { email: decode.email },
          })) as unknown as UserAttribute;

          return res.status(200).json({
            message: "You have succesfully verified your account",
            signature,
            verified: User.verified,
          });
        }
      }
    }
    return res.status(400).json({
      Error: "Invalid Credentials or OTP already expired",
    });
  } catch (err) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/users/verify",
    });
  }
};

/**=========================LOGIN USER ============================================ */

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validateResult = loginSchema.validate(req.body, option);

    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    //check if the User exist
    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttribute;

    if (User && User.verified === true) {
      let validation = await validatePassword(
        password,
        User.password,
        User.salt
      );
      //let validation = await bcrypt.compare(password, User.password)
      //on confirming password
      if (validation) {
        //generate signature
        const signature = await GenerateSignature({
          id: User.id,
          email: User.email,
          verified: User.verified,
        });

        return res.status(200).json({
          message: "You have successfully logged in",
          signature,
          email: User.email,
          verified: User.verified, //only the message prop is shown to the user
          role: User.role,
        });
      }
    }
    return res.status(400).json({
      Error: "Wrong Email or Password or not a verified user",
    });
  } catch (err) {
    res.status(500).json({
      Error: "Inernal Server Error",
      route: "users/login",
    });
  }
};
/**=========================== Resend OTP ============================== **/

//since the user isnt yet logged in, the signature stored in the

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = (await verifySignature(token)) as JwtPayload;
    //check if user exist
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAttribute;

    if (User) {
      //Generate OTP
      const { otp, expiry } = GenerateOTP();
      const updatedUser = (await UserInstance.update(
        {
          otp,
          otp_expiry: expiry,
        },
        { where: { email: decode.email } }
      )) as unknown as UserAttribute;
      if (updatedUser) {
        //Send Otp to user
        //await onRequestOTP(otp,User.phone);
        //Send Email to User
        const html = emailHtml(otp);
        await mailSent(FromAdminMail, User.email, userSubject, html);
        return res.status(200).json({
          message: "OTP resend to registered phone number and email",
        });
      }
    }
    return res.status(400).json({
      Error: "Error sending OTP",
    });
  } catch (err) {
    res.status(500).json({
      Error: "Internal server Error",
      route: "/users/resend-otp/:signature",
    });
  }
};

/**========================PROFILE================== */
/**==== GET ALL USERS===== */
export const getAllUsers = async (req: Request, res: Response) => {
  //sequelise uses findAll and  findAndCountALL to get Users/products

  //req.query
  try {
    const limit = req.query.limit as number | undefined;
    //const users = await UserInstance.findAll({})
    const users = await UserInstance.findAndCountAll({
      limit: limit, //limit as a key is from sequelize
    });
    res.status(200).json({
      // message: "u have successfully retrieve all Users",
      //users
      Count: users.count,
      Users: users.rows,
    });
  } catch (err) {
    return res.status(500).json({
      Error: "Internal server Error",
      route: "/users/get-all-users",
    });
  }
};

/**=====Get a User by ID =========*/
//this is used for targetting a single user with all its properties ...it coes as an object for that single user
//middleware will be used to protect routes
export const getSingleUser = async (req: Request | any, res: Response) => {
  try {
    const { id } = req.user;
    //find user by iD
    console.log(id);

    const User = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttribute;

    if (User) {
      return res.status(200).json({
        User,
      });
    }

    return res.status(400).json({
      message: "user not found",
    });
  } catch (error) {
    return res.status(500).json({
      Error: "Internal server Error",
      route: "/users/get-user",
    });
  }
};

export const updateUserProfile = async (
  req: JwtPayload | any,
  res: Response
) => {
  try {
    const id = req.user.id;
    const { firstName, lastName, address, phone } = req.body;

    const validateResult = updateSchema.validate(req.body, option);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    //check if its a reg user
    const User = (await UserInstance.findOne({
      where: { id: id },
    })) as unknown as UserAttribute;

    if (!User) {
      return res.status(400).json({
        Error: "you are not authorised to update your profile",
      });
    }

    const updatedUser = (await UserInstance.update(
      {
        firstName,
        lastName,
        address,
        phone,
      },
      { where: { id: id } }
    )) as unknown as UserAttribute;

    if (updatedUser) {
      const User = (await UserInstance.findOne({
        where: { id: id },
      })) as unknown as UserAttribute;

      return res.status(200).json({
        message: "u have succesfully updated your profile",
        User,
      });
    }
    return res.status(500).json({
      message: "Error Occured",
    });
  } catch (error) {
    return res.status(500).json({
      Error: "internal Serer Error",
      route: "/users/update-profile",
    });
  }
};
