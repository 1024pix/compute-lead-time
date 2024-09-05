const TABLE_NAME = "issues";

export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments("id").notNullable();
    table.string("issueId").notNullable();
    table.string("label");
    table.unique(["issueId"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
