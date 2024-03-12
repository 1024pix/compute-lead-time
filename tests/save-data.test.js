import { afterEach, describe, expect, it } from 'vitest';
import { knex } from '../db/knex-database-connection.js';
import { saveData } from '../save-data.js';

describe('save data', () => {
  afterEach(async () => {
    await knex('transitions').delete();
  });

  it('persists transitions in database', async () => {
    const transitions = [
      {
        issueId: 'issue #1',
        timestamp: '2024-03-12T12:00:00',
        source: 'Backlog',
        destination: 'Ready for Dev',
      },
    ];

    await saveData({ data: transitions });

    const [{ count }] = await knex('transitions').count();
    expect(count).to.equal(1);
  });

  it('should not persist duplicate transitions', async () => {
    const transitions = [
      {
        issueId: 'issue #1',
        timestamp: '2024-03-12T12:00:00',
        source: 'Backlog',
        destination: 'Ready for Dev',
      },
      {
        issueId: 'issue #1',
        timestamp: '2024-03-12T12:00:00',
        source: 'Backlog',
        destination: 'Ready for Dev',
      },
    ];

    await saveData({ data: transitions });

    const [{ count }] = await knex('transitions').count();
    expect(count).to.equal(1);
  });
});
