import { Sequelize } from "sequelize";
import dotenv from 'dotenv'

dotenv.config()

//configuring sequelize
export const db = new Sequelize('app', '', '',{
    storage: "./food.sqlite",
    dialect: "sqlite",
    logging: false
})

//import at utils/notification
export const accountSid = process.env.AccountSid
export const authToken =  process.env.AuthToken
export const  fromAdminPhone = process.env.fromAdminPhone;

export const GMAIL_USER = process.env.Gmail_user
export const GMAIL_PASS = process.env.Gmail_pass

export const FromAdminMail = process.env.FromAdminMail as string
export const userSubject = process.env.userSubject as string
export const APP_SECRET = process.env.APP_SECRET as string
export const superAdmin1 = process.env.superAdmin as string

//Anything inside the ENV is processed as string...so John take note(or ! ) 
//eg export const APP_SECRET = process.env.APP_SECRET!
