const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const mongoose = require("mongoose");

router.post("/add", async (req, res) => {
    try {
        const { title, amount, date, notes, category, wallet } = req.body;
        const userId = req.headers["user-id"]; // Read logged-in user ID

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // Validate that userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user session. Please log out and sign in again." });
        }

        let finalCategory = category || "shopping";
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes("swiggy") || lowerTitle.includes("zomato") || lowerTitle.includes("food")) finalCategory = "food";
        if (lowerTitle.includes("uber") || lowerTitle.includes("ola") || lowerTitle.includes("travel")) finalCategory = "travel";

        const newExpense = new Expense({
            user: userId,
            title,
            amount: parseFloat(amount),
            category: finalCategory,
            date,
            wallet: wallet || "Cash",
            notes
        });
        await newExpense.save();
        res.status(201).json({ message: "Expense Added", expense: newExpense });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET ALL EXPENSES (Scoped to User)
router.get("/", async (req, res) => {
    try {
        const userId = req.headers["user-id"];
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // Validate that userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user session. Please log out and sign in again." });
        }

        const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. DELETE EXPENSE
router.delete("/delete/:id", async (req, res) => {
    try {
        const expenseId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return res.status(400).json({ message: "Invalid expense ID." });
        }

        await Expense.findByIdAndDelete(expenseId);
        res.status(200).json({ message: "Expense deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;