const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Added field
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    monthlyIncome: { type: Number, required: true, default: 150000 }
});

module.exports = mongoose.model("User", UserSchema);