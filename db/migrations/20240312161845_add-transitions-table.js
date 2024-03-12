const TABLE_NAME = 'transitions';

export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').notNullable();
    table.string('issueId').notNullable();
    table.string('source').notNullable();
    table.string('destination').notNullable();
    table.timestamp('timestamp').notNullable();
    table.unique(['issueId', 'source', 'destination', 'timestamp']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
