import db from './db';

export type ResourceStatus = 'draft' | 'published' | 'archived';

export interface Resource {
  id: number;
  title: string;
  description: string;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateResourceInput {
  title: string;
  description?: string;
  status?: ResourceStatus;
}

export interface UpdateResourceInput {
  title?: string;
  description?: string;
  status?: ResourceStatus;
}

export interface ListFilters {
  status?: ResourceStatus;
  q?: string;
  limit?: number;
  offset?: number;
}

const insertStmt = db.prepare(`
  INSERT INTO resources (title, description, status)
  VALUES (@title, @description, @status)
`);

const getByIdStmt = db.prepare(`SELECT * FROM resources WHERE id = ?`);

const updateStmt = db.prepare(`
  UPDATE resources
  SET
    title = COALESCE(@title, title),
    description = COALESCE(@description, description),
    status = COALESCE(@status, status),
    updated_at = datetime('now')
  WHERE id = @id
`);

const deleteStmt = db.prepare(`DELETE FROM resources WHERE id = ?`);

export const resourceRepository = {
  create(input: CreateResourceInput): Resource {
    const info = insertStmt.run({
      title: input.title,
      description: input.description ?? '',
      status: input.status ?? 'draft',
    });

    return getByIdStmt.get(info.lastInsertRowid) as Resource;
  },

  list(filters: ListFilters): Resource[] {
    const clauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.status) {
      clauses.push('status = @status');
      params.status = filters.status;
    }

    if (filters.q) {
      clauses.push('(title LIKE @search OR description LIKE @search)');
      params.search = `%${filters.q}%`;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const limit = Number.isFinite(filters.limit) ? Math.min(filters.limit!, 100) : 20;
    const offset = Number.isFinite(filters.offset) ? Math.max(filters.offset!, 0) : 0;

    const stmt = db.prepare(`
      SELECT * FROM resources
      ${where}
      ORDER BY created_at DESC
      LIMIT @limit OFFSET @offset
    `);

    return stmt.all({
      ...params,
      limit,
      offset,
    }) as Resource[];
  },

  findById(id: number): Resource | undefined {
    return getByIdStmt.get(id) as Resource | undefined;
  },

  update(id: number, input: UpdateResourceInput): Resource | undefined {
    const result = updateStmt.run({ id, ...input });
    if (!result.changes) {
      return undefined;
    }

    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = deleteStmt.run(id);
    return result.changes > 0;
  },
};

