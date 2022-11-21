import express from "express";
import { SuperAdminRegister,AdminRegister, createVendor} from "../controller/adminController";
import { auth } from "../middleware/authorization";

const router = express.Router();

router.post("/create-super-admin", SuperAdminRegister);
router.post("/create-admin", auth, AdminRegister);
router.post('/create-vendor',auth, createVendor)

export default router;
