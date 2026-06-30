"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedAnalysisRoutes = void 0;
const express_1 = require("express");
const database_1 = require("../database");
const patternMining_1 = require("../analysis/patternMining");
const router = (0, express_1.Router)();
router.get('/trends/:lotteryType', (req, res) => {
    const { lotteryType } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const data = (0, database_1.query)(lotteryType, { limit, orderBy: 'date', order: 'DESC' });
    if (!data || data.length === 0) {
        return res.json({ issues: [], trends: [] });
    }
    const issues = data.map((d) => d.date);
    const fieldMap = {
        'double_color_ball': 'red_numbers',
        'super_lotto': 'front_numbers',
        'lottery_3d': 'numbers',
        'happy_8': 'numbers',
        'arrangement_3': 'numbers',
        'arrangement_5': 'numbers',
        'seven_star': 'numbers',
        'seven_color': 'basic_numbers'
    };
    const field = fieldMap[lotteryType] || 'numbers';
    const totalNumbers = lotteryType === 'happy_8' ? 80 : lotteryType.includes('lottery_3d') || lotteryType.includes('arrangement') || lotteryType.includes('seven_star') ? 10 : lotteryType === 'seven_color' ? 30 : lotteryType === 'double_color_ball' ? 33 : 35;
    const startNumber = lotteryType.includes('lottery_3d') || lotteryType.includes('arrangement') || lotteryType.includes('seven_star') ? 0 : 1;
    const trends = Array.from({ length: totalNumbers }, () => []);
    data.forEach((row) => {
        const numbers = row[field];
        const drawnNumbers = Array.isArray(numbers) ? numbers : [numbers];
        const drawnSet = new Set(drawnNumbers);
        for (let i = startNumber; i < startNumber + totalNumbers; i++) {
            const value = drawnSet.has(i) ? 1 : 0;
            trends[i - startNumber].push(value);
        }
    });
    res.json({
        issues,
        trends,
        totalNumbers,
        startNumber
    });
});
router.get('/heatmap/:lotteryType', (req, res) => {
    const { lotteryType } = req.params;
    const data = (0, database_1.getAll)(lotteryType);
    if (!data || data.length === 0) {
        return res.json({ heatmap: [] });
    }
    const fieldMap = {
        'double_color_ball': 'red_numbers',
        'super_lotto': 'front_numbers',
        'lottery_3d': 'numbers',
        'happy_8': 'numbers',
        'arrangement_3': 'numbers',
        'arrangement_5': 'numbers',
        'seven_star': 'numbers',
        'seven_color': 'basic_numbers'
    };
    const field = fieldMap[lotteryType] || 'numbers';
    const totalNumbers = lotteryType === 'happy_8' ? 80 : lotteryType.includes('lottery_3d') || lotteryType.includes('arrangement') || lotteryType.includes('seven_star') ? 10 : lotteryType === 'seven_color' ? 30 : lotteryType === 'double_color_ball' ? 33 : 35;
    const startNumber = lotteryType.includes('lottery_3d') || lotteryType.includes('arrangement') || lotteryType.includes('seven_star') ? 0 : 1;
    const numbers = data.map((row) => row[field]).flat();
    const frequency = Array.from({ length: totalNumbers }, (_, i) => ({
        number: i + startNumber,
        count: 0,
        rate: 0
    }));
    numbers.forEach((num) => {
        const index = num - startNumber;
        if (index >= 0 && index < totalNumbers) {
            frequency[index].count++;
        }
    });
    const totalDraws = data.length;
    const totalCount = numbers.length;
    frequency.forEach(item => {
        item.rate = totalDraws > 0 ? item.count / totalDraws : 0;
    });
    res.json({
        heatmap: frequency,
        totalDraws,
        totalCount
    });
});
router.get('/sequences/:lotteryType', (req, res) => {
    const { lotteryType } = req.params;
    const windowSize = parseInt(req.query.windowSize) || 5;
    const data = (0, database_1.getAll)(lotteryType);
    if (!data || data.length === 0) {
        return res.json({ sequences: [] });
    }
    const fieldMap = {
        'double_color_ball': 'red_numbers',
        'super_lotto': 'front_numbers',
        'lottery_3d': 'numbers',
        'happy_8': 'numbers',
        'arrangement_3': 'numbers',
        'arrangement_5': 'numbers',
        'seven_star': 'numbers',
        'seven_color': 'basic_numbers'
    };
    const field = fieldMap[lotteryType] || 'numbers';
    const numbers = data.map((row) => row[field]);
    const sequences = (0, patternMining_1.findSequencePatterns)(numbers, windowSize);
    res.json({ sequences });
});
exports.advancedAnalysisRoutes = router;
