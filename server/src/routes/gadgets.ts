import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

interface GadgetRow {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

// Get all custom gadgets (available to all users)
router.get('/', authMiddleware, (_req: AuthRequest, res: Response) => {
  try {
    const gadgets = db.prepare('SELECT * FROM custom_gadgets ORDER BY created_at DESC').all() as GadgetRow[];

    res.json(gadgets.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description || '',
      isCustom: true,
      userId: g.created_by
    })));
  } catch (error) {
    console.error('Get gadgets error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Gadgets' });
  }
});

// Create a custom gadget
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name ist erforderlich' });
      return;
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO custom_gadgets (id, name, description, created_by, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, description || '', req.userId, createdAt);

    res.status(201).json({
      id,
      name,
      description: description || '',
      isCustom: true,
      userId: req.userId
    });
  } catch (error) {
    console.error('Create gadget error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Gadgets' });
  }
});

// Delete a custom gadget (only by creator)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user owns this gadget
    const gadget = db.prepare('SELECT created_by FROM custom_gadgets WHERE id = ?').get(id) as { created_by: string } | undefined;

    if (!gadget) {
      res.status(404).json({ error: 'Gadget nicht gefunden' });
      return;
    }

    if (gadget.created_by !== req.userId) {
      res.status(403).json({ error: 'Keine Berechtigung zum Löschen dieses Gadgets' });
      return;
    }

    db.prepare('DELETE FROM custom_gadgets WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete gadget error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Gadgets' });
  }
});

export default router;
