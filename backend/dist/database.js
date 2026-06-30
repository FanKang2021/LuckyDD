"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatest = exports.getAll = exports.count = exports.query = exports.insertOrReplace = exports.initDatabase = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, 'data');
const DB_FILE = path_1.default.join(DATA_DIR, 'database.json');
let db = {
    double_color_ball: [],
    super_lotto: [],
    lottery_3d: [],
    happy_8: [],
    arrangement_3: [],
    arrangement_5: [],
    seven_star: [],
    seven_color: [],
    crawler_log: []
};
const initDatabase = () => {
    if (!fs_1.default.existsSync(DATA_DIR)) {
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs_1.default.existsSync(DB_FILE)) {
        try {
            const content = fs_1.default.readFileSync(DB_FILE, 'utf-8');
            const existing = JSON.parse(content);
            db = { ...db, ...existing };
        }
        catch {
            db = {
                double_color_ball: [],
                super_lotto: [],
                lottery_3d: [],
                happy_8: [],
                arrangement_3: [],
                arrangement_5: [],
                seven_star: [],
                seven_color: [],
                crawler_log: []
            };
        }
    }
};
exports.initDatabase = initDatabase;
const saveDatabase = () => {
    fs_1.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};
const insertOrReplace = (table, data) => {
    const tableData = db[table];
    const idField = table === 'crawler_log' ? 'id' : 'id';
    const index = tableData.findIndex(item => item[idField] === data[idField]);
    if (index >= 0) {
        tableData[index] = { ...tableData[index], ...data };
    }
    else {
        tableData.push(data);
    }
    saveDatabase();
};
exports.insertOrReplace = insertOrReplace;
const query = (table, options) => {
    let result = [...db[table]];
    if (options?.orderBy) {
        const field = options.orderBy;
        result.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            if (options.order === 'DESC') {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        });
    }
    if (options?.offset !== undefined) {
        result = result.slice(options.offset);
    }
    if (options?.limit !== undefined) {
        result = result.slice(0, options.limit);
    }
    return result;
};
exports.query = query;
const count = (table) => {
    return db[table].length;
};
exports.count = count;
const getAll = (table) => {
    return [...db[table]];
};
exports.getAll = getAll;
const getLatest = (table) => {
    const result = (0, exports.query)(table, { limit: 1, orderBy: 'date', order: 'DESC' });
    return result.length > 0 ? result[0] : null;
};
exports.getLatest = getLatest;
