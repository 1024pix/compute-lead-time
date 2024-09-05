import chunk from "lodash/chunk.js";
import { knex } from "./db/knex-database-connection.js";

export async function saveData({ data }) {
  const trx = await knex.transaction();

  await saveIssues(
    data.map(({ labels, issueId }) => ({ label: labels[0], issueId })),
    trx,
  );

  await saveTransitions(
    data.flatMap(({ changelog }) => changelog),
    trx,
  );

  await trx.commit();
}

async function saveIssues(data, trx) {
  // eslint-disable-next-line no-console
  console.log("Total issues", data.length);

  const chunks = chunk(data, 1000);

  for (let i = 0; i < chunks.length; i++) {
    // eslint-disable-next-line no-console
    console.log("Saving chunk", i + 1, "of", chunks.length);
    const chunk = chunks[i];
    await trx("issues").insert(chunk).onConflict(["issueId"]).ignore();
  }
}

async function saveTransitions(data, trx) {
  // eslint-disable-next-line no-console
  console.log("Total transitions", data.length);

  const chunks = chunk(data, 1000);

  for (let i = 0; i < chunks.length; i++) {
    // eslint-disable-next-line no-console
    console.log("Saving chunk", i + 1, "of", chunks.length);
    const chunk = chunks[i];
    await trx("transitions")
      .insert(chunk)
      .onConflict(["issueId", "source", "destination", "timestamp"])
      .ignore();
  }
}
