import express from "express";
import { SuperAdminRegister,AdminRegister} from "../controller/adminController";
import { authVendor } from "../middleware/authorization";
import { createFood, DeleteFood, vendorLogin, VendorProfile } from "../controller/vendorController";

const router = express.Router();

router.post('/login', vendorLogin);
router.post('/create-food',authVendor, createFood);
router.get("/get-profile", authVendor,VendorProfile)
router.delete("/delete-food/:foodId", authVendor, DeleteFood)
export default router;
