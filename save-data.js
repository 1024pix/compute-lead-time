import chunk from 'lodash/chunk.js';
import { knex } from './db/knex-database-connection.js';

export async function saveData({ data }) {
  const chunks = chunk(data, 1000);

  const trx = await knex.transaction();
  for (const chunk of chunks)
    await trx('transitions').insert(chunk).onConflict(['issueId', 'source', 'destination', 'timestamp']).ignore();

  await trx.commit();
}
