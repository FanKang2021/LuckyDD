"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeData = exports.validateDatabase = exports.validateLotteryData = void 0;
const fs = __importStar(require("fs"));
const validateLotteryData = (lotteryType, data) => {
    const errors = [];
    if (!data) {
        errors.push('数据为空');
        return { valid: false, errors };
    }
    const lotteryConfigs = {
        double_color_ball: { mainField: 'red_numbers', mainCount: 6, mainTotal: 33, mainStart: 1, secondaryField: 'blue_number', secondaryCount: 1, secondaryTotal: 16 },
        super_lotto: { mainField: 'front_numbers', mainCount: 5, mainTotal: 35, mainStart: 1, secondaryField: 'back_numbers', secondaryCount: 2, secondaryTotal: 12 },
        lottery_3d: { mainField: 'numbers', mainCount: 3, mainTotal: 10, mainStart: 0 },
        happy_8: { mainField: 'numbers', mainCount: 20, mainTotal: 80, mainStart: 1 },
        arrangement_3: { mainField: 'numbers', mainCount: 3, mainTotal: 10, mainStart: 0 },
        arrangement_5: { mainField: 'numbers', mainCount: 5, mainTotal: 10, mainStart: 0 },
        seven_star: { mainField: 'numbers', mainCount: 7, mainTotal: 10, mainStart: 0 },
        seven_color: { mainField: 'basic_numbers', mainCount: 7, mainTotal: 30, mainStart: 1, secondaryField: 'special_number', secondaryCount: 1, secondaryTotal: 30 }
    };
    const config = lotteryConfigs[lotteryType];
    if (!config) {
        errors.push(`未知的彩票类型: ${lotteryType}`);
        return { valid: false, errors };
    }
    if (!Array.isArray(data)) {
        if (!data[config.mainField]) {
            errors.push(`缺少主号码字段: ${config.mainField}`);
        }
        else {
            const mainNumbers = data[config.mainField];
            if (!Array.isArray(mainNumbers) || mainNumbers.length !== config.mainCount) {
                errors.push(`主号码数量不正确，应为 ${config.mainCount} 个`);
            }
            for (const num of mainNumbers) {
                if (typeof num !== 'number' || num < config.mainStart || num >= config.mainStart + config.mainTotal) {
                    errors.push(`主号码 ${num} 超出范围 [${config.mainStart}, ${config.mainStart + config.mainTotal - 1}]`);
                }
            }
        }
        if (config.secondaryField) {
            if (!data[config.secondaryField]) {
                errors.push(`缺少次号码字段: ${config.secondaryField}`);
            }
            else {
                const secondaryNumbers = Array.isArray(data[config.secondaryField]) ? data[config.secondaryField] : [data[config.secondaryField]];
                if (config.secondaryCount && secondaryNumbers.length !== config.secondaryCount) {
                    errors.push(`次号码数量不正确，应为 ${config.secondaryCount} 个`);
                }
                for (const num of secondaryNumbers) {
                    if (config.secondaryTotal && (typeof num !== 'number' || num < 1 || num > config.secondaryTotal)) {
                        errors.push(`次号码 ${num} 超出范围 [1, ${config.secondaryTotal}]`);
                    }
                }
            }
        }
    }
    return { valid: errors.length === 0, errors };
};
exports.validateLotteryData = validateLotteryData;
const validateDatabase = (databasePath) => {
    const errors = [];
    const warnings = [];
    if (!fs.existsSync(databasePath)) {
        errors.push(`数据库文件不存在: ${databasePath}`);
        return { valid: false, errors, warnings };
    }
    try {
        const content = fs.readFileSync(databasePath, 'utf-8');
        const data = JSON.parse(content);
        if (!data || typeof data !== 'object') {
            errors.push('数据库格式错误：不是有效的对象');
            return { valid: false, errors, warnings };
        }
        for (const [lotteryType, lotteryData] of Object.entries(data)) {
            if (!Array.isArray(lotteryData)) {
                errors.push(`${lotteryType} 数据不是数组`);
                continue;
            }
            if (lotteryData.length === 0) {
                warnings.push(`${lotteryType} 数据为空`);
            }
            if (lotteryData.length > 0) {
                const lastDraw = lotteryData[lotteryData.length - 1];
                const validation = (0, exports.validateLotteryData)(lotteryType, lastDraw);
                if (!validation.valid) {
                    errors.push(`${lotteryType} 最新数据无效: ${validation.errors.join(', ')}`);
                }
            }
        }
    }
    catch (error) {
        errors.push(`解析数据库失败: ${error}`);
    }
    return { valid: errors.length === 0, errors, warnings };
};
exports.validateDatabase = validateDatabase;
const sanitizeData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) {
            continue;
        }
        if (typeof value === 'string') {
            result[key] = value.trim();
        }
        else if (Array.isArray(value)) {
            result[key] = value.map(exports.sanitizeData).filter(v => v !== null && v !== undefined);
        }
        else if (typeof value === 'object') {
            result[key] = (0, exports.sanitizeData)(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
};
exports.sanitizeData = sanitizeData;
