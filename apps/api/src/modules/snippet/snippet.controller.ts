import { Router, Request, Response } from 'express';
import prisma from '@codera/db';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// All snippet routes require authentication
router.use(requireAuth);

/**
 * GET /api/snippets
 * Return all snippets for the authenticated user.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const snippets = await prisma.snippet.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(snippets);
  } catch (err) {
    console.error('[SnippetController] Error listing snippets:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/snippets
 * Create a new snippet for the authenticated user.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, code, language, tags } = req.body;
    if (!title || !code) {
      return res.status(400).json({ error: 'title and code are required' });
    }
    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language: language ?? 'cpp',
        tags: tags ?? [],
        userId: req.userId!,
      },
    });
    return res.status(201).json(snippet);
  } catch (err) {
    console.error('[SnippetController] Error creating snippet:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/snippets/:id
 * Update an existing snippet (only if owned by user).
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, code, language, tags } = req.body;
    const existing = await prisma.snippet.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    const updated = await prisma.snippet.update({
      where: { id: req.params.id },
      data: {
        title: title ?? existing.title,
        code: code ?? existing.code,
        language: language ?? existing.language,
        tags: tags ?? existing.tags,
      },
    });
    return res.json(updated);
  } catch (err) {
    console.error('[SnippetController] Error updating snippet:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/snippets/:id
 * Delete a snippet (only if owned by user).
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.snippet.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    await prisma.snippet.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[SnippetController] Error deleting snippet:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

