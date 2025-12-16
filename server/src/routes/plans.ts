import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// Get all plans for user
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const plans = db.prepare(`
      SELECT * FROM workout_plans 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.userId) as {
      id: string;
      user_id: string;
      name: string;
      description: string | null;
      days: string;
      is_template: number;
      created_at: string;
    }[];

    res.json(plans.map(plan => ({
      id: plan.id,
      userId: plan.user_id,
      name: plan.name,
      description: plan.description,
      days: JSON.parse(plan.days),
      isTemplate: plan.is_template === 1,
      createdAt: plan.created_at
    })));
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Pläne' });
  }
});

// Create plan
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { name, description, days, isTemplate } = req.body;

    if (!name || !days) {
      res.status(400).json({ error: 'Name und Tage sind erforderlich' });
      return;
    }

    const planId = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO workout_plans (id, user_id, name, description, days, is_template, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(planId, req.userId, name, description || null, JSON.stringify(days), isTemplate ? 1 : 0, createdAt);

    res.status(201).json({
      id: planId,
      userId: req.userId,
      name,
      description,
      days,
      isTemplate: isTemplate || false,
      createdAt
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Plans' });
  }
});

// Delete plan
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM workout_plans WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Plan nicht gefunden' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Plans' });
  }
});

export default router;
