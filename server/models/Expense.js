const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Links expense to a user
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    wallet: { type: String, default: "Cash" },
    notes: { type: String }
});

module.exports = mongoose.model("Expense", ExpenseSchema);