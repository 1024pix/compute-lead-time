import { env } from 'node:process';
import JiraClient from 'jira-client';
import { extractData } from './extract-data.js';

async function main() {
  const jira = new JiraClient({
    protocol: 'https',
    host: env.JIRA_HOST,
    username: env.JIRA_USERNAME,
    password: env.JIRA_PASSWORD,
    apiVersion: '2',
    strictSSL: true,
  });
  const data = await extractData({ jira });
  // eslint-disable-next-line no-console
  console.log({ data });
}

main();
