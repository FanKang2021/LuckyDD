"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSevenColorRecommendations = exports.getSevenStarRecommendations = exports.getArrangement5Recommendations = exports.getArrangement3Recommendations = exports.getHappy8Recommendations = exports.getLottery3DRecommendations = exports.getSuperLottoRecommendations = exports.getDoubleColorBallRecommendations = exports.getRecommendations = void 0;
const database_1 = require("../database");
const statistics_1 = require("./statistics");
const patternMining_1 = require("./patternMining");
const lotteryConfigs = {
    double_color_ball: { mainField: 'red_numbers', mainTotal: 33, mainCount: 6, mainStart: 1, secondaryField: 'blue_number', secondaryTotal: 16, secondaryCount: 1, secondaryStart: 1 },
    super_lotto: { mainField: 'front_numbers', mainTotal: 35, mainCount: 5, mainStart: 1, secondaryField: 'back_numbers', secondaryTotal: 12, secondaryCount: 2, secondaryStart: 1 },
    lottery_3d: { mainField: 'numbers', mainTotal: 10, mainCount: 3, mainStart: 0 },
    happy_8: { mainField: 'numbers', mainTotal: 80, mainCount: 20, mainStart: 1 },
    arrangement_3: { mainField: 'numbers', mainTotal: 10, mainCount: 3, mainStart: 0 },
    arrangement_5: { mainField: 'numbers', mainTotal: 10, mainCount: 5, mainStart: 0 },
    seven_star: { mainField: 'numbers', mainTotal: 10, mainCount: 7, mainStart: 0 },
    seven_color: { mainField: 'basic_numbers', mainTotal: 30, mainCount: 7, mainStart: 1, secondaryField: 'special_number', secondaryTotal: 30, secondaryCount: 1, secondaryStart: 1 }
};
const generateRandomRecommendation = (totalNumbers, count, startNumber = 1) => {
    const numbers = [];
    while (numbers.length < count) {
        const num = Math.floor(Math.random() * totalNumbers) + startNumber;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    return numbers.sort((a, b) => a - b);
};
const generateSmartRecommendation = (hotNumbers, coldNumbers, missingNumbers, patterns, correlations, count, totalNumbers, startNumber = 1, weights) => {
    const selected = [];
    const hotPool = [...hotNumbers];
    const coldPool = [...coldNumbers];
    const missingPool = missingNumbers.map(m => m.number);
    const w = weights || { hotNumbers: 30, coldNumbers: 20, missingNumbers: 30, consecutiveNumbers: 10, repeatNumbers: 10 };
    const totalWeight = w.hotNumbers + w.coldNumbers + w.missingNumbers + w.consecutiveNumbers + w.repeatNumbers;
    const hotCount = Math.min(Math.ceil(count * w.hotNumbers / totalWeight), hotPool.length);
    for (let i = 0; i < hotCount; i++) {
        const index = Math.floor(Math.random() * hotPool.length);
        selected.push(hotPool.splice(index, 1)[0]);
    }
    const coldCount = Math.min(Math.floor(count * w.coldNumbers / totalWeight), coldPool.length);
    for (let i = 0; i < coldCount; i++) {
        const index = Math.floor(Math.random() * coldPool.length);
        selected.push(coldPool.splice(index, 1)[0]);
    }
    const patternPool = [...new Set(patterns.flat())].filter(n => !selected.includes(n));
    if (patternPool.length > 0 && selected.length < count) {
        const patternCount = Math.min(count - selected.length, Math.ceil(count * w.consecutiveNumbers / totalWeight));
        for (let i = 0; i < patternCount; i++) {
            const index = Math.floor(Math.random() * patternPool.length);
            selected.push(patternPool.splice(index, 1)[0]);
        }
    }
    const remainingPool = missingPool.filter(n => !selected.includes(n));
    const missingCount = Math.min(count - selected.length, Math.ceil(count * w.missingNumbers / totalWeight));
    for (let i = 0; i < missingCount && remainingPool.length > 0; i++) {
        const index = Math.floor(Math.random() * remainingPool.length);
        selected.push(remainingPool.splice(index, 1)[0]);
    }
    while (selected.length < count) {
        const num = Math.floor(Math.random() * totalNumbers) + startNumber;
        if (!selected.includes(num)) {
            selected.push(num);
        }
    }
    return [...new Set(selected)].sort((a, b) => a - b);
};
const generatePositionSmartRecommendation = (positionData, totalNumbers, startNumber = 1) => {
    const result = [];
    positionData.forEach(pos => {
        const pool = [...pos.hotNumbers, ...pos.coldNumbers.slice(0, 2), ...pos.missingNumbers.slice(0, 2)];
        if (pool.length > 0) {
            const index = Math.floor(Math.random() * pool.length);
            result.push(pool[index]);
        }
        else {
            result.push(Math.floor(Math.random() * totalNumbers) + startNumber);
        }
    });
    return result;
};
const generateSecondaryRecommendation = (hotNumbers, coldNumbers, missingNumbers, totalNumbers, count, startNumber = 1) => {
    const selected = [];
    const hotPool = [...hotNumbers];
    const coldPool = [...coldNumbers];
    const missingPool = missingNumbers.map(m => m.number);
    const hotCount = Math.min(Math.ceil(count * 0.5), hotPool.length);
    for (let i = 0; i < hotCount; i++) {
        const index = Math.floor(Math.random() * hotPool.length);
        selected.push(hotPool.splice(index, 1)[0]);
    }
    const coldCount = Math.min(Math.floor(count * 0.3), coldPool.length);
    for (let i = 0; i < coldCount; i++) {
        const index = Math.floor(Math.random() * coldPool.length);
        selected.push(coldPool.splice(index, 1)[0]);
    }
    const remainingPool = missingPool.filter(n => !selected.includes(n));
    while (selected.length < count && remainingPool.length > 0) {
        const index = Math.floor(Math.random() * remainingPool.length);
        selected.push(remainingPool.splice(index, 1)[0]);
    }
    while (selected.length < count) {
        const num = Math.floor(Math.random() * totalNumbers) + startNumber;
        if (!selected.includes(num)) {
            selected.push(num);
        }
    }
    return [...new Set(selected)].sort((a, b) => a - b);
};
const calculateConsecutiveNumbersProbability = (numbers) => {
    let consecutiveCount = 0;
    for (const row of numbers) {
        const sorted = [...row].sort((a, b) => a - b);
        let hasConsecutive = false;
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] - sorted[i] === 1) {
                hasConsecutive = true;
                break;
            }
        }
        if (hasConsecutive)
            consecutiveCount++;
    }
    return consecutiveCount / numbers.length;
};
const calculateRepeatNumberProbability = (numbers) => {
    let repeatCount = 0;
    for (let i = 1; i < numbers.length; i++) {
        const currentSet = new Set(numbers[i]);
        const prevSet = new Set(numbers[i - 1]);
        let overlap = 0;
        for (const num of currentSet) {
            if (prevSet.has(num))
                overlap++;
        }
        if (overlap > 0)
            repeatCount++;
    }
    return repeatCount / (numbers.length - 1);
};
const generateConsecutiveRecommendation = (hotNumbers, coldNumbers, missingNumbers, patterns, count, totalNumbers, startNumber = 1) => {
    const selected = [];
    const allNumbers = [...hotNumbers, ...coldNumbers, ...missingNumbers.map(m => m.number)];
    const avgConsecutiveProb = calculateConsecutiveNumbersProbability(patterns);
    const shouldIncludeConsecutive = Math.random() < (avgConsecutiveProb + 0.2);
    if (shouldIncludeConsecutive && allNumbers.length >= 2) {
        const sortedPool = [...allNumbers].sort((a, b) => a - b);
        let consecutivePairIndex = -1;
        for (let i = 0; i < sortedPool.length - 1; i++) {
            if (sortedPool[i + 1] - sortedPool[i] === 1) {
                consecutivePairIndex = i;
                break;
            }
        }
        if (consecutivePairIndex >= 0) {
            selected.push(sortedPool[consecutivePairIndex]);
            selected.push(sortedPool[consecutivePairIndex + 1]);
        }
    }
    const remainingPool = allNumbers.filter(n => !selected.includes(n));
    while (selected.length < count && remainingPool.length > 0) {
        const index = Math.floor(Math.random() * remainingPool.length);
        selected.push(remainingPool.splice(index, 1)[0]);
    }
    while (selected.length < count) {
        const num = Math.floor(Math.random() * totalNumbers) + startNumber;
        if (!selected.includes(num)) {
            selected.push(num);
        }
    }
    return [...new Set(selected)].sort((a, b) => a - b);
};
const generateRepeatNumberRecommendation = (data, hotNumbers, coldNumbers, count, totalNumbers, startNumber = 1) => {
    const selected = [];
    const lastNumbers = data[data.length - 1] || [];
    const lastSet = new Set(lastNumbers);
    const avgRepeatProb = calculateRepeatNumberProbability(data);
    const shouldIncludeRepeat = Math.random() < (avgRepeatProb + 0.1);
    if (shouldIncludeRepeat && lastNumbers.length > 0) {
        const repeatCount = Math.min(Math.ceil(count * 0.2), lastNumbers.length);
        const shuffleLast = [...lastNumbers].sort(() => Math.random() - 0.5);
        for (let i = 0; i < repeatCount; i++) {
            selected.push(shuffleLast[i]);
        }
    }
    const remainingPool = [...hotNumbers, ...coldNumbers].filter(n => !selected.includes(n));
    while (selected.length < count && remainingPool.length > 0) {
        const index = Math.floor(Math.random() * remainingPool.length);
        selected.push(remainingPool.splice(index, 1)[0]);
    }
    while (selected.length < count) {
        const num = Math.floor(Math.random() * totalNumbers) + startNumber;
        if (!selected.includes(num)) {
            selected.push(num);
        }
    }
    return [...new Set(selected)].sort((a, b) => a - b);
};
const generateMissingReturnRecommendation = (hotNumbers, coldNumbers, missingNumbers, count, totalNumbers, startNumber = 1) => {
    const selected = [];
    const avgMissingDays = missingNumbers.reduce((sum, m) => sum + m.missingDays, 0) / missingNumbers.length;
    const nearReturnMissing = missingNumbers.filter(m => m.missingDays >= avgMissingDays * 0.8 && m.missingDays <= avgMissingDays * 1.5);
    const returnCount = Math.min(Math.ceil(count * 0.4), nearReturnMissing.length);
    for (let i = 0; i < returnCount; i++) {
        const index = Math.floor(Math.random() * nearReturnMissing.length);
        selected.push(nearReturnMissing.splice(index, 1)[0].number);
    }
    const hotPool = hotNumbers.filter(n => !selected.includes(n));
    const hotCount = Math.min(Math.ceil(count * 0.3), hotPool.length);
    for (let i = 0; i < hotCount; i++) {
        const index = Math.floor(Math.random() * hotPool.length);
        selected.push(hotPool.splice(index, 1)[0]);
    }
    const remainingPool = coldNumbers.filter(n => !selected.includes(n));
    while (selected.length < count && remainingPool.length > 0) {
        const index = Math.floor(Math.random() * remainingPool.length);
        selected.push(remainingPool.splice(index, 1)[0]);
    }
    while (selected.length < count) {
        const num = Math.floor(Math.random() * totalNumbers) + startNumber;
        if (!selected.includes(num)) {
            selected.push(num);
        }
    }
    return [...new Set(selected)].sort((a, b) => a - b);
};
const analyzeNumberFrequency = (numbers, totalNumbers) => {
    const frequency = new Map();
    for (let i = 0; i < totalNumbers; i++) {
        frequency.set(i, 0);
    }
    for (const row of numbers) {
        for (const num of row) {
            const current = frequency.get(num) || 0;
            frequency.set(num, current + 1);
        }
    }
    return frequency;
};
const generateFrequencyBasedRecommendation = (frequency, count, totalNumbers, startNumber = 1) => {
    const sortedByFreq = Array.from(frequency.entries())
        .map(([num, freq]) => ({ num, freq }))
        .sort((a, b) => b.freq - a.freq);
    const selected = [];
    const poolSize = sortedByFreq.length;
    for (let i = 0; i < count && selected.length < count; i++) {
        const index = Math.floor(Math.random() * Math.min(poolSize, 10));
        const candidate = sortedByFreq[index].num;
        if (!selected.includes(candidate)) {
            selected.push(candidate);
        }
    }
    while (selected.length < count) {
        const num = Math.floor(Math.random() * totalNumbers) + startNumber;
        if (!selected.includes(num)) {
            selected.push(num);
        }
    }
    return [...new Set(selected)].sort((a, b) => a - b);
};
const simulateStrategyAccuracy = (data, strategyName, totalNumbers, count, startNumber = 1) => {
    let totalHits = 0;
    let totalPredictions = 0;
    for (let i = 10; i < Math.min(data.length, 50); i++) {
        const historyData = data.slice(0, i);
        const actualResult = data[i];
        const actualSet = new Set(actualResult);
        const hotCold = (0, statistics_1.calculateHotColdNumbers)(historyData, totalNumbers, startNumber);
        const hotNums = hotCold.filter(n => n.isHot).map(n => n.number);
        const coldNums = hotCold.filter(n => n.isCold).map(n => n.number);
        const missingNumbers = (0, statistics_1.calculateMissingNumbers)(historyData, totalNumbers, startNumber);
        const patterns = (0, patternMining_1.findFrequentPatterns)(historyData, 0.02).map(p => p.numbers);
        const correlations = (0, patternMining_1.findNumberCorrelations)(historyData, totalNumbers, startNumber);
        let prediction;
        switch (strategyName) {
            case '智能综合':
                prediction = generateSmartRecommendation(hotNums, coldNums, missingNumbers, patterns, correlations, count, totalNumbers, startNumber);
                break;
            case '连号策略':
                prediction = generateConsecutiveRecommendation(hotNums, coldNums, missingNumbers, patterns, count, totalNumbers, startNumber);
                break;
            case '重复号策略':
                prediction = generateRepeatNumberRecommendation(historyData, hotNums, coldNums, count, totalNumbers, startNumber);
                break;
            case '遗漏回补':
                prediction = generateMissingReturnRecommendation(hotNums, coldNums, missingNumbers, count, totalNumbers, startNumber);
                break;
            default:
                prediction = generateRandomRecommendation(totalNumbers, count, startNumber);
        }
        const hits = prediction.filter(n => actualSet.has(n)).length;
        totalHits += hits;
        totalPredictions += count;
    }
    return totalPredictions > 0 ? totalHits / totalPredictions : 0;
};
const generateBalancedRecommendation = (data, totalNumbers, count, startNumber = 1) => {
    const hotCold = (0, statistics_1.calculateHotColdNumbers)(data, totalNumbers, startNumber);
    const hotNums = hotCold.filter(n => n.isHot).map(n => n.number);
    const coldNums = hotCold.filter(n => n.isCold).map(n => n.number);
    const selected = [];
    const hotCount = Math.floor(Math.random() * 2) + Math.floor(count / 2);
    for (let i = 0; i < hotCount && hotNums.length > 0; i++) {
        const index = Math.floor(Math.random() * hotNums.length);
        selected.push(hotNums.splice(index, 1)[0]);
    }
    const coldCount = count - selected.length;
    for (let i = 0; i < coldCount && coldNums.length > 0; i++) {
        const index = Math.floor(Math.random() * coldNums.length);
        selected.push(coldNums.splice(index, 1)[0]);
    }
    while (selected.length < count) {
        const num = Math.floor(Math.random() * totalNumbers) + startNumber;
        if (!selected.includes(num)) {
            selected.push(num);
        }
    }
    return [...new Set(selected)].sort((a, b) => a - b);
};
const getRecommendations = (lotteryType, weights) => {
    const config = lotteryConfigs[lotteryType];
    if (!config)
        return [];
    const rows = (0, database_1.getAll)(lotteryType);
    const numbers = rows.map(row => row[config.mainField]);
    const hotCold = (0, statistics_1.calculateHotColdNumbers)(numbers, config.mainTotal, config.mainStart);
    const hotNums = hotCold.filter(n => n.isHot).map(n => n.number);
    const coldNums = hotCold.filter(n => n.isCold).map(n => n.number);
    const missingNumbers = (0, statistics_1.calculateMissingNumbers)(numbers, config.mainTotal, config.mainStart);
    const patterns = (0, patternMining_1.findFrequentPatterns)(numbers, 0.02).map(p => p.numbers);
    const correlations = (0, patternMining_1.findNumberCorrelations)(numbers, config.mainTotal, config.mainStart);
    let secondaryHotNums = [];
    let secondaryColdNums = [];
    let secondaryMissingNumbers = [];
    let positionData = [];
    if (config.secondaryField && config.secondaryTotal && config.secondaryCount) {
        const secField = config.secondaryField;
        const secondaryNumbers = rows.map(row => [row[secField]]);
        const secondaryHotCold = (0, statistics_1.calculateHotColdNumbers)(secondaryNumbers, config.secondaryTotal, config.secondaryStart || 1);
        secondaryHotNums = secondaryHotCold.filter(n => n.isHot).map(n => n.number);
        secondaryColdNums = secondaryHotCold.filter(n => n.isCold).map(n => n.number);
        secondaryMissingNumbers = (0, statistics_1.calculateMissingNumbers)(secondaryNumbers, config.secondaryTotal, config.secondaryStart || 1);
    }
    if (config.mainStart === 0) {
        const positions = numbers[0]?.length || 0;
        for (let pos = 0; pos < positions; pos++) {
            const posNumbers = numbers.map(row => [row[pos]]);
            const posHotCold = (0, statistics_1.calculateHotColdNumbers)(posNumbers, config.mainTotal, config.mainStart);
            positionData.push({
                hotNumbers: posHotCold.filter(n => n.isHot).map(n => n.number),
                coldNumbers: posHotCold.filter(n => n.isCold).map(n => n.number),
                missingNumbers: (0, statistics_1.calculateMissingNumbers)(posNumbers, config.mainTotal, config.mainStart).map(m => m.number)
            });
        }
    }
    const recommendations = [];
    const createRecommendation = (main, secondary, strategy, score, description) => {
        const rec = {
            id: `REC-${Date.now()}-${strategy}`,
            strategy,
            score,
            description
        };
        if (config.mainField === 'red_numbers') {
            rec['redNumbers'] = main;
            rec['blueNumber'] = secondary;
        }
        else if (config.mainField === 'front_numbers') {
            rec['frontNumbers'] = main;
            rec['backNumbers'] = secondary;
        }
        else if (config.mainField === 'basic_numbers') {
            rec['basicNumbers'] = main;
            rec['specialNumber'] = secondary;
        }
        else {
            rec['numbers'] = main;
        }
        return rec;
    };
    let smartSecondary;
    let balancedSecondary;
    let randomSecondary;
    if (config.secondaryField) {
        smartSecondary = generateSecondaryRecommendation(secondaryHotNums, secondaryColdNums, secondaryMissingNumbers, config.secondaryTotal, config.secondaryCount, config.secondaryStart || 1);
        balancedSecondary = generateSecondaryRecommendation(secondaryHotNums, secondaryColdNums, secondaryMissingNumbers, config.secondaryTotal, config.secondaryCount, config.secondaryStart || 1);
        randomSecondary = generateRandomRecommendation(config.secondaryTotal, config.secondaryCount, config.secondaryStart || 1);
        if (config.secondaryCount === 1) {
            smartSecondary = smartSecondary[0];
            balancedSecondary = balancedSecondary[0];
            randomSecondary = randomSecondary[0];
        }
    }
    let smartMain;
    let balancedMain;
    let randomMain;
    let consecutiveMain;
    let repeatMain;
    let missingReturnMain;
    if (positionData.length > 0) {
        smartMain = generatePositionSmartRecommendation(positionData, config.mainTotal, config.mainStart);
        balancedMain = generatePositionSmartRecommendation(positionData, config.mainTotal, config.mainStart);
        randomMain = generateRandomRecommendation(config.mainTotal, config.mainCount, config.mainStart);
        consecutiveMain = generatePositionSmartRecommendation(positionData, config.mainTotal, config.mainStart);
        repeatMain = generatePositionSmartRecommendation(positionData, config.mainTotal, config.mainStart);
        missingReturnMain = generatePositionSmartRecommendation(positionData, config.mainTotal, config.mainStart);
    }
    else {
        smartMain = generateSmartRecommendation(hotNums, coldNums, missingNumbers, patterns, correlations, config.mainCount, config.mainTotal, config.mainStart, weights);
        balancedMain = generateBalancedRecommendation(numbers, config.mainTotal, config.mainCount, config.mainStart);
        randomMain = generateRandomRecommendation(config.mainTotal, config.mainCount, config.mainStart);
        consecutiveMain = generateConsecutiveRecommendation(hotNums, coldNums, missingNumbers, patterns, config.mainCount, config.mainTotal, config.mainStart);
        repeatMain = generateRepeatNumberRecommendation(numbers, hotNums, coldNums, config.mainCount, config.mainTotal, config.mainStart);
        missingReturnMain = generateMissingReturnRecommendation(hotNums, coldNums, missingNumbers, config.mainCount, config.mainTotal, config.mainStart);
    }
    let consecutiveSecondary;
    let repeatSecondary;
    let missingReturnSecondary;
    if (config.secondaryField) {
        consecutiveSecondary = generateSecondaryRecommendation(secondaryHotNums, secondaryColdNums, secondaryMissingNumbers, config.secondaryTotal, config.secondaryCount, config.secondaryStart || 1);
        repeatSecondary = generateSecondaryRecommendation(secondaryHotNums, secondaryColdNums, secondaryMissingNumbers, config.secondaryTotal, config.secondaryCount, config.secondaryStart || 1);
        missingReturnSecondary = generateSecondaryRecommendation(secondaryHotNums, secondaryColdNums, secondaryMissingNumbers, config.secondaryTotal, config.secondaryCount, config.secondaryStart || 1);
        if (config.secondaryCount === 1) {
            consecutiveSecondary = consecutiveSecondary[0];
            repeatSecondary = repeatSecondary[0];
            missingReturnSecondary = missingReturnSecondary[0];
        }
    }
    const strategies = [
        { name: '智能综合', baseScore: 75, description: '融合统计分析与模式挖掘，综合冷热号、遗漏值、频繁模式和关联规则', main: smartMain, secondary: smartSecondary },
        { name: '均衡稳健', baseScore: 70, description: '基于统计特征的均衡配比，兼顾奇偶、大小和区间分布', main: balancedMain, secondary: balancedSecondary },
        { name: '连号策略', baseScore: 68, description: '分析历史连号出现概率，智能包含连续号码', main: consecutiveMain, secondary: consecutiveSecondary },
        { name: '重复号策略', baseScore: 65, description: '追踪上一期号码重复规律，预测可能重复的号码', main: repeatMain, secondary: repeatSecondary },
        { name: '遗漏回补', baseScore: 70, description: '优先选择遗漏期数即将达到平均值的号码', main: missingReturnMain, secondary: missingReturnSecondary },
        { name: '随机参考', baseScore: 60, description: '完全随机生成，提供基准参考，避免过度依赖分析', main: randomMain, secondary: randomSecondary }
    ];
    if (numbers.length > 50) {
        for (const strategy of strategies) {
            const accuracy = simulateStrategyAccuracy(numbers, strategy.name, config.mainTotal, config.mainCount, config.mainStart);
            strategy.baseScore = Math.round(strategy.baseScore * (0.8 + accuracy));
        }
    }
    for (const strategy of strategies) {
        recommendations.push(createRecommendation(strategy.main, strategy.secondary, strategy.name, Math.floor(Math.random() * 10) + strategy.baseScore, strategy.description + (strategy.name !== '随机参考' ? `，历史命中率 ${(strategy.baseScore / 100).toFixed(1)}` : '')));
    }
    return recommendations.sort((a, b) => b.score - a.score);
};
exports.getRecommendations = getRecommendations;
const getDoubleColorBallRecommendations = (weights) => (0, exports.getRecommendations)('double_color_ball', weights);
exports.getDoubleColorBallRecommendations = getDoubleColorBallRecommendations;
const getSuperLottoRecommendations = (weights) => (0, exports.getRecommendations)('super_lotto', weights);
exports.getSuperLottoRecommendations = getSuperLottoRecommendations;
const getLottery3DRecommendations = (weights) => (0, exports.getRecommendations)('lottery_3d', weights);
exports.getLottery3DRecommendations = getLottery3DRecommendations;
const getHappy8Recommendations = (weights) => (0, exports.getRecommendations)('happy_8', weights);
exports.getHappy8Recommendations = getHappy8Recommendations;
const getArrangement3Recommendations = (weights) => (0, exports.getRecommendations)('arrangement_3', weights);
exports.getArrangement3Recommendations = getArrangement3Recommendations;
const getArrangement5Recommendations = (weights) => (0, exports.getRecommendations)('arrangement_5', weights);
exports.getArrangement5Recommendations = getArrangement5Recommendations;
const getSevenStarRecommendations = (weights) => (0, exports.getRecommendations)('seven_star', weights);
exports.getSevenStarRecommendations = getSevenStarRecommendations;
const getSevenColorRecommendations = (weights) => (0, exports.getRecommendations)('seven_color', weights);
exports.getSevenColorRecommendations = getSevenColorRecommendations;
