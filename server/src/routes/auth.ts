import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { generateToken, authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, username, bodyWeight, bodyHeight, weeklyGoal, darkMode } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      res.status(400).json({ error: 'E-Mail, Passwort und Nutzername sind erforderlich' });
      return;
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      res.status(400).json({ error: 'E-Mail oder Nutzername bereits vergeben' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, body_weight, body_height, weekly_goal, dark_mode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, email, passwordHash, bodyWeight || null, bodyHeight || null, weeklyGoal || 3, darkMode ? 1 : 0, createdAt);

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      token,
      user: {
        id: userId,
        username,
        email,
        bodyWeight,
        bodyHeight,
        weeklyGoal: weeklyGoal || 3,
        darkMode: darkMode ?? true,
        createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registrierung fehlgeschlagen' });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich' });
      return;
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as {
      id: string;
      username: string;
      email: string;
      password_hash: string;
      body_weight: number | null;
      body_height: number | null;
      weekly_goal: number;
      dark_mode: number;
      created_at: string;
    } | undefined;

    if (!user) {
      res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Ungültige Anmeldedaten' });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bodyWeight: user.body_weight,
        bodyHeight: user.body_height,
        weeklyGoal: user.weekly_goal,
        darkMode: user.dark_mode === 1,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Anmeldung fehlgeschlagen' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as {
      id: string;
      username: string;
      email: string;
      body_weight: number | null;
      body_height: number | null;
      weekly_goal: number;
      dark_mode: number;
      created_at: string;
    } | undefined;

    if (!user) {
      res.status(404).json({ error: 'Benutzer nicht gefunden' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bodyWeight: user.body_weight,
      bodyHeight: user.body_height,
      weeklyGoal: user.weekly_goal,
      darkMode: user.dark_mode === 1,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Fehler beim Laden des Benutzers' });
  }
});

// Update user
router.patch('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (req.body.bodyWeight !== undefined) {
      updates.push('body_weight = ?');
      values.push(req.body.bodyWeight);
    }
    if (req.body.bodyHeight !== undefined) {
      updates.push('body_height = ?');
      values.push(req.body.bodyHeight);
    }
    if (req.body.weeklyGoal !== undefined) {
      updates.push('weekly_goal = ?');
      values.push(req.body.weeklyGoal);
    }
    if (req.body.darkMode !== undefined) {
      updates.push('dark_mode = ?');
      values.push(req.body.darkMode ? 1 : 0);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'Keine Änderungen angegeben' });
      return;
    }

    values.push(req.userId!);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

export default router;
