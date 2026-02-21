import User from "../models/User"
import type { Request, Response } from "express"
import { checkPassword, hashPassword } from "../utils/auth";
import slug from 'slug'
import { decodeJWT, generateJWT } from "../utils/jwt";
import formidable from 'formidable'
import cloudinary from "../config/cloudinary";
import { v4 as uuid } from 'uuid'

export const createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const emailExists = await User.findOne({ email })

    if (emailExists) {
        const error = new Error('The email is already registered')
        return res.status(409).json({ msg: error.message })
    }

    const handle = slug(req.body.handle, '')
    const handleExists = await User.findOne({ handle })
    if (handleExists) {
        const error = new Error('The handle is already registered ')
        return res.status(409).json({ msg: error.message })
    }

    try {
        const user = new User(req.body)
        user.handle = handle;
        user.password = await hashPassword(password)
        await user.save()
        return res.status(201).json({ msg: 'User registered' })
    } catch (error) {
        return res.status(500).json({ msg: `Something went wrong: ${error.message}` })
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })

    if (!user) {
        const error = new Error('User not found')
        return res.status(404).json({ msg: error.message })
    }

    const isPasswordCorrect = await checkPassword(password, user.password)
    if (!isPasswordCorrect) {
        const error = new Error('Invalid password')
        return res.status(401).json({ msg: error.message })
    }

    const token = generateJWT({ id: user.id })

    try {
        return res.status(200).json({ msg: 'Logged in User', token })
    } catch (error) {
        return res.status(500).json({ msg: `Something went wrong with login user: ${error.message}` })
    }
}

export const getUser = async (req: Request, res: Response) => {
    return res.json(req.user)
}

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { description } = req.body;

        const handle = slug(req.body.handle, '')
        const handleExists = await User.findOne({ handle })
        if (handleExists && handleExists.email !== req.user.email) {
            const error = new Error('The handle is already registered ')
            return res.status(409).json({ msg: error.message })
        }

        // user update
        req.user.description = description;
        req.user.handle = handle;
        await req.user.save()
        res.status(200).json({ msg: 'User updated successfully' })
    } catch (e) {
        const error = new Error('Something went wrong updating profile')
        return res.status(500).json({ msg: `${error.message}` })
    }
}

export const updateLinks = async (req: Request, res: Response) => {
    try {
        const { links } = req.body;

        // user user links
        req.user.links = links;
        await req.user.save()
        res.status(200).json({ msg: 'User links updated successfully' })
    } catch (e) {
        const error = new Error('Something went wrong saving links')
        return res.status(500).json({ msg: `${error.message}` })
    }
}

export const updateImage = async (req: Request, res: Response) => {
    const form = formidable({ multiples: false })

    try {
        form.parse(req, (error, fields, files) => {
            const file = files?.file[0].filepath;
            cloudinary.uploader
                .upload(file, { public_id: uuid() }, async function (error, result) {
                    if (error) {
                        const error = new Error('There was an error uploading image')
                        return res.status(500).json({ msg: `Something went wrong: ${error.message}` })
                    }

                    if (result) {
                        // user image update
                        req.user.image = result.secure_url;
                        await req.user.save()
                        return res.status(200).json({ msg: 'Image uploaded successfully', image: result.secure_url })
                    }
                })
        })
    } catch (e) {
        const error = new Error('Something went wrong')
        return res.status(500).json({ msg: `${error.message}` })
    }
}

export const getUserByHandle = async (req: Request, res: Response) => {
    try {
        const { handle } = req.params;
        const user = await User.findOne({ handle }).select('-password -_id -__v -email')

        if (!user) {
            const error = new Error('User not found')
            return res.status(404).json({ msg: error.message })
        }
        return res.status(200).json({ user })
    } catch (error) {
        return res.status(500).json({ msg: `Something went wrong: ${error.message}` })
    }
}