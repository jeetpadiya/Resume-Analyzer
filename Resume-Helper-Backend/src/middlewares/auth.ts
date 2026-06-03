import jwt from 'jsonwebtoken';

type AuthTokenPayload = {
    id: string;
    email: string;
    iat?: number;
    exp?: number;
};

export const authMiddleware = (req:any,res:any,next:any)=>{
        const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token){
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is not defined");
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY) as AuthTokenPayload;

        if (!decoded.id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        req.user = decoded;
        next();
    }
    catch (error:any) {
        console.error("Error verifying token:", error);

        if (error?.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expired",
                code: "TOKEN_EXPIRED",
            });
        }

        return res.status(401).json({ message: "Invalid token" });
    }
}
