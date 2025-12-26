import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

interface ExerciseRow {
  id: string;
  name: string;
  description: string | null;
  muscles: string;
  gadgets: string | null;
  created_by: string | null;
  created_at: string;
}

// Get all custom exercises (available to all users)
router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  try {
    const exercises = db.prepare('SELECT * FROM custom_exercises ORDER BY created_at DESC').all() as ExerciseRow[];

    res.json(exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      description: ex.description || '',
      muscles: JSON.parse(ex.muscles),
      gadgets: ex.gadgets ? JSON.parse(ex.gadgets) : [],
      isCustom: true,
      userId: ex.created_by
    })));
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Übungen' });
  }
});

// Get exercise history (performance over time for a specific exercise)
router.get('/:id/history', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const exerciseName = req.query.name as string;

    // Get all workouts and filter for the exercise
    const workouts = db.prepare(`
      SELECT exercises, date FROM workout_history 
      WHERE user_id = ? 
      ORDER BY date DESC
      LIMIT 50
    `).all(req.userId) as { exercises: string; date: string }[];

    const history: { date: string; sets: { reps: number; weight?: number }[] }[] = [];

    for (const workout of workouts) {
      const exercises = JSON.parse(workout.exercises);
      const matchingExercise = exercises.find((ex: { exerciseId: string; exerciseName: string }) => 
        ex.exerciseId === id || ex.exerciseName === exerciseName
      );
      
      if (matchingExercise) {
        history.push({
          date: workout.date,
          sets: matchingExercise.sets.filter((s: { completed: boolean }) => s.completed).map((s: { reps: number; weight?: number }) => ({
            reps: s.reps,
            weight: s.weight
          }))
        });
      }
    }

    res.json(history);
  } catch (error) {
    console.error('Get exercise history error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Historie' });
  }
});

// Create a custom exercise
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { name, description, muscles, gadgets } = req.body;

    if (!name || !muscles || !Array.isArray(muscles)) {
      res.status(400).json({ error: 'Name und Muskeln sind erforderlich' });
      return;
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO custom_exercises (id, name, description, muscles, gadgets, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description || '', JSON.stringify(muscles), gadgets ? JSON.stringify(gadgets) : null, req.userId, createdAt);

    res.status(201).json({
      id,
      name,
      description: description || '',
      muscles,
      gadgets: gadgets || [],
      isCustom: true,
      userId: req.userId
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Übung' });
  }
});

// Update a custom exercise (only by creator)
router.patch('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, muscles, gadgets } = req.body;

    // Check if user owns this exercise
    const exercise = db.prepare('SELECT created_by FROM custom_exercises WHERE id = ?').get(id) as { created_by: string } | undefined;

    if (!exercise) {
      res.status(404).json({ error: 'Übung nicht gefunden' });
      return;
    }

    if (exercise.created_by !== req.userId) {
      res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten dieser Übung' });
      return;
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (muscles !== undefined) {
      updates.push('muscles = ?');
      values.push(JSON.stringify(muscles));
    }
    if (gadgets !== undefined) {
      updates.push('gadgets = ?');
      values.push(gadgets ? JSON.stringify(gadgets) : null);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'Keine Änderungen angegeben' });
      return;
    }

    values.push(id);
    db.prepare(`UPDATE custom_exercises SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    res.json({ success: true });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Übung' });
  }
});

// Delete a custom exercise (only by creator)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user owns this exercise
    const exercise = db.prepare('SELECT created_by FROM custom_exercises WHERE id = ?').get(id) as { created_by: string } | undefined;

    if (!exercise) {
      res.status(404).json({ error: 'Übung nicht gefunden' });
      return;
    }

    if (exercise.created_by !== req.userId) {
      res.status(403).json({ error: 'Keine Berechtigung zum Löschen dieser Übung' });
      return;
    }

    db.prepare('DELETE FROM custom_exercises WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Übung' });
  }
});

export default router;
