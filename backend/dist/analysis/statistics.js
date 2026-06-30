"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSevenColorStatistics = exports.getSevenStarStatistics = exports.getArrangement5Statistics = exports.getArrangement3Statistics = exports.getHappy8Statistics = exports.getLottery3DStatistics = exports.getSuperLottoStatistics = exports.getDoubleColorBallStatistics = exports.getStatistics = exports.calculateIntervalAnalysis = exports.calculatePositionAnalysis = exports.calculateParityAnalysis = exports.calculateSumAnalysis = exports.calculateMissingNumbers = exports.calculateHotColdNumbers = void 0;
const database_1 = require("../database");
const calculateHotColdNumbers = (data, totalNumbers, startNumber = 1) => {
    const countMap = {};
    data.forEach(row => {
        row.forEach(num => {
            countMap[num] = (countMap[num] || 0) + 1;
        });
    });
    const totalDraws = data.length;
    const numbersPerDraw = data[0]?.length || 1;
    const totalNumberOccurrences = totalDraws * numbersPerDraw;
    const avgFrequency = totalNumberOccurrences / totalNumbers;
    const sorted = Object.entries(countMap)
        .map(([num, count]) => ({
        number: parseInt(num),
        count,
        frequency: count / totalDraws,
        isHot: false,
        isCold: false
    }))
        .sort((a, b) => b.count - a.count);
    const hotCount = Math.min(Math.max(3, Math.ceil(totalNumbers * 0.3)), Math.ceil(sorted.length * 0.3));
    const coldCount = Math.min(Math.max(3, Math.ceil(totalNumbers * 0.3)), Math.ceil(sorted.length * 0.3));
    for (let i = 0; i < hotCount; i++) {
        sorted[i].isHot = true;
    }
    for (let i = sorted.length - coldCount; i < sorted.length; i++) {
        sorted[i].isCold = true;
    }
    return sorted;
};
exports.calculateHotColdNumbers = calculateHotColdNumbers;
const calculateMissingNumbers = (data, totalNumbers, startNumber = 1) => {
    const lastOccurrence = {};
    const result = [];
    data.forEach((row, index) => {
        row.forEach(num => {
            lastOccurrence[num] = index;
        });
    });
    for (let i = startNumber; i < startNumber + totalNumbers; i++) {
        const lastIndex = lastOccurrence[i] ?? data.length;
        result.push({
            number: i,
            missingDays: data.length - lastIndex
        });
    }
    return result.sort((a, b) => b.missingDays - a.missingDays);
};
exports.calculateMissingNumbers = calculateMissingNumbers;
const calculateSumAnalysis = (data) => {
    if (data.length === 0) {
        return { min: 0, max: 0, avg: 0, std: 0 };
    }
    const sums = data.map(row => row.reduce((a, b) => a + b, 0));
    const min = Math.min(...sums);
    const max = Math.max(...sums);
    const avg = sums.reduce((a, b) => a + b, 0) / sums.length;
    const variance = sums.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sums.length;
    const std = Math.sqrt(variance);
    return { min, max, avg, std };
};
exports.calculateSumAnalysis = calculateSumAnalysis;
const calculateParityAnalysis = (data) => {
    let oddCount = 0;
    let evenCount = 0;
    data.forEach(row => {
        row.forEach(num => {
            if (num % 2 === 0) {
                evenCount++;
            }
            else {
                oddCount++;
            }
        });
    });
    const total = oddCount + evenCount || 1;
    return {
        oddCount,
        evenCount,
        oddRate: oddCount / total,
        evenRate: evenCount / total
    };
};
exports.calculateParityAnalysis = calculateParityAnalysis;
const calculatePositionAnalysis = (data, totalNumbers, startNumber = 1) => {
    const positions = data[0]?.length || 0;
    const result = [];
    for (let pos = 0; pos < positions; pos++) {
        const positionData = data.map(row => [row[pos]]);
        const hotCold = (0, exports.calculateHotColdNumbers)(positionData, totalNumbers, startNumber);
        result.push({
            position: pos + 1,
            hotNumbers: hotCold.filter(n => n.isHot).slice(0, 5),
            coldNumbers: hotCold.filter(n => n.isCold).slice(0, 5),
            missingNumbers: (0, exports.calculateMissingNumbers)(positionData, totalNumbers, startNumber).slice(0, 5)
        });
    }
    return result;
};
exports.calculatePositionAnalysis = calculatePositionAnalysis;
const calculateIntervalAnalysis = (data, intervals) => {
    const totalOccurrences = data.reduce((acc, row) => acc + row.length, 0);
    return intervals.map(interval => {
        const count = data.reduce((acc, row) => {
            return acc + row.filter(num => num >= interval.start && num <= interval.end).length;
        }, 0);
        return {
            interval: interval.label,
            start: interval.start,
            end: interval.end,
            count,
            rate: totalOccurrences > 0 ? count / totalOccurrences : 0
        };
    });
};
exports.calculateIntervalAnalysis = calculateIntervalAnalysis;
const getStatistics = (table, numberField, totalNumbers, startNumber = 1) => {
    const rows = (0, database_1.getAll)(table);
    const numbers = rows.map(row => row[numberField]);
    const hotCold = (0, exports.calculateHotColdNumbers)(numbers, totalNumbers, startNumber);
    const hotNumbers = hotCold.filter(n => n.isHot).slice(0, 10);
    const coldNumbers = hotCold.filter(n => n.isCold).slice(0, 10);
    const missingNumbers = (0, exports.calculateMissingNumbers)(numbers, totalNumbers, startNumber);
    const sumAnalysis = (0, exports.calculateSumAnalysis)(numbers);
    const parityAnalysis = (0, exports.calculateParityAnalysis)(numbers);
    return {
        hotNumbers,
        coldNumbers,
        missingNumbers,
        sumAnalysis,
        parityAnalysis
    };
};
exports.getStatistics = getStatistics;
const getDoubleColorBallStatistics = () => {
    const rows = (0, database_1.getAll)('double_color_ball');
    const redNumbers = rows.map(row => row.red_numbers);
    const blueNumbers = rows.map(row => [row.blue_number]);
    const redHotCold = (0, exports.calculateHotColdNumbers)(redNumbers, 33);
    const blueHotCold = (0, exports.calculateHotColdNumbers)(blueNumbers, 16);
    const result = {
        hotNumbers: redHotCold.filter(n => n.isHot).slice(0, 10),
        coldNumbers: redHotCold.filter(n => n.isCold).slice(0, 10),
        missingNumbers: (0, exports.calculateMissingNumbers)(redNumbers, 33).slice(0, 10),
        sumAnalysis: (0, exports.calculateSumAnalysis)(redNumbers),
        parityAnalysis: (0, exports.calculateParityAnalysis)(redNumbers),
        intervalAnalysis: (0, exports.calculateIntervalAnalysis)(redNumbers, [
            { start: 1, end: 11, label: '一区' },
            { start: 12, end: 22, label: '二区' },
            { start: 23, end: 33, label: '三区' }
        ]),
        secondaryAnalysis: {
            hotNumbers: blueHotCold.filter(n => n.isHot).slice(0, 5),
            coldNumbers: blueHotCold.filter(n => n.isCold).slice(0, 5),
            missingNumbers: (0, exports.calculateMissingNumbers)(blueNumbers, 16).slice(0, 5)
        }
    };
    return result;
};
exports.getDoubleColorBallStatistics = getDoubleColorBallStatistics;
const getSuperLottoStatistics = () => {
    const rows = (0, database_1.getAll)('super_lotto');
    const frontNumbers = rows.map(row => row.front_numbers);
    const backNumbers = rows.map(row => row.back_numbers);
    const frontHotCold = (0, exports.calculateHotColdNumbers)(frontNumbers, 35);
    const backHotCold = (0, exports.calculateHotColdNumbers)(backNumbers, 12);
    const result = {
        hotNumbers: frontHotCold.filter(n => n.isHot).slice(0, 10),
        coldNumbers: frontHotCold.filter(n => n.isCold).slice(0, 10),
        missingNumbers: (0, exports.calculateMissingNumbers)(frontNumbers, 35).slice(0, 10),
        sumAnalysis: (0, exports.calculateSumAnalysis)(frontNumbers),
        parityAnalysis: (0, exports.calculateParityAnalysis)(frontNumbers),
        intervalAnalysis: (0, exports.calculateIntervalAnalysis)(frontNumbers, [
            { start: 1, end: 7, label: '一区' },
            { start: 8, end: 14, label: '二区' },
            { start: 15, end: 21, label: '三区' },
            { start: 22, end: 28, label: '四区' },
            { start: 29, end: 35, label: '五区' }
        ]),
        secondaryAnalysis: {
            hotNumbers: backHotCold.filter(n => n.isHot).slice(0, 5),
            coldNumbers: backHotCold.filter(n => n.isCold).slice(0, 5),
            missingNumbers: (0, exports.calculateMissingNumbers)(backNumbers, 12).slice(0, 5)
        }
    };
    return result;
};
exports.getSuperLottoStatistics = getSuperLottoStatistics;
const getLottery3DStatistics = () => {
    const rows = (0, database_1.getAll)('lottery_3d');
    const numbers = rows.map(row => row.numbers);
    const hotCold = (0, exports.calculateHotColdNumbers)(numbers, 10, 0);
    return {
        hotNumbers: hotCold.filter(n => n.isHot).slice(0, 5),
        coldNumbers: hotCold.filter(n => n.isCold).slice(0, 5),
        missingNumbers: (0, exports.calculateMissingNumbers)(numbers, 10, 0).slice(0, 5),
        sumAnalysis: (0, exports.calculateSumAnalysis)(numbers),
        parityAnalysis: (0, exports.calculateParityAnalysis)(numbers),
        positionAnalysis: (0, exports.calculatePositionAnalysis)(numbers, 10, 0)
    };
};
exports.getLottery3DStatistics = getLottery3DStatistics;
const getHappy8Statistics = () => {
    return (0, exports.getStatistics)('happy_8', 'numbers', 80);
};
exports.getHappy8Statistics = getHappy8Statistics;
const getArrangement3Statistics = () => {
    const rows = (0, database_1.getAll)('arrangement_3');
    const numbers = rows.map(row => row.numbers);
    const hotCold = (0, exports.calculateHotColdNumbers)(numbers, 10, 0);
    return {
        hotNumbers: hotCold.filter(n => n.isHot).slice(0, 5),
        coldNumbers: hotCold.filter(n => n.isCold).slice(0, 5),
        missingNumbers: (0, exports.calculateMissingNumbers)(numbers, 10, 0).slice(0, 5),
        sumAnalysis: (0, exports.calculateSumAnalysis)(numbers),
        parityAnalysis: (0, exports.calculateParityAnalysis)(numbers),
        positionAnalysis: (0, exports.calculatePositionAnalysis)(numbers, 10, 0)
    };
};
exports.getArrangement3Statistics = getArrangement3Statistics;
const getArrangement5Statistics = () => {
    const rows = (0, database_1.getAll)('arrangement_5');
    const numbers = rows.map(row => row.numbers);
    const hotCold = (0, exports.calculateHotColdNumbers)(numbers, 10, 0);
    return {
        hotNumbers: hotCold.filter(n => n.isHot).slice(0, 5),
        coldNumbers: hotCold.filter(n => n.isCold).slice(0, 5),
        missingNumbers: (0, exports.calculateMissingNumbers)(numbers, 10, 0).slice(0, 5),
        sumAnalysis: (0, exports.calculateSumAnalysis)(numbers),
        parityAnalysis: (0, exports.calculateParityAnalysis)(numbers),
        positionAnalysis: (0, exports.calculatePositionAnalysis)(numbers, 10, 0)
    };
};
exports.getArrangement5Statistics = getArrangement5Statistics;
const getSevenStarStatistics = () => {
    const rows = (0, database_1.getAll)('seven_star');
    const numbers = rows.map(row => row.numbers);
    const hotCold = (0, exports.calculateHotColdNumbers)(numbers, 10, 0);
    return {
        hotNumbers: hotCold.filter(n => n.isHot).slice(0, 5),
        coldNumbers: hotCold.filter(n => n.isCold).slice(0, 5),
        missingNumbers: (0, exports.calculateMissingNumbers)(numbers, 10, 0).slice(0, 5),
        sumAnalysis: (0, exports.calculateSumAnalysis)(numbers),
        parityAnalysis: (0, exports.calculateParityAnalysis)(numbers),
        positionAnalysis: (0, exports.calculatePositionAnalysis)(numbers, 10, 0)
    };
};
exports.getSevenStarStatistics = getSevenStarStatistics;
const getSevenColorStatistics = () => {
    const rows = (0, database_1.getAll)('seven_color');
    const basicNumbers = rows.map(row => row.basic_numbers);
    const specialNumbers = rows.map(row => [row.special_number]);
    const basicHotCold = (0, exports.calculateHotColdNumbers)(basicNumbers, 30);
    const specialHotCold = (0, exports.calculateHotColdNumbers)(specialNumbers, 30);
    return {
        hotNumbers: basicHotCold.filter(n => n.isHot).slice(0, 10),
        coldNumbers: basicHotCold.filter(n => n.isCold).slice(0, 10),
        missingNumbers: (0, exports.calculateMissingNumbers)(basicNumbers, 30).slice(0, 10),
        sumAnalysis: (0, exports.calculateSumAnalysis)(basicNumbers),
        parityAnalysis: (0, exports.calculateParityAnalysis)(basicNumbers),
        secondaryAnalysis: {
            hotNumbers: specialHotCold.filter(n => n.isHot).slice(0, 5),
            coldNumbers: specialHotCold.filter(n => n.isCold).slice(0, 5),
            missingNumbers: (0, exports.calculateMissingNumbers)(specialNumbers, 30).slice(0, 5)
        }
    };
};
exports.getSevenColorStatistics = getSevenColorStatistics;
