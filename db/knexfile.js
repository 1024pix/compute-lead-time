import { env } from 'node:process';

function localPostgresEnv(databaseUrl, knexAsyncStacktraceEnabled) {
  return {
    client: 'postgresql',
    connection: databaseUrl,
    pool: {
      min: 1,
      max: 4,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
      stub: './migration-template.js',
      loadExtensions: ['.js'],
    },
    asyncStackTraces: knexAsyncStacktraceEnabled !== 'false',
  };
}
const environments = {
  development: localPostgresEnv(env.DATABASE_URL, env.KNEX_ASYNC_STACKTRACE_ENABLED),

  test: localPostgresEnv(env.TEST_DATABASE_URL, env.KNEX_ASYNC_STACKTRACE_ENABLED),

  production: {
    client: 'postgresql',
    connection: env.DATABASE_URL,
    pool: {
      min: Number.parseInt(env.DATABASE_CONNECTION_POOL_MIN_SIZE, 10) || 1,
      max: Number.parseInt(env.DATABASE_CONNECTION_POOL_MAX_SIZE, 10) || 4,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
      loadExtensions: ['.js'],
    },
    asyncStackTraces: env.KNEX_ASYNC_STACKTRACE_ENABLED !== 'false',
  },
};

export default environments;
