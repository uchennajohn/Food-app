import { DataTypes, Model } from "sequelize";
import { db } from "../config";
import { FoodInstance } from "./foodModel";

export interface vendorAttribute{
    
    id: string;
    name:string;
    restaurantName:string;
    pincode: string
    email: string;
    password: string;
    salt: string;
    address: string;
    serviceAvailable:boolean;
    phone: string;
    rating: number;
    role: string;
    coverImage: string;
    
}
//export the instance to use in checking if user exist
export class VendorInstance extends 
Model<vendorAttribute>{}


VendorInstance.init({
    id: {
        type:DataTypes.UUIDV4,
        primaryKey:true,
        allowNull: false
    },
    email: {
        type:DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            notNull:{msg: "Email ddress is required"},
            isEmail:{msg: "please provide a valid email"}
        }
       },
    password:{
        type:DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {msg: "passoword is required"},
            notEmpty:{ msg: 'provide a password'}
        }
    },
    restaurantName:{
        type:DataTypes.STRING,
        allowNull: true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull: true,
    },
    pincode:{
        type:DataTypes.STRING,
        allowNull: true,
    },
    salt: {
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notNull:{msg:"salt is required"},
            notEmpty: {msg: "provide a salt"}
        }
    },
    address:{
        type:DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type:DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull:{msg: "phone number is required"},
            notEmpty:{msg: "provide a phone number"}
        }
    },
   
    rating: {
        type:DataTypes.NUMBER,
        allowNull:true,
    },
    
    serviceAvailable:{
        type:DataTypes.BOOLEAN,
        allowNull: true,
    },
    role:{
        type:DataTypes.STRING,
        allowNull: true,
    },
    coverImage:{
        type:DataTypes.STRING,
        allowNull: true,
    }
},
{
    sequelize:db,
    tableName:"vendor"
})

//connecttong tables  one to many relations
VendorInstance.hasMany(FoodInstance, {foreignKey:"vendorId", as:"food" })

FoodInstance.belongsTo(VendorInstance,{foreignKey:"vendorId", as:'vendor'} )