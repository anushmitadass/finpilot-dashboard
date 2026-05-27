const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const Expense = require("../models/Expense");

// Standard Dashboard Tip
router.get("/insights", async (req, res) => {
    try {
        const userId = req.headers["user-id"];
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const expenses = await Expense.find({ user: userId });

        if (expenses.length === 0) {
            return res.status(200).json({ insights: "No transactions logged yet." });
        }
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) return res.status(200).json({ insights: "AI Key missing." });

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const dataSummary = expenses.map(e => `₹${e.amount} spent on ${e.title} (${e.category})`).join(", ");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide a short 1-sentence tip for these expenses: ${dataSummary}`,
        });
        res.status(200).json({ insights: response.text });
    } catch (error) {
        res.status(200).json({ insights: "AI insights pipeline temporarily offline." });
    }
});

// DEEP STRATEGIC AUDIT ENDPOINT
router.post("/analyze-spending", async (req, res) => {
    try {
        const userId = req.headers["user-id"];
        if (!userId) return res.status(401).json({ message: "Missing authorization token mapping." });

        const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
        if (expenses.length === 0) {
            return res.status(400).json({ message: "Please log at least one expense entry before running an AI financial audit." });
        }

        const apiKey = process.env.GEMINI_API_KEY || "";
        const ai = new GoogleGenAI({ apiKey: apiKey });

        const financialLogText = expenses.map(e => `Amount: ₹${e.amount}, Description: ${e.title}, Category: ${e.category}, Date: ${e.date}`).join("\n");

        const structuralPrompt = `
        You are a senior forensic financial analyst. Perform a deep budget audit on this raw spending log:
        ${financialLogText}

        Format your reply strictly as a clean JSON object containing exactly these keys. Do not include markdown blocks or raw text outside the JSON boundaries:
        {
          "wastedMoney": "Detailed observations on unnecessary leaks, food delivery surges, or overspending items here",
          "savingSuggestions": "Step-by-step actionable recommendations to optimize capital reserves",
          "unusualExpenses": "Flag anomalies, sudden spikes, or items that stand out dramatically from normal baseline rules",
          "monthlyHabits": "An evaluation of routine behavior patterns based on dates and classifications"
        }`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: structuralPrompt,
        });

        // Clean out common formatting wrappers if returned by accident
        let rawText = response.text.trim();
        if (rawText.startsWith("```json")) rawText = rawText.substring(7);
        if (rawText.endsWith("```")) rawText = rawText.substring(0, rawText.length - 3);

        const structuredAudit = JSON.parse(rawText.trim());
        res.status(200).json(structuredAudit);
    } catch (error) {
        res.status(500).json({ message: "Deep analysis thread failed to process.", error: error.message });
    }
});

module.exports = router;