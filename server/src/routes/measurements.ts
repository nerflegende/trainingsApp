import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

interface MeasurementRow {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  height: number | null;
  body_fat: number | null;
  chest: number | null;
  arms: number | null;
  waist: number | null;
  legs: number | null;
}

// Get body measurements
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const measurements = db.prepare(`
      SELECT * FROM body_measurements 
      WHERE user_id = ? 
      ORDER BY date DESC
    `).all(req.userId) as MeasurementRow[];

    res.json(measurements.map(m => ({
      id: m.id,
      userId: m.user_id,
      date: m.date,
      weight: m.weight,
      height: m.height,
      bodyFat: m.body_fat,
      chest: m.chest,
      arms: m.arms,
      waist: m.waist,
      legs: m.legs
    })));
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Messungen' });
  }
});

// Add measurement
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { weight, height, bodyFat, chest, arms, waist, legs } = req.body;

    if (weight === undefined && height === undefined && bodyFat === undefined && 
        chest === undefined && arms === undefined && waist === undefined && legs === undefined) {
      res.status(400).json({ error: 'Mindestens ein Wert erforderlich' });
      return;
    }

    const measurementId = uuidv4();
    const date = new Date().toISOString();

    db.prepare(`
      INSERT INTO body_measurements (id, user_id, date, weight, height, body_fat, chest, arms, waist, legs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(measurementId, req.userId, date, weight || null, height || null, bodyFat || null, chest || null, arms || null, waist || null, legs || null);

    res.status(201).json({
      id: measurementId,
      userId: req.userId,
      date,
      weight,
      height,
      bodyFat,
      chest,
      arms,
      waist,
      legs
    });
  } catch (error) {
    console.error('Add measurement error:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Messung' });
  }
});

export default router;
