"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
}));
app.get('/api/ads', (req, res) => {
    const placementId = String(req.query.placementId || 'default');
    res.json({
        placementId,
        creative: 'Advertise with Wælio — fast, independent ads.',
        url: 'https://waelio.com',
        image: 'https://via.placeholder.com/600x300.png?text=W%C3%A6lio+Ad'
    });
});
app.post('/api/impression', (req, res) => {
    console.log('Impression received:', req.body);
    res.json({ ok: true });
});
app.post('/api/click', (req, res) => {
    console.log('Click received:', req.body);
    res.json({ ok: true });
});
app.get('/health', (_req, res) => {
    res.send('ok');
});
app.listen(port, () => {
    console.log(`Wælio API listening at http://localhost:${port}`);
});
