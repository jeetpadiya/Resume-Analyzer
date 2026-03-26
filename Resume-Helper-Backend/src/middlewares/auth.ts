import jwt from 'jsonwebtoken';

export const authMiddleware = (req:any,res:any,next:any)=>{
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if(!token){
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is not defined");
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
}

