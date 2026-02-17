import type { Request, Response, NextFunction } from "express";
import { decodeJWT } from "../utils/jwt";
import User, { IUser } from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
       const bearer = req.headers.authorization;

    if (!bearer) {
        const error = new Error('Unauthorized')
        return res.status(401).json({ msg: error.message })
    }

    const [, token] = bearer.split(' ')

    if (!token) {
        const error = new Error('Unauthorized')
        return res.status(401).json({ msg: error.message })
    }

    try {
        const result = decodeJWT(token)
        if(typeof result === 'object' && result.payload.id) {
            const user = await User.findById(result.payload.id).select('-password')
               if (!user) {
                    const error = new Error('User not found')
                    return res.status(404).json({ msg: error.message })
                }
                req.user = user;
                next()    
        }
    } catch (error) {
        return res.status(500).json({msg: `Not valid Token`})
    }
} 