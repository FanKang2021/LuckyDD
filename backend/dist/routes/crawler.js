"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const _8200cn_1 = require("../crawlers/8200cn");
const mockData_1 = require("../crawlers/mockData");
const lotteryCrawler_1 = require("../crawler/lotteryCrawler");
const router = express_1.default.Router();
router.post('/double-color-ball', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlDoubleColorBall)();
        res.json({ status: 'success', message: '双色球数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/super-lotto', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlSuperLotto)();
        res.json({ status: 'success', message: '大乐透数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/lottery-3d', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlLottery3D)();
        res.json({ status: 'success', message: '福彩3D数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/happy-8', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlHappy8)();
        res.json({ status: 'success', message: '快乐8数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/arrangement-3', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlArrangement3)();
        res.json({ status: 'success', message: '排列3数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/arrangement-5', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlArrangement5)();
        res.json({ status: 'success', message: '排列5数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/seven-star', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlSevenStar)();
        res.json({ status: 'success', message: '七星彩数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/seven-color', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlSevenColor)();
        res.json({ status: 'success', message: '七乐彩数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/all', async (req, res) => {
    try {
        await (0, _8200cn_1.crawlAll)();
        res.json({ status: 'success', message: '所有彩种数据采集完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/mock', async (req, res) => {
    try {
        (0, mockData_1.generateMockData)();
        res.json({ status: 'success', message: '模拟数据生成完成' });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/update', async (req, res) => {
    try {
        const result = await (0, lotteryCrawler_1.manualUpdate)();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.post('/reset', async (req, res) => {
    try {
        const result = await (0, lotteryCrawler_1.resetDatabase)();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.crawlerRoutes = router;
