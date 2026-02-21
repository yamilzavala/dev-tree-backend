import {Router} from 'express'
import { createAccount, login, getUser, updateProfile, updateImage, updateLinks, getUserByHandle } from './controllers';
import { body } from 'express-validator';
import { handleInputErrors } from './middleware/validations';
import { authenticate } from './middleware/auth';

const router = Router()

// Authentication and Register
router.post('/auth/register', 
    body('handle').notEmpty().withMessage('Handle field required'),
    body('password').isLength({min: 8}).withMessage('Very short password, minimum 8 characters'),
    body('name').notEmpty().withMessage('Name field required'),
    body('email').isEmail().withMessage('No valid Email'),
    handleInputErrors,
    createAccount)

router.post('/auth/login',
     body('email').isEmail().withMessage('Invalid Email'),
     body('password').notEmpty().withMessage('Password required'),
     handleInputErrors,
     login
)

router.get('/user', authenticate, getUser)

router.patch('/user', 
    body('handle').notEmpty().withMessage('Handle field required'),
    body('description').notEmpty().withMessage('Description field required'),
    handleInputErrors,
    authenticate, 
    updateProfile)

router.patch('/user/links', 
    authenticate, 
    updateLinks)

router.post('/user/image', 
    authenticate, 
    updateImage)

router.get('/:handle', 
    authenticate, 
    getUserByHandle
)


export default router;