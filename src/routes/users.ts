import expresss from 'express';
import { getAllUsers, getSingleUser, Login, Register, resendOTP, updateUserProfile, verifyUSer } from '../controller/usersController';
import { auth } from '../middleware/authorization';


const router = expresss.Router()

router.post('/signup', Register )
router.post('/verify/:signature', verifyUSer )
router.post('/login', Login)
router.get('/resend-otp/:signature', resendOTP)
router.get('/get-all-users', getAllUsers)
router.get('/get-user', auth, getSingleUser)
router.patch('/update-profile', auth, updateUserProfile)
export default router;