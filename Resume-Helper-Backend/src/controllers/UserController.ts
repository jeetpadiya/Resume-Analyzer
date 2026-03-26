import UserSchema from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


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

        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is not defined");
        }
        const token = jwt.sign({ _id: newUser._id, email: newUser.email }, process.env.SECRET_KEY, { expiresIn: "1h" })

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

        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is not defined");
        }

        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );

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

export { registerUser, loginUser }
