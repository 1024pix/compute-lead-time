export async function extractData({ jira }) {
  const JQL = `project = "PIX" AND assignee in (6380873100cb2fc3f987c9b1, 5f8d43f26bc6340068bc7aae, 6125042124912a0069e38346, 712020:3faa6a43-ec4d-40f9-9dff-01d762c7c67c, 625694763bf0f0007016df40, 712020:ba07efcf-be6f-4996-a77e-7234e352d3db) AND "Date of MEP[Date]" >= 2024-01-01 AND type NOT IN ("Sujet en conception", "Problème en investigation", Epic) AND parent not in (PIX-13545, PIX-13853)`;
  const { total } = await jira.searchJira(JQL);
  // eslint-disable-next-line no-console
  console.log("Total issues", total);
  const pages = Math.ceil(total / 100);

  const issues = [];
  for (let i = 0; i < pages; i++) {
    // eslint-disable-next-line no-console
    console.log("Extracting page", i + 1, "of", pages);
    const pageIssues = await extractIssuesForGivenPage({
      jira,
      jql: JQL,
      page: i,
    });
    issues.push(...pageIssues);
  }
  return issues;
}

async function extractIssuesForGivenPage({ jira, jql, page }) {
  const search = await jira.searchJira(jql, {
    maxResults: 100,
    startAt: page * 100,
  });

  const issues = [];
  for (const issue of search.issues) {
    const issueStatusChangelog = await getStatusChangelog({
      issueKey: issue.key,
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

async function getStatusChangelog({ issueKey, jira }) {
  const issueChangelog = await jira.getIssueChangelog(issueKey);
  return issueChangelog.values.flatMap(({ created, items }) => {
    return items
      .filter(({ field }) => field === "status")
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
