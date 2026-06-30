"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const lottery_1 = require("./routes/lottery");
const crawler_1 = require("./routes/crawler");
const analysis_1 = require("./routes/analysis");
const advancedAnalysis_1 = require("./routes/advancedAnalysis");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/lottery', lottery_1.lotteryRoutes);
app.use('/api/crawler', crawler_1.crawlerRoutes);
app.use('/api/analysis', analysis_1.analysisRoutes);
app.use('/api/advanced', advancedAnalysis_1.advancedAnalysisRoutes);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LuckyDD Backend is running' });
});
const start = () => {
    try {
        (0, database_1.initDatabase)();
        console.log('Database initialized successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
start();
