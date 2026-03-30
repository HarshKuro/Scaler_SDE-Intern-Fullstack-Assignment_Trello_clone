import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

// Pool is created lazily — only when DATABASE_PROVIDER=neon
let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    if (!DATABASE_URL) {
      throw new Error('Missing DATABASE_URL environment variable for Neon');
    }
    _pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return _pool;
}

/* ────────────────────────────────────────────────────
 * Supabase-compatible query builder backed by pg
 *
 * Supports the chained API used throughout the codebase:
 *   db.from('table').select('*').eq('id', val).single()
 *   db.from('table').insert({...}).select().single()
 *   db.from('table').update({...}).eq('id', val).select().single()
 *   db.from('table').delete().eq('id', val)
 *   db.from('table').select('*').ilike('col', '%q%').limit(20)
 *   db.from('table').select('*').order('col', { ascending: false })
 *   db.from('table').select('*').neq('col', val)
 *   db.from('table').select('*').eq('col', val).order('col').limit(n)
 * ──────────────────────────────────────────────────── */

type FilterOp = { col: string; op: string; val: unknown };
type OrderSpec = { col: string; ascending: boolean; ref?: string };

interface QueryResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  error: { message: string; details?: unknown } | null;
}

class QueryBuilder {
  private table: string;
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private selectCols = '*';
  private filters: FilterOp[] = [];
  private orders: OrderSpec[] = [];
  private limitVal: number | null = null;
  private isSingle = false;
  private insertData: Record<string, unknown> | Record<string, unknown>[] | null = null;
  private updateData: Record<string, unknown> | null = null;
  private returnData = false;

  constructor(table: string) {
    this.table = table;
  }

  select(cols?: string): this {
    if (this.operation === 'insert' || this.operation === 'update' || this.operation === 'delete') {
      this.returnData = true;
      if (cols && cols !== '*') this.selectCols = cols;
      return this;
    }
    this.operation = 'select';
    if (cols) this.selectCols = cols;
    return this;
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]): this {
    this.operation = 'insert';
    this.insertData = data;
    return this;
  }

  update(data: Record<string, unknown>): this {
    this.operation = 'update';
    this.updateData = data;
    return this;
  }

  delete(): this {
    this.operation = 'delete';
    return this;
  }

  eq(col: string, val: unknown): this {
    this.filters.push({ col, op: '=', val });
    return this;
  }

  neq(col: string, val: unknown): this {
    this.filters.push({ col, op: '!=', val });
    return this;
  }

  ilike(col: string, val: string): this {
    this.filters.push({ col, op: 'ILIKE', val });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean; referencedTable?: string }): this {
    this.orders.push({
      col,
      ascending: opts?.ascending ?? true,
      ref: opts?.referencedTable,
    });
    return this;
  }

  limit(n: number): this {
    this.limitVal = n;
    return this;
  }

  single(): this {
    this.isSingle = true;
    this.limitVal = 1;
    return this;
  }

  private buildWhere(paramOffset = 0): { clause: string; values: unknown[] } {
    if (this.filters.length === 0) return { clause: '', values: [] };
    const parts: string[] = [];
    const values: unknown[] = [];
    this.filters.forEach((f, i) => {
      parts.push(`"${f.col}" ${f.op} $${paramOffset + i + 1}`);
      values.push(f.val);
    });
    return { clause: `WHERE ${parts.join(' AND ')}`, values };
  }

  private buildOrderBy(): string {
    const mainOrders = this.orders.filter((o) => !o.ref);
    if (mainOrders.length === 0) return '';
    return `ORDER BY ${mainOrders.map((o) => `"${o.col}" ${o.ascending ? 'ASC' : 'DESC'}`).join(', ')}`;
  }

  async execute(): Promise<QueryResult> {
    try {
      switch (this.operation) {
        case 'select': {
          const { clause, values } = this.buildWhere();
          const orderBy = this.buildOrderBy();
          const limitStr = this.limitVal ? `LIMIT ${this.limitVal}` : '';
          const sql = `SELECT * FROM "${this.table}" ${clause} ${orderBy} ${limitStr}`;
          const result = await getPool().query(sql, values);
          if (this.isSingle) {
            return { data: result.rows[0] || null, error: null };
          }
          return { data: result.rows, error: null };
        }

        case 'insert': {
          const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData!];
          if (rows.length === 0) return { data: [], error: null };

          const cols = Object.keys(rows[0]);
          const allValues: unknown[] = [];
          const valuePlaceholders: string[] = [];

          rows.forEach((row, rowIdx) => {
            const placeholders = cols.map((_, colIdx) => `$${rowIdx * cols.length + colIdx + 1}`);
            valuePlaceholders.push(`(${placeholders.join(', ')})`);
            cols.forEach((c) => allValues.push(row[c] ?? null));
          });

          const returning = this.returnData ? 'RETURNING *' : 'RETURNING *';
          const sql = `INSERT INTO "${this.table}" (${cols.map((c) => `"${c}"`).join(', ')}) VALUES ${valuePlaceholders.join(', ')} ${returning}`;
          const result = await getPool().query(sql, allValues);

          if (this.isSingle) {
            return { data: result.rows[0] || null, error: null };
          }
          return { data: result.rows, error: null };
        }

        case 'update': {
          const setCols = Object.keys(this.updateData!);
          const setValues = setCols.map((c) => this.updateData![c]);
          const setClause = setCols.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
          const { clause, values: whereValues } = this.buildWhere(setCols.length);
          const returning = this.returnData ? 'RETURNING *' : '';
          const sql = `UPDATE "${this.table}" SET ${setClause} ${clause} ${returning}`;
          const result = await getPool().query(sql, [...setValues, ...whereValues]);

          if (this.returnData) {
            if (this.isSingle) {
              return { data: result.rows[0] || null, error: null };
            }
            return { data: result.rows, error: null };
          }
          return { data: null, error: null };
        }

        case 'delete': {
          const { clause, values } = this.buildWhere();
          const sql = `DELETE FROM "${this.table}" ${clause}`;
          await getPool().query(sql, values);
          return { data: null, error: null };
        }

        default:
          return { data: null, error: { message: `Unknown operation: ${this.operation}` } };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database query failed';
      return { data: null, error: { message, details: err } };
    }
  }

  // Make it thenable so `await db.from(...).select(...)` works
  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

/* ── Raw SQL helpers for complex joins ── */

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await getPool().query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T | null> {
  const result = await getPool().query(sql, params);
  return (result.rows[0] as T) || null;
}

/* ── Public API matching supabase-style chained builder ── */
export const db = {
  from(table: string) {
    return new QueryBuilder(table);
  },
};
