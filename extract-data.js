export async function extractData({ jira }) {
  const JQL = `project = PIX
AND "project = PIX 
AND "Parent Link" IS NOT EMPTY 
AND status = 'Deployed In Prod' 
AND "Appli Pix?[Dropdown]" 
  IN (API, "Pix App", "Pix Admin", "Pix Orga", "Pix Certif", Pix1D)`;

  let result = await jira.searchJira(JQL, { fields: ['*all'], expand: 'transitions, operations, changelog' });

  const allIssues = [];

  while (result.isLast === false) {
    console.log('Extracting pages...');
    allIssues.push(...result.issues);
    result = await jira.searchJira(JQL, { nextPageToken: result.nextPageToken, fields: ['*all'], expand: 'transitions, operations, changelog' });
  }

  // for the last batch when is last is true
  allIssues.push(...result.issues);

  return await extractIssuesForGivenPage({
    jira,
    allIssues,
  });
}

async function extractIssuesForGivenPage({ jira, allIssues }) {
  const issues = [];
  for (const issue of allIssues) {
    const issueStatusChangelog = await getStatusChangelog({
      issueId: issue.key,
      jira,
    });
    issues.push({
      issueId: issue.key,
      labels: issue.fields.labels,
      changelog: issueStatusChangelog,
    });
  }
  return issues;
}

async function getStatusChangelog({ issueId, jira }) {
  const issueChangelog = await jira.getIssueChangelog(issueId);
  return issueChangelog.values.flatMap(({ created, items }) => {
    return items
      .filter(({ field }) => field === 'status')
      .map(({ fromString, toString }) => {
        return {
          issueId,
          timestamp: created,
          source: fromString,
          destination: toString,
        };
      });
  });
}