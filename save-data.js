import { knex } from 'db/knex-database-connection.js';

export async function saveData({ data }) {
  return knex.batchInsert('transitions', data, 1000);
}
