"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisRoutes = void 0;
const express_1 = __importDefault(require("express"));
const statistics_1 = require("../analysis/statistics");
const patternMining_1 = require("../analysis/patternMining");
const anomalyDetection_1 = require("../analysis/anomalyDetection");
const recommendation_1 = require("../analysis/recommendation");
const router = express_1.default.Router();
const statisticsRoutes = {
    'double-color-ball': statistics_1.getDoubleColorBallStatistics,
    'super-lotto': statistics_1.getSuperLottoStatistics,
    'lottery-3d': statistics_1.getLottery3DStatistics,
    'happy-8': statistics_1.getHappy8Statistics,
    'arrangement-3': statistics_1.getArrangement3Statistics,
    'arrangement-5': statistics_1.getArrangement5Statistics,
    'seven-star': statistics_1.getSevenStarStatistics,
    'seven-color': statistics_1.getSevenColorStatistics
};
const patternsRoutes = {
    'double-color-ball': patternMining_1.getDoubleColorBallPatterns,
    'super-lotto': patternMining_1.getSuperLottoPatterns,
    'lottery-3d': patternMining_1.getLottery3DPatterns,
    'happy-8': patternMining_1.getHappy8Patterns,
    'arrangement-3': patternMining_1.getArrangement3Patterns,
    'arrangement-5': patternMining_1.getArrangement5Patterns,
    'seven-star': patternMining_1.getSevenStarPatterns,
    'seven-color': patternMining_1.getSevenColorPatterns
};
const recommendationsRoutes = {
    'double-color-ball': recommendation_1.getDoubleColorBallRecommendations,
    'super-lotto': recommendation_1.getSuperLottoRecommendations,
    'lottery-3d': recommendation_1.getLottery3DRecommendations,
    'happy-8': recommendation_1.getHappy8Recommendations,
    'arrangement-3': recommendation_1.getArrangement3Recommendations,
    'arrangement-5': recommendation_1.getArrangement5Recommendations,
    'seven-star': recommendation_1.getSevenStarRecommendations,
    'seven-color': recommendation_1.getSevenColorRecommendations
};
router.get('/statistics/:type', (req, res) => {
    try {
        const handler = statisticsRoutes[req.params.type];
        if (!handler) {
            res.status(400).json({ error: 'Invalid lottery type' });
            return;
        }
        const result = handler();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/patterns/:type', (req, res) => {
    try {
        const handler = patternsRoutes[req.params.type];
        if (!handler) {
            res.status(400).json({ error: 'Invalid lottery type' });
            return;
        }
        const result = handler();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const anomaliesRoutes = {
    'double-color-ball': anomalyDetection_1.getDoubleColorBallAnomalies,
    'super-lotto': anomalyDetection_1.getSuperLottoAnomalies,
    'lottery-3d': anomalyDetection_1.getLottery3DAnomalies,
    'happy-8': anomalyDetection_1.getHappy8Anomalies,
    'arrangement-3': anomalyDetection_1.getArrangement3Anomalies,
    'arrangement-5': anomalyDetection_1.getArrangement5Anomalies,
    'seven-star': anomalyDetection_1.getSevenStarAnomalies,
    'seven-color': anomalyDetection_1.getSevenColorAnomalies
};
router.get('/anomalies/:type', (req, res) => {
    try {
        const handler = anomaliesRoutes[req.params.type];
        if (!handler) {
            res.status(400).json({ error: 'Invalid lottery type' });
            return;
        }
        const result = handler();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/recommendations/:type', (req, res) => {
    try {
        const handler = recommendationsRoutes[req.params.type];
        if (!handler) {
            res.status(400).json({ error: 'Invalid lottery type' });
            return;
        }
        let weights = null;
        if (req.query.weights) {
            try {
                weights = JSON.parse(req.query.weights);
            }
            catch (e) {
                res.status(400).json({ error: 'Invalid weights parameter' });
                return;
            }
        }
        const result = weights ? handler(weights) : handler();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.analysisRoutes = router;
