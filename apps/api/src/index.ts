import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(express.json());
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST']
    })
);

app.get('/api/ads', (req: Request, res: Response) => {
    const placementId = String(req.query.placementId || 'default');
    res.json({
        placementId,
        creative: 'Advertise with Wælio — fast, independent ads.',
        url: 'https://waelio.com',
        image: 'https://via.placeholder.com/600x300.png?text=W%C3%A6lio+Ad'
    });
});

app.post('/api/impression', (req: Request, res: Response) => {
    console.log('Impression received:', req.body);
    res.json({ ok: true });
});

app.post('/api/click', (req: Request, res: Response) => {
    console.log('Click received:', req.body);
    res.json({ ok: true });
});

app.get('/health', (_req: Request, res: Response) => {
    res.send('ok');
});

app.listen(port, () => {
    console.log(`Wælio API listening at http://localhost:${port}`);
});
