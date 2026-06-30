"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSevenColorAnomalies = exports.getSevenStarAnomalies = exports.getArrangement5Anomalies = exports.getArrangement3Anomalies = exports.getHappy8Anomalies = exports.getLottery3DAnomalies = exports.getSuperLottoAnomalies = exports.getDoubleColorBallAnomalies = exports.getAnomalies = exports.detectPatternAnomalies = exports.detectRepeatedNumbers = exports.detectOutlierSums = void 0;
const database_1 = require("../database");
const detectOutlierSums = (data, threshold = 2) => {
    const sums = data.map(d => d.numbers.reduce((a, b) => a + b, 0));
    const avg = sums.reduce((a, b) => a + b, 0) / sums.length;
    const variance = sums.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sums.length;
    const std = Math.sqrt(variance);
    return data
        .map((d, i) => {
        const sum = sums[i];
        const zScore = Math.abs((sum - avg) / std);
        return {
            period: d.id,
            date: d.date,
            numbers: d.numbers,
            anomalyScore: zScore,
            anomalyType: zScore > threshold ? '和值异常' : '正常',
            description: zScore > threshold ? `和值${sum}偏离均值${avg.toFixed(2)}达${zScore.toFixed(2)}个标准差` : ''
        };
    })
        .filter(a => a.anomalyType !== '正常')
        .sort((a, b) => b.anomalyScore - a.anomalyScore);
};
exports.detectOutlierSums = detectOutlierSums;
const detectRepeatedNumbers = (data) => {
    const results = [];
    for (let i = 1; i < data.length; i++) {
        const current = data[i].numbers;
        const previous = data[i - 1].numbers;
        const repeated = current.filter(n => previous.includes(n)).length;
        if (repeated >= 4) {
            results.push({
                period: data[i].id,
                date: data[i].date,
                numbers: current,
                anomalyScore: repeated,
                anomalyType: '重复号码异常',
                description: `与上期重复${repeated}个号码`
            });
        }
    }
    return results.sort((a, b) => b.anomalyScore - a.anomalyScore);
};
exports.detectRepeatedNumbers = detectRepeatedNumbers;
const detectPatternAnomalies = (data) => {
    const results = [];
    data.forEach(d => {
        const sorted = [...d.numbers].sort((a, b) => a - b);
        const consecutiveCount = sorted.reduce((count, num, i) => {
            if (i > 0 && num === sorted[i - 1] + 1)
                return count + 1;
            return count;
        }, 0);
        if (consecutiveCount >= 4) {
            results.push({
                period: d.id,
                date: d.date,
                numbers: d.numbers,
                anomalyScore: consecutiveCount,
                anomalyType: '连号异常',
                description: `出现${consecutiveCount + 1}个连续号码: ${sorted.join(', ')}`
            });
        }
    });
    return results.sort((a, b) => b.anomalyScore - a.anomalyScore);
};
exports.detectPatternAnomalies = detectPatternAnomalies;
const getAnomalies = (table, numberField) => {
    const rows = (0, database_1.getAll)(table).sort((a, b) => a.date.localeCompare(b.date));
    const data = rows.map(row => ({
        id: row.id,
        date: row.date,
        numbers: row[numberField]
    }));
    const outlierResults = (0, exports.detectOutlierSums)(data);
    const repeatedResults = (0, exports.detectRepeatedNumbers)(data);
    const patternResults = (0, exports.detectPatternAnomalies)(data);
    const allResults = [...outlierResults, ...repeatedResults, ...patternResults]
        .sort((a, b) => b.anomalyScore - a.anomalyScore)
        .slice(0, 20);
    return allResults;
};
exports.getAnomalies = getAnomalies;
const getDoubleColorBallAnomalies = () => {
    return (0, exports.getAnomalies)('double_color_ball', 'red_numbers');
};
exports.getDoubleColorBallAnomalies = getDoubleColorBallAnomalies;
const getSuperLottoAnomalies = () => {
    return (0, exports.getAnomalies)('super_lotto', 'front_numbers');
};
exports.getSuperLottoAnomalies = getSuperLottoAnomalies;
const getLottery3DAnomalies = () => {
    return (0, exports.getAnomalies)('lottery_3d', 'numbers');
};
exports.getLottery3DAnomalies = getLottery3DAnomalies;
const getHappy8Anomalies = () => {
    return (0, exports.getAnomalies)('happy_8', 'numbers');
};
exports.getHappy8Anomalies = getHappy8Anomalies;
const getArrangement3Anomalies = () => {
    return (0, exports.getAnomalies)('arrangement_3', 'numbers');
};
exports.getArrangement3Anomalies = getArrangement3Anomalies;
const getArrangement5Anomalies = () => {
    return (0, exports.getAnomalies)('arrangement_5', 'numbers');
};
exports.getArrangement5Anomalies = getArrangement5Anomalies;
const getSevenStarAnomalies = () => {
    return (0, exports.getAnomalies)('seven_star', 'numbers');
};
exports.getSevenStarAnomalies = getSevenStarAnomalies;
const getSevenColorAnomalies = () => {
    return (0, exports.getAnomalies)('seven_color', 'basic_numbers');
};
exports.getSevenColorAnomalies = getSevenColorAnomalies;
