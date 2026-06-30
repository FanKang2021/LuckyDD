"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lotteryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const database_1 = require("../database");
const router = express_1.default.Router();
const createRoute = (table) => {
    return (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const rows = (0, database_1.query)(table, { limit, offset, orderBy: 'date', order: 'DESC' });
        const total = (0, database_1.count)(table);
        res.json({
            data: rows,
            total,
            page,
            limit
        });
    };
};
router.get('/double-color-ball', createRoute('double_color_ball'));
router.get('/super-lotto', createRoute('super_lotto'));
router.get('/lottery-3d', createRoute('lottery_3d'));
router.get('/happy-8', createRoute('happy_8'));
router.get('/arrangement-3', createRoute('arrangement_3'));
router.get('/arrangement-5', createRoute('arrangement_5'));
router.get('/seven-star', createRoute('seven_star'));
router.get('/seven-color', createRoute('seven_color'));
router.get('/latest/:type', (req, res) => {
    const type = req.params.type;
    const tableMap = {
        'double-color-ball': 'double_color_ball',
        'super-lotto': 'super_lotto',
        'lottery-3d': 'lottery_3d',
        'happy-8': 'happy_8',
        'arrangement-3': 'arrangement_3',
        'arrangement-5': 'arrangement_5',
        'seven-star': 'seven_star',
        'seven-color': 'seven_color'
    };
    const table = tableMap[type];
    if (!table) {
        res.status(400).json({ error: 'Invalid lottery type' });
        return;
    }
    const row = (0, database_1.getLatest)(table);
    if (!row) {
        res.status(404).json({ error: 'No data found' });
        return;
    }
    res.json(row);
});
exports.lotteryRoutes = router;
