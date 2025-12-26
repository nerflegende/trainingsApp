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
