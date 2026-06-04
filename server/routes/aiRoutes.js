const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const Expense = require("../models/Expense");
const mongoose = require("mongoose");

function generateLocalAnalysis(expenses, monthlyIncome) {
    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const spentPercent = ((totalSpent / monthlyIncome) * 100).toFixed(1);
    const remainingBudget = monthlyIncome - totalSpent;

    const categoryTotals = {};
    expenses.forEach(e => {
        const cat = e.category || "other";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(e.amount);
    });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0] ? sortedCategories[0][0] : "none";
    const topCategoryAmt = sortedCategories[0] ? sortedCategories[0][1] : 0;
    const topCategoryPercent = totalSpent > 0 ? ((topCategoryAmt / totalSpent) * 100).toFixed(1) : 0;

    // Mapping category system values to user-friendly labels
    const categoryLabels = {
        food: "Food & Dining",
        travel: "Travel & Transport",
        shopping: "Shopping",
        groceries: "Groceries",
        utilities: "Bills & Utilities",
        entertainment: "Entertainment",
        medical: "Medical & Healthcare",
        subscriptions: "Digital Subscriptions",
        other: "Other"
    };

    const friendlyTopCat = categoryLabels[topCategory.toLowerCase()] || topCategory;

    const wasteCandidates = expenses.filter(e => 
        ["shopping", "entertainment", "subscriptions"].includes((e.category || "").toLowerCase())
    );
    let wastedMoney = "";
    if (wasteCandidates.length > 0) {
        const highWaste = wasteCandidates.sort((a, b) => b.amount - a.amount).slice(0, 2);
        wastedMoney = `Based on your log, your spending on non-essential categories includes ` +
            highWaste.map(w => `₹${w.amount} for "${w.title}" (${categoryLabels[w.category.toLowerCase()] || w.category})`).join(" and ") + 
            `. Consolidating or pausing these discretionary items could save you up to ₹${wasteCandidates.reduce((s, c) => s + c.amount, 0)} per month.`;
    } else {
        wastedMoney = "Your spending is concentrated on essential categories. No obvious wasteful expenses detected from the current log.";
    }

    let savingSuggestions = "";
    if (spentPercent > 80) {
        savingSuggestions = `You have utilized ${spentPercent}% of your budget (spent ₹${totalSpent.toFixed(0)} of ₹${monthlyIncome.toLocaleString('en-IN')}). We suggest setting a strict spending cap on your highest category, ${friendlyTopCat}, where you spent ₹${topCategoryAmt.toFixed(0)} (${topCategoryPercent}% of total). Try reducing this by 20% next month.`;
    } else if (spentPercent > 50) {
        savingSuggestions = `You have used ${spentPercent}% of your budget. To build a stronger safety net, aim to save at least 15% (₹${(monthlyIncome * 0.15).toFixed(0)}) of your income next month. Try cutbacks on non-essential transactions and redirect the savings to a dedicated account.`;
    } else {
        savingSuggestions = `Excellent budget management! You have saved ${((100 - spentPercent)).toFixed(1)}% of your monthly income (₹${remainingBudget.toFixed(0)} remaining). Consider setting up a recurring deposit or investing these surplus funds in index funds or mutual funds to grow your wealth.`;
    }

    const avgAmount = totalSpent / expenses.length;
    const largeExpenses = expenses.filter(e => e.amount > avgAmount * 1.8).sort((a, b) => b.amount - a.amount);
    let unusualExpenses = "";
    if (largeExpenses.length > 0) {
        unusualExpenses = `We flagged the following transaction(s) as unusually large compared to your average expense of ₹${avgAmount.toFixed(0)}: ` +
            largeExpenses.map(le => `₹${le.amount} spent on "${le.title}" (${categoryLabels[le.category.toLowerCase()] || le.category})`).join(", ") +
            `. Verify if these are recurring costs or one-time purchases so you can plan for them in future budgets.`;
    } else {
        unusualExpenses = "All transactions are relatively close to your average spending size (average ₹" + avgAmount.toFixed(0) + "). No outlying spikes detected.";
    }

    const wallets = {};
    expenses.forEach(e => {
        const w = e.wallet || "Cash";
        wallets[w] = (wallets[w] || 0) + parseFloat(e.amount);
    });
    const sortedWallets = Object.entries(wallets).sort((a, b) => b[1] - a[1]);
    const topWallet = sortedWallets[0] ? sortedWallets[0][0] : "Cash";

    let monthlyHabits = `Your primary spending category is ${friendlyTopCat}, making up ${topCategoryPercent}% of your total outflow. `;
    if (topWallet) {
        monthlyHabits += `You rely heavily on ${topWallet} for transactions (₹${(wallets[topWallet] || 0).toFixed(0)} spent). `;
    }
    if (expenses.length > 5) {
        monthlyHabits += `With ${expenses.length} transactions logged, your spending shows a regular frequency, suggesting active daily monitoring.`;
    } else {
        monthlyHabits += `You have logged only a few transactions, indicating you might be batching records or need to establish a more frequent logging routine.`;
    }

    return {
        wastedMoney,
        savingSuggestions,
        unusualExpenses,
        monthlyHabits
    };
}


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

        let expenses = [];
        let monthlyIncome = 150000;

        // Try to fetch from DB first (only if userId is a valid ObjectId)
        if (mongoose.Types.ObjectId.isValid(userId)) {
            try {
                const dbExpenses = await Expense.find({ user: userId }).sort({ date: -1 });
                if (dbExpenses.length > 0) {
                    expenses = dbExpenses.map(e => ({
                        title: e.title,
                        amount: e.amount,
                        category: e.category,
                        date: e.date,
                        wallet: e.wallet || "Cash"
                    }));
                }
            } catch (dbError) {
                console.warn("DB fetch failed, will use body data:", dbError.message);
            }
        }

        // Fall back to request body data if DB returned nothing
        if (expenses.length === 0 && req.body.expenses && req.body.expenses.length > 0) {
            expenses = req.body.expenses;
        }

        if (req.body.monthlyIncome) {
            monthlyIncome = parseFloat(req.body.monthlyIncome);
        }

        if (expenses.length === 0) {
            return res.status(400).json({ message: "Please log at least one expense entry before running an AI financial audit." });
        }

        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) {
            console.log("Gemini API key missing, falling back to local spending analysis.");
            const localAudit = generateLocalAnalysis(expenses, monthlyIncome);
            return res.status(200).json(localAudit);
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        // Build rich context for the AI
        const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const remainingBudget = monthlyIncome - totalSpent;
        const spentPercent = ((totalSpent / monthlyIncome) * 100).toFixed(1);

        // Category breakdown
        const categoryTotals = {};
        expenses.forEach(e => {
            const cat = e.category || "other";
            categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(e.amount);
        });
        const categoryBreakdown = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, total]) => `${cat}: ₹${total.toFixed(0)} (${((total / totalSpent) * 100).toFixed(1)}%)`)
            .join(", ");

        // Individual expense log
        const financialLogText = expenses.map(e =>
            `Amount: ₹${e.amount}, Description: ${e.title}, Category: ${e.category}, Date: ${e.date}, Payment: ${e.wallet || "Cash"}`
        ).join("\n");

        const structuralPrompt = `
        You are a senior personal finance advisor analyzing a real person's spending data. Give specific, personalized advice based on the ACTUAL expenses listed below. Do NOT give generic advice.

        USER'S FINANCIAL CONTEXT:
        - Monthly Income/Budget: ₹${monthlyIncome.toLocaleString('en-IN')}
        - Total Spent: ₹${totalSpent.toFixed(0)} (${spentPercent}% of budget)
        - Remaining Budget: ₹${remainingBudget.toFixed(0)}
        - Number of transactions: ${expenses.length}

        SPENDING BY CATEGORY:
        ${categoryBreakdown}

        DETAILED EXPENSE LOG:
        ${financialLogText}

        Analyze the above data and respond with a JSON object. Reference SPECIFIC expense names, amounts, and categories from the data. Be concrete and actionable.

        Format your reply strictly as a clean JSON object containing exactly these keys. Do not include markdown blocks, code fences, or text outside the JSON:
        {
          "wastedMoney": "Identify specific expenses from the log above that appear wasteful, unnecessary, or excessive. Mention them by name and amount. If spending looks reasonable, say so.",
          "savingSuggestions": "Based on the category breakdown and budget utilization (${spentPercent}%), provide 2-3 specific, actionable steps this user can take. Reference their actual spending categories and amounts.",
          "unusualExpenses": "Flag any specific transactions that are unusually large compared to others, or that seem out of pattern. Reference exact amounts and names from the log.",
          "monthlyHabits": "Analyze spending patterns across categories and payment methods. Note which categories dominate, whether spending is concentrated or spread out, and any observable habits."
        }`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: structuralPrompt,
            });

            // Clean out common formatting wrappers if returned by accident
            let rawText = response.text.trim();
            if (rawText.startsWith("```json")) rawText = rawText.substring(7);
            if (rawText.startsWith("```")) rawText = rawText.substring(3);
            if (rawText.endsWith("```")) rawText = rawText.substring(0, rawText.length - 3);

            const structuredAudit = JSON.parse(rawText.trim());
            res.status(200).json(structuredAudit);
        } catch (error) {
            console.error("AI analysis call failed, falling back to local analysis. Error:", error.message || error);
            const localAudit = generateLocalAnalysis(expenses, monthlyIncome);
            res.status(200).json(localAudit);
        }
    } catch (outerError) {
        console.error("AI analysis outer error:", outerError.message);
        res.status(500).json({ message: "Deep analysis thread failed to process.", error: outerError.message });
    }
});

module.exports = router;