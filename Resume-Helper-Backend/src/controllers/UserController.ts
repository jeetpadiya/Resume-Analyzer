import UserSchema from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email/mailer.js';

const signUserToken = (userId: string, email: string) => {
    if (!process.env.SECRET_KEY) {
        throw new Error("SECRET_KEY is not defined");
    }

    return jwt.sign(
        { id: userId, email },
        process.env.SECRET_KEY,
        { expiresIn: '7d' }
    );
};

const registerUser = async (req: any, res: any) => {
    try {


        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        const existingUser = await UserSchema.findOne({ email })

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserSchema({
            username,
            email,
            password: hashedPassword
        })

        const token = signUserToken(String(newUser._id), newUser.email);

        await newUser.save();


        res.status(201).json({ message: "User registered successfully", token,user:{ _id: newUser._id, name: newUser.username, email: newUser.email } });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error" });
    }

}


const loginUser = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });

        }

        const existingUser = await UserSchema.findOne({ email })

        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User Doesn't exist" })
        }

        const isMatch = await bcrypt.compare(password, existingUser.password)

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentails" })
        }

        const token = signUserToken(String(existingUser._id), existingUser.email);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: {
                _id: existingUser._id,
                name: existingUser.username,
                email: existingUser.email,
            }
        })
    }
    catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const forgotPassword = async (req: any, res: any) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await UserSchema.findOne({ email });

        if (!existingUser) {
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, a reset link has been generated."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        existingUser.passwordResetToken = hashedResetToken;
        existingUser.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 15);

        await existingUser.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

        await sendPasswordResetEmail(existingUser.email, resetUrl);

        res.status(200).json({
            success: true,
            message: "Password reset email sent successfully"
        });
    }
    catch (error) {
        console.error("Error generating reset password token:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const resetPassword = async (req: any, res: any) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: "Token and password are required" });
        }

        const hashedResetToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await UserSchema.findOne({
            passwordResetToken: hashedResetToken,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Reset token is invalid or expired" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export { registerUser, loginUser, forgotPassword, resetPassword }
