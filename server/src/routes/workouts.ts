import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// Get workout history
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const workouts = db.prepare(`
      SELECT * FROM workout_history 
      WHERE user_id = ? 
      ORDER BY date DESC
    `).all(req.userId) as {
      id: string;
      user_id: string;
      date: string;
      plan_name: string | null;
      day_name: string | null;
      exercises: string;
      duration: number;
    }[];

    res.json(workouts.map(workout => ({
      id: workout.id,
      userId: workout.user_id,
      date: workout.date,
      planName: workout.plan_name,
      dayName: workout.day_name,
      exercises: JSON.parse(workout.exercises),
      duration: workout.duration
    })));
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Workouts' });
  }
});

// Save workout
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { date, planName, dayName, exercises, duration } = req.body;

    if (!exercises || duration === undefined) {
      res.status(400).json({ error: 'Übungen und Dauer sind erforderlich' });
      return;
    }

    const workoutId = uuidv4();

    db.prepare(`
      INSERT INTO workout_history (id, user_id, date, plan_name, day_name, exercises, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(workoutId, req.userId, date || new Date().toISOString(), planName || null, dayName || null, JSON.stringify(exercises), duration);

    res.status(201).json({
      id: workoutId,
      userId: req.userId,
      date: date || new Date().toISOString(),
      planName,
      dayName,
      exercises,
      duration
    });
  } catch (error) {
    console.error('Save workout error:', error);
    res.status(500).json({ error: 'Fehler beim Speichern des Workouts' });
  }
});

export default router;
