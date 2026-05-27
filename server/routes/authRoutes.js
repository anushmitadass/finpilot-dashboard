const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER ROUTE
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, monthlyIncome } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required fields." });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User profile registry already exists." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username: username.trim(),
            email: email.trim(),
            password: hashedPassword,
            monthlyIncome: parseFloat(monthlyIncome) || 150000
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, "FINPILOT_SECRET", { expiresIn: "7d" });
        return res.status(201).json({
            token,
            user: { id: user._id, username: user.username, email: user.email, monthlyIncome: user.monthlyIncome }
        });
    } catch (error) {
        return res.status(500).json({ message: `Database Reject: ${error.message}` });
    }
});

// Update the LOGIN ROUTE response to also return user.username:
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id }, "FINPILOT_SECRET", { expiresIn: "7d" });
        return res.status(200).json({
            token,
            user: { id: user._id, username: user.username, email: user.email, monthlyIncome: user.monthlyIncome }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
// UPDATE USER PROFILE DATA ROUTE
router.put("/update-profile", async (req, res) => {
    try {
        const userId = req.headers["user-id"];
        if (!userId) {
            return res.status(401).json({ message: "Missing authorization headers routing link." });
        }

        const { username, email } = req.body;
        if (!username || !email) {
            return res.status(400).json({ message: "Username and Email cannot be left blank." });
        }

        // Check if email is already taken by a different user profile registration entry
        const emailConflict = await User.findOne({ email: email.trim(), _id: { $ne: userId } });
        if (emailConflict) {
            return res.status(400).json({ message: "This email address registry is already being used by another pilot." });
        }

        // Find and update the document values
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username: username.trim(), email: email.trim() },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User account node not found." });
        }

        return res.status(200).json({
            message: "Database profile values modified successfully!",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                monthlyIncome: updatedUser.monthlyIncome
            }
        });
    } catch (error) {
        return res.status(500).json({ message: `Database Modification Fault: ${error.message}` });
    }
});
module.exports = router;