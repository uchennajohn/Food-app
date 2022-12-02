import express from "express";
import { SuperAdminRegister,AdminRegister} from "../controller/adminController";
import { authVendor } from "../middleware/authorization";
import { createFood, DeleteFood, updateVendorProfile, vendorLogin, VendorProfile } from "../controller/vendorController";
import { upload } from "../utils/multer";

const router = express.Router();

router.post('/login', vendorLogin);
router.post('/create-food',authVendor,upload.single('image'), createFood);
router.get("/get-profile", authVendor,VendorProfile)
router.delete("/delete-food/:foodId", authVendor, DeleteFood)
router.patch('/update-profile', authVendor,upload.single('coverImage'), updateVendorProfile)



export default router;
