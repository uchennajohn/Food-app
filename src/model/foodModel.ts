import { DataTypes, Model } from "sequelize";
import { db } from "../config";

export interface FoodAttribute{
    
    id: string;
    name :string;
    description:string;
    category: string
    price: number;
    foodType:string;
    readyTime: number;
    image: string;
    rating: number;
    vendorId:string
    

    
}
//export the instance to use in checking if user exist
export class FoodInstance extends 
Model<FoodAttribute>{}


FoodInstance.init({
    id: {
        type:DataTypes.UUIDV4,
        primaryKey:true,
        allowNull: false
    },
    name: {
        type:DataTypes.STRING,
        allowNull: false,
       },
    description:{
        type:DataTypes.STRING,
        allowNull: false,
       
    },
    price:{
        type:DataTypes.NUMBER,
        allowNull: true,
    },
   
    category:{
        type:DataTypes.STRING,
        allowNull: true
    },
    foodType: {
        type:DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type:DataTypes.STRING,
        allowNull: false,
    },
   
    readyTime: {
        type:DataTypes.NUMBER,
        allowNull:true,
    },
    rating: {
        type:DataTypes.NUMBER,
        allowNull: true,
    },
    vendorId: {
        type:DataTypes.UUIDV4,
        allowNull: true,
    }
    
   
},
{
    sequelize:db,
    tableName:"food"
})