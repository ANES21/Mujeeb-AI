require("dotenv").config();

const express = require("express");
const Groq = require("groq-sdk");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

if (!process.env.GROQ_API_KEY) {
    console.error("خطأ: لم يتم تعيين GROQ_API_KEY في ملف .env");
    process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/ai", async (req, res) => {
    try {
        const { prompt, systemPrompt } = req.body;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({ error: "يرجى كتابة نص قبل الإرسال." });
        }

        // إعداد مصفوفة الرسائل مع الـ System Prompt
        const messages = [];
        
        if (systemPrompt && typeof systemPrompt === "string" && systemPrompt.trim()) {
            messages.push({ role: "system", content: systemPrompt });
        }
        
        messages.push({ role: "user", content: prompt });

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "allam-2-7b", // الموديل المعتمد في حسابك
        });

        const reply = chatCompletion.choices[0]?.message?.content || "لم يتم الحصول على إجابة.";
        return res.status(200).json({ result: reply });

    } catch (error) {
        console.error("Groq Error Details:", error);
        const errorMessage = error.error?.error?.message || error.message || "حدث خطأ أثناء المعالجة.";
        return res.status(error.status || 500).json({ error: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Groq AI is running on http://localhost:${PORT}`);
});
// أضف هذا السطر في نهاية ape.js
module.exports = app;