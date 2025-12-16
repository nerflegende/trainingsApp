import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// Get body measurements
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const measurements = db.prepare(`
      SELECT * FROM body_measurements 
      WHERE user_id = ? 
      ORDER BY date DESC
    `).all(req.userId) as {
      id: string;
      user_id: string;
      date: string;
      weight: number | null;
      height: number | null;
    }[];

    res.json(measurements.map(m => ({
      id: m.id,
      userId: m.user_id,
      date: m.date,
      weight: m.weight,
      height: m.height
    })));
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Messungen' });
  }
});

// Add measurement
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { weight, height } = req.body;

    if (weight === undefined && height === undefined) {
      res.status(400).json({ error: 'Gewicht oder Größe erforderlich' });
      return;
    }

    const measurementId = uuidv4();
    const date = new Date().toISOString();

    db.prepare(`
      INSERT INTO body_measurements (id, user_id, date, weight, height)
      VALUES (?, ?, ?, ?, ?)
    `).run(measurementId, req.userId, date, weight || null, height || null);

    res.status(201).json({
      id: measurementId,
      userId: req.userId,
      date,
      weight,
      height
    });
  } catch (error) {
    console.error('Add measurement error:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Messung' });
  }
});

export default router;
