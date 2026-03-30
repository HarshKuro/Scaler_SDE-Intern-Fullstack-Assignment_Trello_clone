/**
 * Database module — Neon PostgreSQL via pg.
 *
 * Exports:
 *   db       – chained query builder for simple CRUD
 *   query    – raw SQL returning rows array
 *   queryOne – raw SQL returning first row or null
 */
export { db, query, queryOne } from './neon';

