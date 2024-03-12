import JiraClient from 'jira-client';
import { env } from 'node:process';

async function getStatusChangelog({ issueKey, jira }) {
  const issueChangelog = await jira.getIssueChangelog(issueKey);
  return issueChangelog.values
    .filter(change => change.items.some(item => item.field == 'status'))
    .map(({ id, created, items }) => ({ id, created, items }));
}

async function extractAllJiraIssuesInProduction({ jira }) {
  const JQL = `project = PIX AND "Parent Link" IS NOT EMPTY AND status = 'Deployed In Prod' AND "Date of MEP[Date]" > startOfMonth()`;
  const { total } = await jira.searchJira(JQL);
  const pages = Math.ceil(total / 100);

  for (let i = 0; i < 1; i++) {
    await extractIssueForGivenPage({ jira, jql: JQL, page: i })
  }
}

async function extractIssueForGivenPage({ jira, jql, page }) {
  const search = await jira.searchJira(jql, { maxResults: 100, startAt: page * 100 });

  for (const issue of search.issues) {
    const issueStatusChangelog = await getStatusChangelog({ issueKey: search.issues[0].key, jira });
    console.log(issueStatusChangelog)
  }
}


async function main() {
  const jira = new JiraClient({
    protocol: 'https',
    host: env.JIRA_HOST,
    username: env.JIRA_USERNAME,
    password: env.JIRA_PASSWORD,
    apiVersion: '2',
    strictSSL: true,
  });
  const average =  await extractAllJiraIssuesInProduction({ jira })
}

main()