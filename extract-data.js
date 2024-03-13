export async function extractData({ jira }) {
  const JQL = `project = PIX AND "Parent Link" IS NOT EMPTY AND status = 'Deployed In Prod'`;
  const { total } = await jira.searchJira(JQL);
  const pages = Math.ceil(total / 100);

  const issues = [];
  for (let i = 0; i < pages; i++) {
    // eslint-disable-next-line no-console
    console.log('Extracting page', i + 1, 'of', pages);
    const pageIssues = await extractIssuesForGivenPage({ jira, jql: JQL, page: i });
    issues.push(...pageIssues);
  }
  return issues;
}

async function extractIssuesForGivenPage({ jira, jql, page }) {
  const search = await jira.searchJira(jql, { maxResults: 100, startAt: page * 100 });

  const issues = [];
  for (const issue of search.issues) {
    const issueStatusChangelog = await getStatusChangelog({ issueKey: issue.key, jira });
    issues.push(...issueStatusChangelog);
  }
  return issues;
}

async function getStatusChangelog({ issueKey, jira }) {
  const issueChangelog = await jira.getIssueChangelog(issueKey);
  return issueChangelog.values
    .flatMap(({ created, items }) => {
      return items
        .filter(({ field }) => field === 'status')
        .map(({ fromString, toString }) => {
          return {
            issueId: issueKey,
            timestamp: created,
            source: fromString,
            destination: toString,
          };
        });
    });
}
