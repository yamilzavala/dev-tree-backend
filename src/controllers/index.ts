import User from "../models/User"
import type { Request, Response } from "express"
import { checkPassword, hashPassword } from "../utils/auth";
import slug from 'slug'
import { decodeJWT, generateJWT } from "../utils/jwt";

export const createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const emailExists = await User.findOne({email})

    if(emailExists) {
       const error = new Error('The email is already registered') 
       return res.status(409).json({msg: error.message})
    }

    const handle = slug(req.body.handle, '')
    const handleExists = await User.findOne({handle})
    if(handleExists) {
       const error = new Error('The handle is already registered ') 
       return res.status(409).json({msg: error.message})
    }

    try {
        const user = new User(req.body)
        user.handle = handle;
        user.password = await hashPassword(password)
        await user.save()
        return res.status(201).json({msg: 'User registered'})
    } catch (error) {
        return res.status(500).json({msg: `Something went wrong: ${error.message}`})
    }
}

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})

    if(!user) {
        const error = new Error('User not found')
        return res.status(404).json({msg: error.message})    
    }

    const isPasswordCorrect = await checkPassword(password, user.password)
    if(!isPasswordCorrect) {
        const error = new Error('Invalid password')
        return res.status(401).json({msg: error.message})   
    }

    const token = generateJWT({id: user.id})

    try {
        return res.status(200).json({msg: 'Logged in User', token})
    } catch (error) {
        return res.status(500).json({msg: `Something went wrong: ${error.message}`})
    }
}

export const getUser = async (req: Request, res: Response) => {
   return res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const {description} = req.body;

        const handle = slug(req.body.handle, '')
        const handleExists = await User.findOne({handle})
        if(handleExists && handleExists.email !== req.user.email) {
            const error = new Error('The handle is already registered ') 
            return res.status(409).json({msg: error.message})
        }

        // user update
        req.user.description = description;
        req.user.handle = handle;
        await req.user.save()
        res.status(200).json({msg: 'User updasted successfully'})
    } catch (e) {
        const error = new Error('Something went wrong')
        return res.status(500).json({msg: `Something went wrong: ${error.message}`})
    }
}