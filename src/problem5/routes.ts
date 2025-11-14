import { Router } from 'express';
import { z } from 'zod';
import { CreateResourceInput, resourceRepository, UpdateResourceInput } from './repository';

const resourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

const updateResourceSchema = resourceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Phải có ít nhất một trường để cập nhật',
  });

const listSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  q: z.string().optional(),
  limit: z
    .string()
    .transform((value) => Number(value))
    .optional()
    .refine((value) => value === undefined || (Number.isInteger(value) && value > 0), {
      message: 'limit phải là số nguyên dương',
    }),
  offset: z
    .string()
    .transform((value) => Number(value))
    .optional()
    .refine((value) => value === undefined || (Number.isInteger(value) && value >= 0), {
      message: 'offset phải là số nguyên không âm',
    }),
});

const router = Router();

router.post('/', (req, res, next) => {
  try {
    const payload = resourceSchema.parse(req.body) as CreateResourceInput;
    const resource = resourceRepository.create(payload);
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
});

router.get('/', (req, res, next) => {
  try {
    const query = listSchema.parse(req.query);
    const resources = resourceRepository.list(query);
    res.json({
      data: resources,
      meta: {
        count: resources.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'id phải là số nguyên' });
  }

  const resource = resourceRepository.findById(id);
  if (!resource) {
    return res.status(404).json({ message: 'Không tìm thấy resource' });
  }

  return res.json(resource);
});

router.put('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'id phải là số nguyên' });
  }

  try {
    const parsed = updateResourceSchema.parse(req.body) as UpdateResourceInput;
    const updated = resourceRepository.update(id, parsed);

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy resource' });
    }

    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'id phải là số nguyên' });
  }

  const deleted = resourceRepository.delete(id);

  if (!deleted) {
    return res.status(404).json({ message: 'Không tìm thấy resource' });
  }

  return res.status(204).send();
});

export default router;

