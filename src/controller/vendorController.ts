import express, { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { FoodAttribute, FoodInstance } from "../model/foodModel";
import { vendorAttribute, VendorInstance } from "../model/vendorModel";
import { GenerateSignature, loginSchema, option, updateVendorSchema, validatePassword } from "../utils/utility";
import {v4 as uuidv4} from "uuid"

/**========VENDOR LOGIN==========`*/
export const vendorLogin =async (req: Request, res:Response) =>{

        try {
            const { email, password } = req.body;

    const validateResult = loginSchema.validate(req.body, option);

    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    //check if the User exist
    const Vendor = (await VendorInstance.findOne({
      where: { email: email },
    })) as unknown as vendorAttribute;

    if (Vendor) {
      let validation = await validatePassword(
        password,
        Vendor.password,
        Vendor.salt
      );
     
      if (validation) {
        //generate signature
        const signature = await GenerateSignature({
          id: Vendor.id,
          email: Vendor.email,
         serviceAvailable: Vendor.serviceAvailable
        });

        return res.status(200).json({
          message: "You have successfully logged in",
          signature,
          email: Vendor.email,
          serviceAvailable: Vendor.serviceAvailable, //only the message prop is shown to the user
          role: Vendor.role,
        });
      }
    }
    return res.status(400).json({
      Error: "Wrong Email or Password or not a verified user",
    });





        } catch (error) {
             return res.status(500).json({
                Error: "internal Serer Error",
                route: "/vendor/update-profile",
              });
            }
}


/**=============VENDOR ADD FOOD ================== */
 

export const createFood = async (req:JwtPayload, res: Response) =>{
     try {
            const id =req.vendor.id
           // console.log(id)

            const {name,description,category, price,foodType,readyTime} = req.body

        const Vendor = await VendorInstance.findOne({where:{id:id }}) as unknown as vendorAttribute;
        const foodid = uuidv4()

        if(Vendor) {
            const createFood = await FoodInstance.create({
                id: foodid,
                name,
                description,
                category,
                foodType,
                readyTime,
                price,
                image:req.file.path,
                rating: 0,
                vendorId: id
               
            }) //as unknown as FoodAttribute;

            return res.status(201).json({
                message:"food added successfully",
                createFood
            })

        }



    } catch (err:any) {
       
        return res.status(500).json({
                Error: "internal Server Error",
                route: "/vendors/create-food",
              })
    }


}

/**========Get Vendor Profile====================== */

export const VendorProfile = async (req:JwtPayload, res:Response)=>{

    try {
        const id = req.vendor.id;
//check if vendor exist
        const Vendor = await VendorInstance.findOne({where:{id:id },
           attributes:["email", "name","ownerName", "address","id","phone",],
        include:[
            {
                model: FoodInstance,
                as: "food",
                attributes:["id", 'name', "description", "foodType", "readyTime","category", "price", "rating", "vendorId"]
            }
        ]
        }) as unknown as vendorAttribute;

        return res.status(200).json({
            Vendor
        })

//pagination or limits can be added to the get request to get  d desired properties


    } catch (error) {
        console.log(error)
       
        return res.status(500).json({
                Error: "internal Server Error",
                route: "/vendors/create-profile",
              })
    }
}


/**================Vendor Delete Food================ */

export const DeleteFood = async (req:JwtPayload, res: Response)=>{
    //the right approach is to delete by the id of the food
try {
    //find vendor by ID to be sure
    const id = req.vendor.id 
    const foodId = req.params.foodId
    const Vendor = await VendorInstance.findOne({where:{id:id }}) as unknown as vendorAttribute;
        


    if(Vendor) {

    //const Food = await FoodInstance.findOne({where:{id:foodId }})// as unknown as FoodAttribute;

    const deletedFood = await FoodInstance.destroy({where:{id: foodId}})

    res.status(200).json({
        message: "You have successfully deleted food",
        deletedFood
    })
  }
   
} catch (error) {
    return res.status(500).json({
        Error: "internal Server Error",
        route: "/vendors/delete-food",
      })
}




}


/**=======update Vendor =============== */

export const updateVendorProfile = async (
    req: JwtPayload | any,
    res: Response
  ) => {
    try {
      const id = req.vendor.id;
      const { name, phone, address, coverImage } = req.body;
  
      const validateResult = updateVendorSchema.validate(req.body, option);
      if (validateResult.error) {
        return res.status(400).json({
          Error: validateResult.error.details[0].message,
        });
      }
  
      //check if its a reg user
      const Vendor = (await VendorInstance.findOne({
        where: { id: id },
      })) as unknown as vendorAttribute;
  
      if (!Vendor) {
        return res.status(400).json({
          Error: "you are not authorised to update your profile",
        });
      }
  
      const updatedVendor = (await VendorInstance.update(
        {
          name,
          coverImage:req.file.path,
          address,
          phone,
        },
        { where: { id: id } }
      )) as unknown as vendorAttribute;
  
      if (updatedVendor) {
        const Vendor = (await VendorInstance.findOne({
          where: { id: id },
        })) as unknown as vendorAttribute;
  
        return res.status(200).json({
          message: "u have succesfully updated your profile",
          Vendor,
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
  
