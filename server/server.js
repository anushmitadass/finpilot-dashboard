const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Force dotenv to load the file explicitly from this directory
require("dotenv").config({ path: path.join(__dirname, ".env") });

const expenseRoutes = require("./routes/expenseRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/expenses", expenseRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);

// Hardcoded fallback safety check to rule out any remaining .env file reading issues
const dbUri = process.env.MONGO_URI || "mongodb://finpilotadmin:justinfoley2020@ac-qe2lnav-shard-00-00.1g8aktw.mongodb.net:27017,ac-qe2lnav-shard-00-01.1g8aktw.mongodb.net:27017,ac-qe2lnav-shard-00-02.1g8aktw.mongodb.net:27017/finpilot?ssl=true&replicaSet=atlas-xscsqf-shard-0&authSource=admin&appName=finpilot-cluster";

mongoose.connect(dbUri)
    .then(() => console.log("MongoDB Connected Successfully!"))
    .catch(err => console.error("Database connection error:", err));

app.get("/", (req, res) => {
    res.send("FinPilot Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});