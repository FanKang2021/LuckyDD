"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSevenColorPatterns = exports.getSevenStarPatterns = exports.getArrangement5Patterns = exports.getArrangement3Patterns = exports.getHappy8Patterns = exports.getLottery3DPatterns = exports.getSuperLottoPatterns = exports.getDoubleColorBallPatterns = exports.getPatterns = exports.findNumberCorrelations = exports.findSequencePatterns = exports.findFrequentPatterns = void 0;
const database_1 = require("../database");
const findFrequentPatterns = (data, minSupport = 0.02) => {
    const patternMap = {};
    const totalDraws = data.length;
    data.forEach(row => {
        const sortedRow = [...row].sort((a, b) => a - b);
        for (let i = 0; i < sortedRow.length; i++) {
            for (let j = i + 1; j <= sortedRow.length; j++) {
                const pattern = sortedRow.slice(i, j).join(',');
                if (pattern.length > 0) {
                    patternMap[pattern] = (patternMap[pattern] || 0) + 1;
                }
            }
        }
    });
    return Object.entries(patternMap)
        .map(([pattern, count]) => ({
        numbers: pattern.split(',').map(Number),
        count,
        support: count / totalDraws
    }))
        .filter(p => p.support >= minSupport && p.numbers.length >= 2)
        .sort((a, b) => b.support - a.support)
        .slice(0, 50);
};
exports.findFrequentPatterns = findFrequentPatterns;
const findSequencePatterns = (data, windowSize = 5) => {
    const sequenceMap = {};
    const totalDraws = data.length;
    for (let i = 0; i < totalDraws - windowSize + 1; i++) {
        const window = data.slice(i, i + windowSize);
        const sequenceKey = window.map(row => row.join(',')).join('|');
        sequenceMap[sequenceKey] = (sequenceMap[sequenceKey] || 0) + 1;
    }
    return Object.entries(sequenceMap)
        .map(([key, count]) => ({
        sequence: key.split('|').map(s => s.split(',').map(Number)),
        count,
        support: count / (totalDraws - windowSize + 1)
    }))
        .filter(s => s.support > 0.01)
        .sort((a, b) => b.support - a.support)
        .slice(0, 20);
};
exports.findSequencePatterns = findSequencePatterns;
const findNumberCorrelations = (data, totalNumbers, startNumber = 1) => {
    const pairCount = {};
    const singleCount = {};
    const totalDraws = data.length;
    data.forEach(row => {
        row.forEach(num1 => {
            singleCount[num1] = (singleCount[num1] || 0) + 1;
            row.forEach(num2 => {
                if (num1 < num2) {
                    const key = `${num1},${num2}`;
                    pairCount[key] = (pairCount[key] || 0) + 1;
                }
            });
        });
    });
    return Object.entries(pairCount)
        .map(([key, count]) => {
        const [num1, num2] = key.split(',').map(Number);
        const expected = (singleCount[num1] / totalDraws) * (singleCount[num2] / totalDraws) * totalDraws;
        const correlation = count / expected;
        return { number1: num1, number2: num2, correlation, count };
    })
        .sort((a, b) => b.correlation - a.correlation)
        .slice(0, 30);
};
exports.findNumberCorrelations = findNumberCorrelations;
const getPatterns = (table, numberField, totalNumbers, startNumber = 1) => {
    const rows = (0, database_1.getAll)(table);
    const numbers = rows.map(row => row[numberField]);
    const patterns = (0, exports.findFrequentPatterns)(numbers);
    const correlations = (0, exports.findNumberCorrelations)(numbers, totalNumbers, startNumber);
    return { patterns, correlations };
};
exports.getPatterns = getPatterns;
const getDoubleColorBallPatterns = () => {
    const rows = (0, database_1.getAll)('double_color_ball');
    const redNumbers = rows.map(row => row.red_numbers);
    const blueNumbers = rows.map(row => [row.blue_number]);
    return {
        patterns: (0, exports.findFrequentPatterns)(redNumbers),
        correlations: (0, exports.findNumberCorrelations)(redNumbers, 33),
        bluePatterns: (0, exports.findFrequentPatterns)(blueNumbers, 0.05),
        blueCorrelations: (0, exports.findNumberCorrelations)(blueNumbers, 16)
    };
};
exports.getDoubleColorBallPatterns = getDoubleColorBallPatterns;
const getSuperLottoPatterns = () => {
    const rows = (0, database_1.getAll)('super_lotto');
    const frontNumbers = rows.map(row => row.front_numbers);
    const backNumbers = rows.map(row => row.back_numbers);
    return {
        patterns: (0, exports.findFrequentPatterns)(frontNumbers),
        correlations: (0, exports.findNumberCorrelations)(frontNumbers, 35),
        backPatterns: (0, exports.findFrequentPatterns)(backNumbers, 0.05),
        backCorrelations: (0, exports.findNumberCorrelations)(backNumbers, 12)
    };
};
exports.getSuperLottoPatterns = getSuperLottoPatterns;
const getLottery3DPatterns = () => {
    return (0, exports.getPatterns)('lottery_3d', 'numbers', 10, 0);
};
exports.getLottery3DPatterns = getLottery3DPatterns;
const getHappy8Patterns = () => {
    return (0, exports.getPatterns)('happy_8', 'numbers', 80);
};
exports.getHappy8Patterns = getHappy8Patterns;
const getArrangement3Patterns = () => {
    return (0, exports.getPatterns)('arrangement_3', 'numbers', 10, 0);
};
exports.getArrangement3Patterns = getArrangement3Patterns;
const getArrangement5Patterns = () => {
    return (0, exports.getPatterns)('arrangement_5', 'numbers', 10, 0);
};
exports.getArrangement5Patterns = getArrangement5Patterns;
const getSevenStarPatterns = () => {
    return (0, exports.getPatterns)('seven_star', 'numbers', 10, 0);
};
exports.getSevenStarPatterns = getSevenStarPatterns;
const getSevenColorPatterns = () => {
    return (0, exports.getPatterns)('seven_color', 'basic_numbers', 30);
};
exports.getSevenColorPatterns = getSevenColorPatterns;
